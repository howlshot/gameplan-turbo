#!/usr/bin/env node

import http from "node:http";
import { spawn } from "node:child_process";

const HOST = process.env.PREFLIGHT_CODEX_BRIDGE_HOST || "127.0.0.1";
const PORT = Number(process.env.PREFLIGHT_CODEX_BRIDGE_PORT || "8765");
const MAX_BODY_BYTES = 1024 * 1024;
const BRIDGE_VERSION = "0.1.0";
const ALLOWED_ORIGIN = /^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/;

const createCorsHeaders = (origin) => ({
  "Access-Control-Allow-Origin":
    origin && ALLOWED_ORIGIN.test(origin) ? origin : "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type,Accept",
  Vary: "Origin"
});

const sendJson = (req, res, statusCode, payload) => {
  const corsHeaders = createCorsHeaders(req.headers.origin);
  res.writeHead(statusCode, {
    ...corsHeaders,
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(JSON.stringify(payload));
};

const runCommand = (command, args, options = {}) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd || process.cwd(),
      env: {
        ...process.env,
        NO_COLOR: "1"
      },
      stdio: ["pipe", "pipe", "pipe"]
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    if (typeof options.input === "string" && options.input.length > 0) {
      child.stdin.write(options.input);
    }
    child.stdin.end();

    child.on("error", (error) => {
      reject(error);
    });

    child.on("close", (code) => {
      resolve({
        code: code ?? 1,
        stdout,
        stderr
      });
    });
  });

const getCodexVersion = async () => {
  try {
    const result = await runCommand("codex", ["--version"]);
    if (result.code !== 0) {
      return null;
    }

    return result.stdout.trim() || null;
  } catch {
    return null;
  }
};

const getCodexAuthStatus = async () => {
  const codexVersion = await getCodexVersion();

  if (!codexVersion) {
    return {
      ok: false,
      bridgeVersion: BRIDGE_VERSION,
      codexVersion: null,
      cliAvailable: false,
      loggedIn: false,
      loginMethod: null,
      message: "Codex CLI was not found."
    };
  }

  const result = await runCommand("codex", ["login", "status"]);
  const combined = `${result.stdout}\n${result.stderr}`.trim();
  const loginMatch = combined.match(/Logged in using (.+)/i);
  const loggedIn = result.code === 0 && Boolean(loginMatch);

  return {
    ok: loggedIn,
    bridgeVersion: BRIDGE_VERSION,
    codexVersion,
    cliAvailable: true,
    loggedIn,
    loginMethod: loginMatch?.[1] ?? null,
    message: loggedIn
      ? combined || "Codex CLI is logged in."
      : combined || "Codex CLI is installed but not logged in."
  };
};

const buildExecArgs = ({ model }) => {
  const args = ["exec", "--skip-git-repo-check", "--json"];

  if (model && model !== "codex-default") {
    args.push("--model", model);
  }

  args.push("-");
  return args;
};

const extractAgentMessage = (stdout) => {
  const lines = stdout
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  let lastMessage = "";

  for (const line of lines) {
    if (!line.startsWith("{")) {
      continue;
    }

    try {
      const event = JSON.parse(line);
      const text = event?.item?.text;
      if (event?.type === "item.completed" && typeof text === "string") {
        lastMessage = text;
      }
    } catch {
      continue;
    }
  }

  return lastMessage.trim();
};

const readJsonBody = (req) =>
  new Promise((resolve, reject) => {
    let raw = "";
    let size = 0;

    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(new Error("Request body too large."));
        req.destroy();
        return;
      }

      raw += chunk.toString();
    });

    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        reject(new Error("Invalid JSON body."));
      }
    });

    req.on("error", (error) => reject(error));
  });

const server = http.createServer(async (req, res) => {
  if (!req.url || !req.method) {
    sendJson(req, res, 400, { error: "Malformed request." });
    return;
  }

  if (req.method === "OPTIONS") {
    res.writeHead(204, createCorsHeaders(req.headers.origin));
    res.end();
    return;
  }

  if (req.method === "GET" && req.url === "/health") {
    const status = await getCodexAuthStatus();
    sendJson(req, res, 200, status);
    return;
  }

  if (req.method === "GET" && req.url === "/auth/status") {
    const status = await getCodexAuthStatus();
    sendJson(req, res, 200, status);
    return;
  }

  if (req.method === "POST" && req.url === "/generate") {
    try {
      const status = await getCodexAuthStatus();

      if (!status.cliAvailable) {
        sendJson(req, res, 503, {
          error: "Codex CLI is not installed on this machine."
        });
        return;
      }

      if (!status.loggedIn) {
        sendJson(req, res, 401, {
          error: "Codex CLI is not logged in. Run `codex login` first."
        });
        return;
      }

      const body = await readJsonBody(req);
      const prompt =
        typeof body.prompt === "string" ? body.prompt.trim() : "";
      const model =
        typeof body.model === "string" ? body.model.trim() : "codex-default";

      if (!prompt) {
        sendJson(req, res, 400, { error: "Prompt is required." });
        return;
      }

      const result = await runCommand("codex", buildExecArgs({ model }), {
        input: prompt
      });
      const content = extractAgentMessage(result.stdout);

      if (result.code !== 0 || !content) {
        sendJson(req, res, 502, {
          error:
            result.stderr.trim() ||
            result.stdout.trim() ||
            "Codex bridge did not return a final message."
        });
        return;
      }

      sendJson(req, res, 200, {
        content
      });
      return;
    } catch (error) {
      sendJson(req, res, 500, {
        error:
          error instanceof Error
            ? error.message
            : "Unexpected Codex bridge error."
      });
      return;
    }
  }

  sendJson(req, res, 404, { error: "Not found." });
});

server.listen(PORT, HOST, () => {
  console.log(
    `[preflight-codex-bridge] listening on http://${HOST}:${PORT} using local Codex CLI`
  );
});

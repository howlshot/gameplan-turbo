#!/usr/bin/env node

import http from "node:http";
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const HOST =
  process.env.GAMEPLAN_TURBO_CLAUDE_BRIDGE_HOST ||
  process.env.PREFLIGHT_CLAUDE_BRIDGE_HOST ||
  "127.0.0.1";
const PORT = Number(
  process.env.GAMEPLAN_TURBO_CLAUDE_BRIDGE_PORT ||
    process.env.PREFLIGHT_CLAUDE_BRIDGE_PORT ||
    "8766"
);
const MAX_BODY_BYTES = 1024 * 1024;
const BRIDGE_VERSION = "0.1.0";
const CLAUDE_GENERATE_TIMEOUT_MS = 90_000;
const readPersistedBridgeToken = () => {
  try {
    return fs.readFileSync(path.join(os.homedir(), ".gameplan-turbo", "bridge-token"), "utf8");
  } catch {
    return "";
  }
};

const BRIDGE_TOKEN = (
  process.env.GAMEPLAN_TURBO_BRIDGE_TOKEN ||
  process.env.PREFLIGHT_BRIDGE_TOKEN ||
  readPersistedBridgeToken()
).trim();
const ALLOWED_ORIGINS = new Set(
  (
    process.env.GAMEPLAN_TURBO_ALLOWED_ORIGINS ||
    process.env.PREFLIGHT_ALLOWED_ORIGINS ||
    "http://127.0.0.1:5173,http://localhost:5173"
  )
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)
);
const BRIDGE_TOKEN_HEADER = "x-gameplan-bridge-token";
const GENERIC_BRIDGE_FAILURE =
  "Claude Code could not complete the request. Check the local bridge log for details.";

const isAllowedOrigin = (origin) =>
  typeof origin === "string" && ALLOWED_ORIGINS.has(origin);

const getBridgeTokenHeaderValue = (req) => {
  const value = req.headers[BRIDGE_TOKEN_HEADER];
  if (Array.isArray(value)) {
    return value[0]?.trim() ?? "";
  }

  return typeof value === "string" ? value.trim() : "";
};

const createCorsHeaders = (origin) => ({
  "Access-Control-Allow-Origin": isAllowedOrigin(origin) ? origin : "null",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type,Accept,X-Gameplan-Bridge-Token",
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

const rejectUnauthorizedRequest = (req, res) => {
  if (!isAllowedOrigin(req.headers.origin)) {
    sendJson(req, res, 403, {
      error:
        "This bridge only accepts requests from the local Gameplan Turbo app origin."
    });
    return true;
  }

  if (req.method === "OPTIONS") {
    return false;
  }

  if (!BRIDGE_TOKEN.trim()) {
    sendJson(req, res, 503, {
      error:
        "Bridge authentication is not configured. Relaunch the desktop app to restart the bridge securely."
    });
    return true;
  }

  if (getBridgeTokenHeaderValue(req) !== BRIDGE_TOKEN.trim()) {
    sendJson(req, res, 401, {
      error:
        "This bridge request could not be authenticated. Relaunch the desktop app and try again."
    });
    return true;
  }

  return false;
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
    let timedOut = false;
    let timeoutId = null;
    let killTimerId = null;

    const clearTimers = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }

      if (killTimerId) {
        clearTimeout(killTimerId);
        killTimerId = null;
      }
    };

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
      clearTimers();
      reject(error);
    });

    if (typeof options.timeoutMs === "number" && options.timeoutMs > 0) {
      timeoutId = setTimeout(() => {
        timedOut = true;
        stderr = `${stderr}${stderr ? "\n" : ""}Command timed out after ${options.timeoutMs}ms.`;
        child.kill("SIGTERM");
        killTimerId = setTimeout(() => {
          child.kill("SIGKILL");
        }, 1_000);
      }, options.timeoutMs);
    }

    child.on("close", (code) => {
      clearTimers();
      resolve({
        code: timedOut ? 124 : code ?? 1,
        stdout,
        stderr,
        timedOut
      });
    });
  });

const getClaudeVersion = async () => {
  try {
    const result = await runCommand("claude", ["--version"]);
    if (result.code !== 0) {
      return null;
    }

    return result.stdout.trim() || null;
  } catch {
    return null;
  }
};

const getClaudeAuthStatus = async () => {
  const claudeVersion = await getClaudeVersion();

  if (!claudeVersion) {
    return {
      ok: false,
      bridgeVersion: BRIDGE_VERSION,
      claudeVersion: null,
      cliAvailable: false,
      loggedIn: false,
      loginMethod: null,
      message: "Claude Code CLI was not found."
    };
  }

  const result = await runCommand("claude", ["auth", "status"]);
  const combined = `${result.stdout}\n${result.stderr}`.trim();
  const loginMatch = combined.match(/Logged in (?:using|with)\s+(.+)/i);
  const loggedIn = result.code === 0;

  return {
    ok: loggedIn,
    bridgeVersion: BRIDGE_VERSION,
    claudeVersion,
    cliAvailable: true,
    loggedIn,
    loginMethod: loginMatch?.[1] ?? null,
    message: loggedIn
      ? combined || "Claude Code CLI is logged in."
      : combined || "Claude Code CLI is installed but not logged in."
  };
};

const detectTerminalLauncher = () => {
  switch (process.platform) {
    case "darwin":
      return {
        command: "osascript",
        args: [
          "-e",
          'tell application "Terminal" to activate',
          "-e",
          'tell application "Terminal" to do script "claude auth login"'
        ]
      };
    case "linux":
      return {
        command: "sh",
        args: [
          "-lc",
          '(command -v x-terminal-emulator >/dev/null 2>&1 && exec x-terminal-emulator -e sh -lc "claude auth login; exec $SHELL") || (command -v gnome-terminal >/dev/null 2>&1 && exec gnome-terminal -- sh -lc "claude auth login; exec $SHELL") || (command -v konsole >/dev/null 2>&1 && exec konsole -e sh -lc "claude auth login; exec $SHELL")'
        ]
      };
    default:
      return null;
  }
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

  if (rejectUnauthorizedRequest(req, res)) {
    return;
  }

  if (req.method === "OPTIONS") {
    res.writeHead(204, createCorsHeaders(req.headers.origin));
    res.end();
    return;
  }

  if (req.method === "GET" && (req.url === "/health" || req.url === "/auth/status")) {
    const status = await getClaudeAuthStatus();
    sendJson(req, res, 200, status);
    return;
  }

  if (req.method === "POST" && req.url === "/generate") {
    try {
      const status = await getClaudeAuthStatus();

      if (!status.cliAvailable) {
        sendJson(req, res, 503, {
          error: "Claude Code CLI is not installed on this machine."
        });
        return;
      }

      if (!status.loggedIn) {
        sendJson(req, res, 401, {
          error: "Claude Code CLI is not logged in. Run `claude auth login` first."
        });
        return;
      }

      const body = await readJsonBody(req);
      const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";

      if (!prompt) {
        sendJson(req, res, 400, { error: "Prompt is required." });
        return;
      }

      const result = await runCommand("claude", ["-p", prompt], {
        timeoutMs: CLAUDE_GENERATE_TIMEOUT_MS
      });
      const content = result.stdout.trim();

      if (result.timedOut) {
        sendJson(req, res, 504, {
          error:
            "Claude Code took longer than 90 seconds to respond. Try a smaller output, reduce context, or retry."
        });
        return;
      }

      if (result.code !== 0 || !content) {
        sendJson(req, res, 502, {
          error: GENERIC_BRIDGE_FAILURE
        });
        return;
      }

      sendJson(req, res, 200, { content });
      return;
    } catch (error) {
      sendJson(req, res, 500, {
        error:
          error instanceof Error ? error.message : GENERIC_BRIDGE_FAILURE
      });
      return;
    }
  }

  if (req.method === "POST" && req.url === "/auth/open-login") {
    try {
      const status = await getClaudeAuthStatus();

      if (!status.cliAvailable) {
        sendJson(req, res, 503, {
          error: "Claude Code CLI is not installed on this machine."
        });
        return;
      }

      const body = await readJsonBody(req).catch(() => ({}));
      const dryRun =
        typeof body === "object" &&
        body !== null &&
        "dryRun" in body &&
        body.dryRun === true;

      const launcher = detectTerminalLauncher();

      if (!launcher) {
        sendJson(req, res, 501, {
          error:
            "Automatic login launch is not supported on this operating system yet. Run `claude auth login` manually."
        });
        return;
      }

      if (dryRun) {
        sendJson(req, res, 200, {
          ok: true,
          command: launcher.command,
          args: launcher.args
        });
        return;
      }

      const child = spawn(launcher.command, launcher.args, {
        cwd: process.cwd(),
        env: process.env,
        detached: true,
        stdio: "ignore"
      });
      child.unref();

      sendJson(req, res, 200, {
        ok: true,
        message: "Claude Code login flow opened in a local terminal window."
      });
      return;
    } catch (error) {
      sendJson(req, res, 500, {
        error:
          error instanceof Error
            ? error.message
            : "Could not launch the Claude Code login flow."
      });
      return;
    }
  }

  sendJson(req, res, 404, { error: "Not found." });
});

server.listen(PORT, HOST, () => {
  console.log(
    `[gameplan-turbo-claude-bridge] listening on http://${HOST}:${PORT} using local Claude Code CLI`
  );
});

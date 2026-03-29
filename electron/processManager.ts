import { mkdirSync } from "node:fs";
import { createWriteStream } from "node:fs";
import { once } from "node:events";
import { createServer as createNetServer, Socket } from "node:net";
import { join } from "node:path";
import { spawn, type ChildProcess } from "node:child_process";

export interface ManagedBridgeProcess {
  close: () => Promise<void>;
  port: number;
  url: string;
}

export const findAvailablePort = async (): Promise<number> =>
  new Promise((resolve, reject) => {
    const server = createNetServer();
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        reject(new Error("Could not determine an available port."));
        return;
      }

      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(address.port);
      });
    });
  });

export const waitForPort = async (
  host: string,
  port: number,
  timeoutMs = 10_000
): Promise<void> => {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    try {
      await new Promise<void>((resolve, reject) => {
        const socket = new Socket();

        socket.once("connect", () => {
          socket.end();
          resolve();
        });
        socket.once("error", reject);
        socket.connect(port, host);
      });
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 150));
    }
  }

  throw new Error(`Timed out waiting for ${host}:${port}.`);
};

const closeProcess = async (child: ChildProcess): Promise<void> => {
  if (child.killed || child.exitCode !== null) {
    return;
  }

  child.kill("SIGTERM");

  try {
    await Promise.race([
      once(child, "exit"),
      new Promise((resolve) => setTimeout(resolve, 2_000))
    ]);
  } catch {
    // Ignore exit listener failures.
  }

  if (child.exitCode === null && !child.killed) {
    child.kill("SIGKILL");
  }
};

export const startManagedBridgeProcess = async ({
  appOrigin,
  bridgeHost,
  bridgeToken,
  electronBinaryPath,
  logDir,
  name,
  port,
  scriptPath
}: {
  appOrigin: string;
  bridgeHost: string;
  bridgeToken: string;
  electronBinaryPath: string;
  logDir: string;
  name: "claude" | "codex";
  port: number;
  scriptPath: string;
}): Promise<ManagedBridgeProcess> => {
  mkdirSync(logDir, { recursive: true });
  const logStream = createWriteStream(join(logDir, `desktop-${name}-bridge.log`), {
    flags: "a"
  });

  const child = spawn(electronBinaryPath, [scriptPath], {
    env: {
      ...process.env,
      ELECTRON_RUN_AS_NODE: "1",
      GAMEPLAN_TURBO_ALLOWED_ORIGINS: `${appOrigin},${appOrigin.replace(
        "127.0.0.1",
        "localhost"
      )}`,
      GAMEPLAN_TURBO_BRIDGE_TOKEN: bridgeToken,
      ...(name === "codex"
        ? {
            GAMEPLAN_TURBO_CODEX_BRIDGE_HOST: bridgeHost,
            GAMEPLAN_TURBO_CODEX_BRIDGE_PORT: String(port)
          }
        : {
            GAMEPLAN_TURBO_CLAUDE_BRIDGE_HOST: bridgeHost,
            GAMEPLAN_TURBO_CLAUDE_BRIDGE_PORT: String(port)
          })
    },
    stdio: ["ignore", "pipe", "pipe"]
  });

  child.stdout.pipe(logStream);
  child.stderr.pipe(logStream);
  child.once("exit", () => {
    logStream.end();
  });

  await waitForPort(bridgeHost, port);

  return {
    port,
    url: `http://${bridgeHost}:${port}`,
    close: async () => {
      await closeProcess(child);
      logStream.end();
    }
  };
};

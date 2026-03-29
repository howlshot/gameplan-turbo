#!/usr/bin/env node

import { spawn } from "node:child_process";

const PROJECT_DIR = process.cwd();
const DEV_SERVER_URL = "http://127.0.0.1:5173";
const ELECTRON_ENTRY = "electron-dist/electron/main.js";

const run = (command, args, options = {}) =>
  spawn(command, args, {
    cwd: PROJECT_DIR,
    env: {
      ...process.env,
      ...options.env
    },
    stdio: "inherit"
  });

const waitForHttp = async (url, timeoutMs = 20_000) => {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(url, {
        method: "GET"
      });

      if (response.ok) {
        return;
      }
    } catch {
      // Keep polling until timeout.
    }

    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  throw new Error(`Timed out waiting for ${url}.`);
};

const compileElectron = async () =>
  new Promise((resolve, reject) => {
    const child = run("corepack", ["pnpm", "exec", "tsc", "-p", "tsconfig.electron.json", "--pretty", "false"]);

    child.once("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`Electron TypeScript build failed with exit code ${code ?? 1}.`));
    });
  });

const main = async () => {
  await compileElectron();

  const vite = run("corepack", ["pnpm", "dev", "--host", "127.0.0.1"]);

  const shutdown = () => {
    if (vite.exitCode === null) {
      vite.kill("SIGTERM");
    }
  };

  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);

  try {
    await waitForHttp(DEV_SERVER_URL);

    const electron = run("corepack", ["pnpm", "exec", "electron", ELECTRON_ENTRY], {
      env: {
        GAMEPLAN_TURBO_ELECTRON_DEV_SERVER_URL: DEV_SERVER_URL
      }
    });

    electron.once("exit", (code) => {
      shutdown();
      process.exit(code ?? 0);
    });
  } catch (error) {
    shutdown();
    throw error;
  }
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

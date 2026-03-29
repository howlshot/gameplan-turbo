#!/usr/bin/env node

import { chmodSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const PROJECT_DIR = join(SCRIPT_DIR, "..");
const SHIM_DIR = join(PROJECT_DIR, ".cache", "electron-builder-bin");
const PNPM_SHIM = join(SHIM_DIR, "pnpm");

const run = (command, args, extraEnv = {}) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: PROJECT_DIR,
      env: {
        ...process.env,
        ...extraEnv
      },
      stdio: "inherit"
    });

    child.once("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${command} exited with code ${code ?? 1}.`));
    });
  });

const ensurePnpmShim = () => {
  mkdirSync(SHIM_DIR, { recursive: true });

  if (!existsSync(PNPM_SHIM)) {
    writeFileSync(
      PNPM_SHIM,
      "#!/bin/sh\nexec corepack pnpm \"$@\"\n",
      "utf8"
    );
    chmodSync(PNPM_SHIM, 0o755);
  }

  return SHIM_DIR;
};

const main = async () => {
  const shimDir = ensurePnpmShim();
  const extraPath = `${shimDir}:${process.env.PATH ?? ""}`;

  await run("node", ["scripts/prepare-desktop-assets.mjs"]);
  await run("corepack", ["pnpm", "build"]);
  await run("corepack", ["pnpm", "exec", "electron-builder", ...process.argv.slice(2)], {
    CSC_IDENTITY_AUTO_DISCOVERY: "false",
    PATH: extraPath
  });
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

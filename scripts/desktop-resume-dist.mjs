#!/usr/bin/env node

import { existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const PROJECT_DIR = fileURLToPath(new URL("..", import.meta.url));
const PREPACKAGED_APP = join(PROJECT_DIR, "release", "mac-arm64", "Gameplan Turbo.app");

if (!existsSync(PREPACKAGED_APP)) {
  console.error(
    `No stapled app found at ${PREPACKAGED_APP}. Run the signed/notarized app flow first.`
  );
  process.exit(1);
}

const child = spawn(
  "corepack",
  [
    "pnpm",
    "exec",
    "electron-builder",
    "--prepackaged",
    PREPACKAGED_APP,
    "--mac",
    "dmg",
    "zip",
    "--publish",
    "never"
  ],
  {
    cwd: PROJECT_DIR,
    env: {
      ...process.env,
      GAMEPLAN_TURBO_SKIP_NOTARIZATION: "1"
    },
    stdio: "inherit"
  }
);

child.once("exit", (code) => {
  process.exit(code ?? 1);
});

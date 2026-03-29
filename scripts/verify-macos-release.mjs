#!/usr/bin/env node

import { existsSync } from "node:fs";
import { globSync } from "node:fs";
import { join } from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const PROJECT_DIR = fileURLToPath(new URL("..", import.meta.url));
const requireStaple = process.argv.includes("--require-staple");

const run = (command, args) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: PROJECT_DIR,
      stdio: "inherit",
      env: process.env
    });

    child.once("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${command} exited with code ${code ?? 1}.`));
    });
  });

const appPath =
  globSync(join(PROJECT_DIR, "release", "mac-*", "Gameplan Turbo.app")).sort()[0] ??
  "";

if (!appPath || !existsSync(appPath)) {
  console.error("No packaged macOS app found under release/mac-*/Gameplan Turbo.app");
  process.exit(1);
}

await run("codesign", ["--verify", "--deep", "--strict", "--verbose=2", appPath]);

try {
  await run("spctl", ["--assess", "--type", "execute", "--verbose=4", appPath]);
} catch (error) {
  console.error(
    "Gatekeeper rejected the app. The bundle is signed, but macOS still sees it as unnotarized. Configure a notarytool keychain profile and rerun the desktop distribution build."
  );
  process.exit(1);
}

try {
  await run("xcrun", ["stapler", "validate", "-v", appPath]);
} catch (error) {
  if (requireStaple) {
    throw error;
  }

  console.warn(
    "Stapler validation failed. The app is signed, but a stapled notarization ticket was not found yet."
  );
}

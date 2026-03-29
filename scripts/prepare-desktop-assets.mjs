#!/usr/bin/env node

import { existsSync, mkdirSync, rmSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const PROJECT_DIR = join(SCRIPT_DIR, "..");
const SOURCE_ICON = join(PROJECT_DIR, "public", "gameplan-turbo-icon.png");
const BUILD_RESOURCES_DIR = join(PROJECT_DIR, "build-resources");
const ICONSET_DIR = join(BUILD_RESOURCES_DIR, "gameplan-turbo.iconset");
const OUTPUT_ICNS = join(BUILD_RESOURCES_DIR, "gameplan-turbo.icns");

const ICON_SIZES = [16, 32, 128, 256, 512];

const run = (command, args) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: PROJECT_DIR,
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

const needsRegeneration = () => {
  if (!existsSync(OUTPUT_ICNS)) {
    return true;
  }

  return statSync(SOURCE_ICON).mtimeMs > statSync(OUTPUT_ICNS).mtimeMs;
};

const main = async () => {
  if (!existsSync(SOURCE_ICON)) {
    throw new Error(`Source icon not found at ${SOURCE_ICON}.`);
  }

  if (!needsRegeneration()) {
    return;
  }

  mkdirSync(BUILD_RESOURCES_DIR, { recursive: true });
  rmSync(ICONSET_DIR, { recursive: true, force: true });
  mkdirSync(ICONSET_DIR, { recursive: true });

  for (const size of ICON_SIZES) {
    await run("sips", [
      "-z",
      String(size),
      String(size),
      SOURCE_ICON,
      "--out",
      join(ICONSET_DIR, `icon_${size}x${size}.png`)
    ]);
    await run("sips", [
      "-z",
      String(size * 2),
      String(size * 2),
      SOURCE_ICON,
      "--out",
      join(ICONSET_DIR, `icon_${size}x${size}@2x.png`)
    ]);
  }

  await run("iconutil", ["-c", "icns", ICONSET_DIR, "-o", OUTPUT_ICNS]);
  rmSync(ICONSET_DIR, { recursive: true, force: true });
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

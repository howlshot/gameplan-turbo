#!/usr/bin/env node

import { chmodSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync, spawn } from "node:child_process";

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

const args = process.argv.slice(2);
const isDirectoryBuild = args.includes("--dir");

const findDeveloperIdIdentity = () => {
  try {
    const output = execFileSync("security", ["find-identity", "-v", "-p", "codesigning"], {
      cwd: PROJECT_DIR,
      encoding: "utf8"
    });
    const match = output.match(/"Developer ID Application: ([^"]+)"/);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
};

const main = async () => {
  const shimDir = ensurePnpmShim();
  const extraPath = `${shimDir}:${process.env.PATH ?? ""}`;
  const developerIdIdentity = findDeveloperIdIdentity();
  const extraEnv = {
    PATH: extraPath
  };
  const electronBuilderArgs = [...args];

  if (developerIdIdentity) {
    console.log(
      `[gameplan-turbo-desktop] Using Developer ID certificate for: ${developerIdIdentity}`
    );
    extraEnv.CSC_NAME = developerIdIdentity;
    extraEnv.CSC_IDENTITY_AUTO_DISCOVERY = "true";
  } else if (isDirectoryBuild || process.env.GAMEPLAN_TURBO_ALLOW_UNSIGNED === "1") {
    console.log(
      "[gameplan-turbo-desktop] No Developer ID Application certificate found. Building without distribution signing."
    );
    extraEnv.CSC_IDENTITY_AUTO_DISCOVERY = "false";
  } else {
    throw new Error(
      "No Developer ID Application certificate found. Install one in Keychain or rerun with GAMEPLAN_TURBO_ALLOW_UNSIGNED=1 for a local-only build."
    );
  }

  if (!isDirectoryBuild) {
    electronBuilderArgs.push("-c.mac.forceCodeSigning=true");
  }

  await run("node", ["scripts/prepare-desktop-assets.mjs"]);
  await run("corepack", ["pnpm", "build"]);
  await run("corepack", ["pnpm", "exec", "electron-builder", ...electronBuilderArgs], extraEnv);
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

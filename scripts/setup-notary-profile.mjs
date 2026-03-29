#!/usr/bin/env node

import { execFileSync, spawn } from "node:child_process";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output, exit } from "node:process";

const PROFILE_NAME =
  process.env.GAMEPLAN_TURBO_NOTARY_PROFILE || "gameplan-turbo";

const readArg = (flag) => {
  const index = process.argv.indexOf(flag);
  return index === -1 ? undefined : process.argv[index + 1];
};

const detectTeamId = () => {
  try {
    const outputText = execFileSync("security", ["find-identity", "-v", "-p", "codesigning"], {
      encoding: "utf8"
    });
    const match = outputText.match(/Developer ID Application: .* \(([A-Z0-9]+)\)/);
    return match?.[1];
  } catch {
    return undefined;
  }
};

const run = (command, args) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, {
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

const rl = createInterface({ input, output });

try {
  const appleId =
    readArg("--apple-id") ||
    process.env.APPLE_ID ||
    (await rl.question("Apple ID email for notarization: "));
  const detectedTeamId = detectTeamId();
  const teamId =
    readArg("--team-id") ||
    process.env.APPLE_TEAM_ID ||
    (detectedTeamId
      ? await rl.question(`Apple Team ID [${detectedTeamId}]: `)
      : await rl.question("Apple Team ID: "));

  await run("xcrun", [
    "notarytool",
    "store-credentials",
    PROFILE_NAME,
    "--apple-id",
    appleId.trim(),
    "--team-id",
    (teamId.trim() || detectedTeamId || "").trim()
  ]);

  output.write(
    `Stored notarization credentials under profile "${PROFILE_NAME}".\nUse GAMEPLAN_TURBO_NOTARY_PROFILE=${PROFILE_NAME} corepack pnpm desktop:dist for notarized desktop builds.\n`
  );
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  exit(1);
} finally {
  rl.close();
}

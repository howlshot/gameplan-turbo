const { rmSync } = require("node:fs");
const { spawn } = require("node:child_process");
const { join } = require("node:path");

const run = (command, args) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      env: process.env,
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

const runJson = (command, args) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"]
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.once("exit", (code) => {
      if (code !== 0) {
        reject(
          new Error(
            `${command} exited with code ${code ?? 1}.\n${stderr.trim() || stdout.trim()}`
          )
        );
        return;
      }

      try {
        resolve(JSON.parse(stdout));
      } catch (error) {
        reject(
          new Error(
            `Failed to parse JSON output from ${command}.\n${stdout}\n${
              error instanceof Error ? error.message : String(error)
            }`
          )
        );
      }
    });
  });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const zipForNotarization = async (appPath, zipPath) => {
  rmSync(zipPath, { force: true });
  await run("ditto", [
    "-c",
    "-k",
    "--sequesterRsrc",
    "--keepParent",
    appPath,
    zipPath
  ]);
};

const parseDurationMs = (value, fallbackMs) => {
  if (!value) {
    return fallbackMs;
  }

  const match = String(value)
    .trim()
    .match(/^(\d+)(ms|s|m|h)?$/i);

  if (!match) {
    return fallbackMs;
  }

  const amount = Number(match[1]);
  const unit = (match[2] || "s").toLowerCase();

  if (unit === "ms") {
    return amount;
  }

  if (unit === "m") {
    return amount * 60_000;
  }

  if (unit === "h") {
    return amount * 3_600_000;
  }

  return amount * 1_000;
};

const notaryAuthArgs = (keychainProfile) => ["--keychain-profile", keychainProfile];

const fetchNotaryLog = async (submissionId, keychainProfile) => {
  try {
    await run("xcrun", [
      "notarytool",
      "log",
      submissionId,
      ...notaryAuthArgs(keychainProfile)
    ]);
  } catch (error) {
    console.warn(
      `[gameplan-turbo-notary] Unable to fetch notarization log automatically: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
};

const waitForNotaryResult = async ({
  submissionId,
  keychainProfile,
  timeoutMs,
  pollMs,
  appPath
}) => {
  const startedAt = Date.now();
  let lastStatus = "Unknown";

  while (Date.now() - startedAt < timeoutMs) {
    const info = await runJson("xcrun", [
      "notarytool",
      "info",
      submissionId,
      ...notaryAuthArgs(keychainProfile),
      "--output-format",
      "json",
      "--no-progress"
    ]);

    lastStatus = info.status || lastStatus;
    console.log(`[gameplan-turbo-notary] Submission ${submissionId} status: ${lastStatus}`);

    if (lastStatus === "Accepted") {
      return info;
    }

    if (lastStatus === "Invalid" || lastStatus === "Rejected") {
      await fetchNotaryLog(submissionId, keychainProfile);
      throw new Error(
        `Apple notarization returned ${lastStatus} for submission ${submissionId}.`
      );
    }

    await sleep(pollMs);
  }

  throw new Error(
    `Apple notarization timed out after ${Math.round(timeoutMs / 60_000)} minutes.\n` +
      `Submission ID: ${submissionId}\n` +
      `Check later with:\n` +
      `xcrun notarytool info ${submissionId} --keychain-profile ${keychainProfile}\n` +
      `If Apple eventually accepts it, staple manually with:\n` +
      `xcrun stapler staple -v "${appPath}"`
  );
};

exports.default = async (context) => {
  if (context.electronPlatformName !== "darwin") {
    return;
  }

  if (process.env.GAMEPLAN_TURBO_SKIP_NOTARIZATION === "1") {
    console.log("[gameplan-turbo-notary] Skipping notarization because GAMEPLAN_TURBO_SKIP_NOTARIZATION=1.");
    return;
  }

  const keychainProfile =
    process.env.GAMEPLAN_TURBO_NOTARY_PROFILE ??
    process.env.APPLE_KEYCHAIN_PROFILE;

  if (!keychainProfile) {
    console.log(
      "[gameplan-turbo-notary] Skipping notarization. Set GAMEPLAN_TURBO_NOTARY_PROFILE or APPLE_KEYCHAIN_PROFILE after storing notarytool credentials."
    );
    return;
  }

  const appName = context.packager.appInfo.productFilename;
  const appPath = join(context.appOutDir, `${appName}.app`);
  const zipPath = join(context.appOutDir, `${appName}-notarize.zip`);
  const timeoutMs = parseDurationMs(process.env.GAMEPLAN_TURBO_NOTARY_TIMEOUT, 20 * 60_000);
  const pollMs = parseDurationMs(process.env.GAMEPLAN_TURBO_NOTARY_POLL_INTERVAL, 30_000);

  console.log(`[gameplan-turbo-notary] Creating notarization zip for ${appName}.app.`);
  await zipForNotarization(appPath, zipPath);

  console.log(
    `[gameplan-turbo-notary] Submitting ${appName}-notarize.zip with keychain profile "${keychainProfile}".`
  );

  const submission = await runJson("xcrun", [
    "notarytool",
    "submit",
    zipPath,
    ...notaryAuthArgs(keychainProfile),
    "--output-format",
    "json",
    "--no-progress"
  ]);

  const submissionId = submission.id;

  if (!submissionId) {
    throw new Error(
      `Apple notarization submission did not return an ID.\n${JSON.stringify(submission, null, 2)}`
    );
  }

  console.log(`[gameplan-turbo-notary] Submission ID: ${submissionId}`);
  console.log(
    `[gameplan-turbo-notary] Polling Apple notarization status every ${Math.round(
      pollMs / 1000
    )}s for up to ${Math.round(timeoutMs / 60_000)} minutes.`
  );

  await waitForNotaryResult({
    submissionId,
    keychainProfile,
    timeoutMs,
    pollMs,
    appPath
  });

  console.log(`[gameplan-turbo-notary] Stapling ${appName}.app.`);
  await run("xcrun", ["stapler", "staple", "-v", appPath]);
};

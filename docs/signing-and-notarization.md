# Signing and Notarization

This is the maintainer path for shipping a signed macOS desktop build of Gameplan Turbo.

## What you need

- an Apple Developer account
- a `Developer ID Application` certificate installed in your login keychain
- Xcode command line tools with `notarytool` and `stapler`
- an Apple notarization credential profile stored in your keychain

## One-time notarization credential setup

Run:

```bash
corepack pnpm desktop:notary:setup
```

The script will prompt for:

- your Apple ID email
- your Team ID
- your app-specific password through Apple's secure `notarytool` prompt

It stores the profile under `gameplan-turbo` by default.

## Signed local package build

```bash
corepack pnpm desktop:build
```

This creates a signed packaged app directory under `release/mac-*/`.

## Signed and notarized release build

```bash
GAMEPLAN_TURBO_NOTARY_PROFILE=gameplan-turbo corepack pnpm desktop:dist
```

That build will:

- sign the app with the installed `Developer ID Application` certificate
- notarize the app with `notarytool`
- staple the notarization ticket to the `.app`
- package the notarized app into the release artifacts

By default, the notarization poll step waits up to 20 minutes and checks Apple every 30 seconds.

Optional environment overrides:

```bash
GAMEPLAN_TURBO_NOTARY_TIMEOUT=30m
GAMEPLAN_TURBO_NOTARY_POLL_INTERVAL=60s
```

If Apple keeps a submission stuck in `In Progress`, the build now fails with the submission ID and the exact follow-up commands to:

- check the status later with `xcrun notarytool info`
- staple the app manually if Apple eventually accepts it
- rebuild fresh `.dmg` / `.zip` artifacts from the stapled app with `corepack pnpm desktop:dist:resume`

## Verification

```bash
corepack pnpm desktop:verify -- --require-staple
```

This runs:

- `codesign --verify`
- `spctl --assess`
- `stapler validate`

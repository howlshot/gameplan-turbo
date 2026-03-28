# Public Repo Scrub Checklist

Date: 2026-03-28

Goal: prepare this repository for a public open-source release without leaking personal environment details or shipping obviously private/local artifacts.

## Release Blockers

- [ ] Remove the absolute local path from `docs/audits/2026-03-27-gameplan-turbo-end-to-end-audit.md`.
- [ ] Decide whether `docs/audits/` should ship publicly at all.
- [ ] Remove `.qwen/settings.json` from the tracked tree.
- [ ] Rewrite or replace private history that still contains `/Users/<username>/...` paths in old scripts and UI instructions.
- [ ] Fix CSP `connect-src` so the public provider list matches the actual browser policy.

## Current Tree Scrub

- [ ] Re-scan tracked files for:
  - `/Users/`
  - `/home/`
  - usernames
  - local log paths
  - author-specific setup notes
- [ ] Verify no generated local artifacts are tracked:
  - `.playwright-cli/`
  - local logs
  - temporary exports
  - browser download output
- [ ] Review `docs/behind-the-scenes/` for public suitability.
- [ ] Review `docs/audits/` for public suitability.
- [ ] Review `README.md`, install docs, and settings/help copy for author-specific workflow assumptions.

## Git History Scrub

- [ ] Remove or replace commits containing absolute home-directory paths.
- [ ] Re-run a history scan for:
  - `/Users/`
  - `/home/`
  - `sk-`
  - `Bearer `
  - `PRIVATE KEY`
  - `api_key=`
- [ ] Publish from a cleaned branch/repo if preserving private history is not required.

## Local / Tool-Specific Files

- [ ] Ensure `.qwen/` stays ignored and untracked.
- [ ] Verify no editor/tool config meant for one machine remains tracked:
  - terminal permission files
  - machine-specific launcher output
  - personal prompt caches
- [ ] Confirm launcher scripts only use dynamic paths such as `$HOME` or repo-relative paths in the current tree.

## Security Hardening Before Public Release

- [ ] Add a caller-auth mechanism to Codex and Claude bridges.
- [ ] Restrict bridge origins to the exact app origin(s), not any localhost origin.
- [ ] Add OpenRouter OAuth `state` validation.
- [ ] Decide whether locally stored provider keys need keystore integration or an explicit “stored locally in plaintext” warning.
- [ ] Remove or quarantine the dormant Ship credential-manager feature from the public release.

## Public Release Sign-Off

- [ ] Current tree contains no personal paths or tracked local config.
- [ ] Git history has been reviewed or rewritten appropriately.
- [ ] Security blockers from the audit are resolved or explicitly accepted with documented rationale.
- [ ] A final fresh clone/build audit has been run before making the repo public.

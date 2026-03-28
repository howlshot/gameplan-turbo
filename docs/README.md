# Gameplan Turbo Docs

This is the public docs starting point for the current Gameplan Turbo product.

## Current docs

- [Getting started](getting-started/installation.md)
- [Product overview](product-overview.md)
- [Architecture overview](architecture-overview.md)
- [Using with Codex for game projects](using-with-codex-for-games.md)
- [Migration from the upstream Preflight project](migration-from-preflight.md)

## Current product direction

Gameplan Turbo is:

- planning-first
- optional-AI
- browser and local-storage based
- explicit about local-tool bridges such as Codex and Claude Code

The main workflow is:

1. define the game in the planning modules
2. gather references in `Vault`
3. generate the `Build Roadmap` in `Prompt Lab`
4. generate outputs in `Output Library`
5. export the planning package for handoff

## Legacy docs

Some inherited docs from the upstream Preflight project are still present for historical context. They are not the source of truth for the current Gameplan Turbo product.

Legacy entry points:

- [Legacy user guide index](user-guide/README.md)
- [Legacy architecture notes](technical/architecture.md)

If a legacy doc conflicts with the current product overview or getting-started guide, trust the current Gameplan Turbo docs.

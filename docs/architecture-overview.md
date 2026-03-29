# Architecture Overview

## Frontend shell

- React 18
- Vite
- Tailwind CSS
- React Router

The UI remains a browser-only single-page app with a persistent sidebar workspace shell.

## Local data model

- Dexie / IndexedDB
- Database name: `gameplan-turbo`

Primary tables:

- `projects`
- `gameDesignDocs`
- `artifacts`
- `buildStages`
- `vaultFiles`
- `aiProviders`
- `agentSystemPrompts`
- `appSettings`

## State model

- Zustand handles selected project, active tab, command palette, sidebar state, and toast state.
- Dexie live queries handle persistent domain data and autosave-style reactivity.

## AI provider layer

Preserved from the upstream app:

- provider abstraction
- dynamic provider loading
- retries
- checkpoint support
- streaming output
- BYOK configuration

The fork also adds an optional localhost Codex bridge. That bridge shells out to the installed `codex` CLI, so users can route generations through their existing ChatGPT-backed Codex login without putting OAuth tokens into the browser app.

The legacy database import and checkpoint compatibility remain in the codebase only to help older local Preflight installs migrate safely into Gameplan Turbo. They are not part of the current public product surface.

On first launch, the renamed app can also import existing browser data from the prior `preflight-game-os` IndexedDB name before continuing under `gameplan-turbo`.

This means the product can stay local-first while still supporting external generation when keys are configured or when the local Codex bridge is available.

## Generation architecture

### Build roadmap

`src/services/generation/buildGeneration.ts` now generates game-specific roadmap stages and stage briefs locally from the design doc and template bias.

### Prompt Lab

`src/services/generation/promptLabGeneration.ts` builds structured context from:

- project metadata
- game design doc
- build roadmap stages
- active vault files

If an AI provider exists, Prompt Lab routes through the provider layer. If not, it falls back to deterministic local output generation so the product remains useful before AI setup.

## Compatibility layer

Some legacy types and hooks remain available so the repo can be refactored in place without destabilizing unrelated code during the fork. The visible product path, however, is now game-first.

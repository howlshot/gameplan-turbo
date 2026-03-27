# Architecture Overview

## Frontend shell

- React 18
- Vite
- Tailwind CSS
- React Router

The UI remains a browser-only single-page app with a persistent sidebar workspace shell.

## Local data model

- Dexie / IndexedDB
- Database name: `preflight-game-os`

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

This means the product can stay local-first while still supporting external generation when keys are configured.

## Generation architecture

### Build Plan

`src/services/generation/buildGeneration.ts` now generates game-specific stage prompts locally from the design doc and template bias.

### Prompt Lab

`src/services/generation/promptLabGeneration.ts` builds structured context from:

- project metadata
- game design doc
- build stages
- active vault files

If an AI provider exists, Prompt Lab routes through the provider layer. If not, it falls back to deterministic local output generation so the product remains useful before AI setup.

## Compatibility layer

Some legacy types and hooks remain available so the repo can be refactored in place without destabilizing unrelated code during the fork. The visible product path, however, is now game-first.

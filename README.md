# Gameplan Turbo

Gameplan Turbo helps solo developers and small teams turn a rough game idea into a complete, usable production plan. Use it to shape the core loop, pressure-test mechanics, generate polished game-development prompts and briefs, and keep your roadmap, references, and outputs aligned as the project moves toward a playable build.

## What the app does

- capture the game in structured modules: `Concept`, `Design Pillars`, `Core Loop`, `Controls & Feel`, `Content Bible`, `Art & Tone`, and `Technical Design`
- gather references, mocks, and notes in `Vault`
- generate a staged `Build Roadmap` in `Prompt Lab`
- generate copy-ready planning outputs in `Output Library`
- track project phase from `Concept` through `Release Prep`
- export a full planning package as a `.zip`

## What works without AI

Gameplan Turbo is usable before you connect any provider.

Without AI configured, you can:

- create and edit projects
- fill out all planning modules
- manage `Vault` references
- generate the local `Build Roadmap`
- track roadmap stages and project phase
- export the roadmap and planning package

AI is only required for model-generated outputs and planning-question assists.

## Try in browser or run locally

- **Browser-hosted mode** is the fastest way to share or evaluate the app. It is great for planning, roadmap generation, exports, OpenRouter, and API-key providers.
- **Local desktop mode** is what you want if you also need bridge-based sign-in with `Codex` or `Claude Code`.
- Local bridge providers are intentionally not available from the hosted web app.

## Quick start

- If you just want to use Gameplan Turbo, do not clone the repo. Start here:
- Try instantly in browser: [gameplan-turbo.vercel.app](https://gameplan-turbo.vercel.app)
- Download the macOS desktop app: [latest release](https://github.com/howlshot/gameplan-turbo/releases/latest)
- The desktop package is the easiest path for `Codex` and `Claude Code` integrations.

### Desktop package contents

- `Gameplan Turbo-...dmg` for the normal macOS install flow
- `Gameplan Turbo-...zip` as a fallback if the DMG gives you trouble
- New desktop builds are published through GitHub Releases

## Contributor setup
```bash
git clone https://github.com/howlshot/gameplan-turbo.git
cd gameplan-turbo
corepack pnpm install
corepack pnpm dev
```

Open the local dev URL printed by Vite, usually [http://127.0.0.1:5173](http://127.0.0.1:5173).

## Optional AI setup

Gameplan Turbo supports a mix of login-based local-tool integrations and hosted/API-key providers.

### Sign in providers

- `Codex` via local bridge
- `Claude Code` via local bridge
- `OpenRouter` via browser sign-in or API key

If you use the desktop launcher, it will try to start the local bridges for Codex and Claude Code automatically. If you run the web app manually, you can start them yourself:

```bash
corepack pnpm codex:bridge
corepack pnpm claude:bridge
```

### API-key providers

- `Anthropic`
- `OpenAI`
- `Google`
- `DeepSeek`
- `Groq`
- `Qwen`
- `GLM / Zhipu`
- `Kimi / Moonshot`
- `MiniMax`
- `Custom` for OpenAI-compatible endpoints, including local endpoints like LM Studio, Ollama, or vLLM

## Typical workflow

1. Create a game project and define the core identity.
2. Fill the design modules until the game intent is stable.
3. Add references, mocks, and notes to `Vault`.
4. Use `Prompt Lab` to run clarifying questions and generate the `Build Roadmap`.
5. Use `Output Library` to generate planning outputs such as the full game design document, milestone roadmap, risk register, and staged implementation prompts.
6. Export a planning package for handoff to your build environment.

## Development

```bash
corepack pnpm typecheck
corepack pnpm test
corepack pnpm build
```

## Documentation

- [Docs index](docs/README.md)
- [Getting started](docs/getting-started/installation.md)
- [Product overview](docs/product-overview.md)
- [Architecture overview](docs/architecture-overview.md)
- [Using with Codex for game projects](docs/using-with-codex-for-games.md)
- [Migration from the upstream Preflight project](docs/migration-from-preflight.md)

## Legacy note

The repository still contains some inherited Preflight-era docs for historical context. The files linked from `README.md` and `docs/README.md` are the current public starting point; older Preflight guides are marked as legacy where they remain in the tree.

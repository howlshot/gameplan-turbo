# Gameplan Turbo

Gameplan Turbo is a planning-first game development workspace for small teams and solo builders using AI tools. It helps you move from concept to design intent, build roadmap, and export-ready planning docs without turning the app into a game engine or code runner.

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

## Quick start

```bash
git clone https://github.com/howlshot/gameplan-turbo.git
cd gameplan-turbo
corepack pnpm install
corepack pnpm dev
```

Open [http://127.0.0.1:5173](http://127.0.0.1:5173).

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

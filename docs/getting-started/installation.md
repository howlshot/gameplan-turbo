# Getting Started with Gameplan Turbo

This guide covers the current open-source setup for Gameplan Turbo.

## Fastest ways to try it

- Browser version: [gameplan-turbo.vercel.app](https://gameplan-turbo.vercel.app)
- macOS desktop alpha: [latest release](https://github.com/howlshot/gameplan-turbo/releases/latest)

Use the browser version if you want to try planning, roadmap generation, exports, or hosted providers quickly. Use the desktop build if you want local bridge integrations like `Codex` or `Claude Code`.

## Contributor prerequisites

- Node.js 20 or newer
- `corepack` enabled so `pnpm` is available
- Git

Optional, only if you want login-based local-tool integrations while developing locally:

- `codex` CLI for Codex sign-in
- `claude` CLI for Claude Code sign-in

## Contributor install and run

```bash
git clone https://github.com/howlshot/gameplan-turbo.git
cd gameplan-turbo
corepack pnpm install
corepack pnpm dev
```

Open the local dev URL printed by Vite, usually [http://127.0.0.1:5173](http://127.0.0.1:5173).

## Browser-hosted mode vs local desktop mode

- **Browser-hosted mode** is ideal if you want to try the app quickly or share it with other people. Planning, roadmap generation, exports, OpenRouter, and API-key providers all work well there.
- **Local desktop mode** is required for `Codex` and `Claude Code`, because those integrations use local bridges to talk to your installed CLI tools.
- If you only want to evaluate the planning workflow first, the hosted app is enough.

## What you can do before connecting AI

Gameplan Turbo is intentionally useful without any provider configured.

You can:

- create projects
- fill every planning module
- manage references in `Vault`
- generate the local `Build Roadmap`
- track roadmap stage progress and project phase
- export the roadmap and planning package

You only need AI when you want generated outputs or planning-question assists in `Prompt Lab` or `Output Library`.

## Optional AI connection paths

### 1. Sign in with local tools

These integrations use a local bridge and do not store the tool's OAuth session in the browser app. They are available in the desktop build or in a contributor local run, not in the hosted web app.

#### Codex

```bash
codex login
corepack pnpm codex:bridge
```

Then connect `Codex` from onboarding or `Settings`.

#### Claude Code

```bash
claude auth login
corepack pnpm claude:bridge
```

Then connect `Claude Code` from onboarding or `Settings`.

### 2. Sign in with OpenRouter

`OpenRouter` supports browser sign-in from onboarding or `Settings`. You can also connect it with an API key instead if you prefer.

### 3. Use API-key providers

Supported hosted providers include:

- `Anthropic`
- `OpenAI`
- `Google`
- `DeepSeek`
- `Groq`
- `Qwen`
- `GLM / Zhipu`
- `Kimi / Moonshot`
- `MiniMax`

### 4. Use a custom OpenAI-compatible endpoint

`Custom` supports:

- base URL
- model ID
- optional API key

This is the right path for local or self-hosted endpoints such as LM Studio, Ollama's OpenAI-compatible server, or vLLM.

## First project flow

1. Create a game project.
2. Fill `Concept`, `Design Pillars`, `Core Loop`, and `Controls & Feel`.
3. Add any mocks, references, or research to `Vault`.
4. Open `Prompt Lab` and generate the `Build Roadmap`.
5. Open `Output Library` to generate the full game design document, milestone roadmap, risk register, or staged implementation prompts.
6. Export the planning package when you want a portable handoff bundle.

## Troubleshooting

### "Connect AI to generate" appears in Prompt Lab or Output Library

That means the feature you clicked is AI-backed and no default provider is connected yet. You can still plan, track, and generate the roadmap without AI. Connect a provider in onboarding or `Settings` when you want generated outputs or planning help.

### A Codex or Claude bridge says it is offline

If you launched the desktop app, reopen it first. If you are running the contributor web app manually, start the bridge from the terminal:

```bash
corepack pnpm codex:bridge
corepack pnpm claude:bridge
```

### I only want to evaluate the app first

Skip AI setup. Roadmap generation and the planning surfaces still work without it.

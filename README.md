# Preflight Game OS

Preflight Game OS is a local-first game design operating system for AI-assisted builders. It takes the original Preflight shell and refocuses it on game concept development, design pillars, playable-loop planning, staged implementation prompts, and vault-backed context for tools like Codex, Cursor, Claude Code, and Qwen Code.

## What changed

- The workspace is now game-native: `Concept`, `Design Pillars`, `Core Loop`, `Controls & Feel`, `Content Bible`, `Art & Tone`, `Technical Design`, `Build Plan`, `Vault`, and `Prompt Lab`.
- Projects are modeled as game projects, not generic apps.
- Build planning is staged around first playable, combat feel, encounter scripting, HUD, progression, content slice, and release prep.
- Prompt Lab generates game-focused outputs: one-page pitch, mini/full GDD, vertical slice plan, milestone roadmap, agent system prompt, staged implementation prompts, art packet, asset grocery list, playtest checklist, risk register, and cut list.
- The first built-in template is `Arcade Action / Rail Shooter`.

## What stayed the same

- Browser-only, local-first architecture
- Dexie + IndexedDB persistence
- Zustand stores
- BYOK AI provider support
- Streaming provider execution
- Vault storage and context injection
- Copy/download-first export flows

## Quick start

```bash
git clone https://github.com/Meykiio/preflight.git preflight-game-os
cd preflight-game-os
corepack pnpm install
corepack pnpm dev
```

Open [http://localhost:5173](http://localhost:5173). The app works without AI keys; add providers later in `Settings` if you want generated outputs from external models.

### Optional: use your ChatGPT-backed Codex login

If you want Prompt Lab to run through the local Codex CLI instead of an API key:

```bash
codex login
corepack pnpm codex:bridge
```

Then open `Settings`, connect `Codex (ChatGPT login)`, and set it as the default provider.

## Core workflow

1. Create a game project from `Blank Game Project` or `Arcade Action / Rail Shooter`.
2. Fill the concept, pillars, loop, feel, content, art, and technical sections.
3. Generate a staged `Build Plan`.
4. Use `Prompt Lab` to generate GDDs, system prompts, roadmap docs, and implementation prompts.
5. Keep references, mockups, screenshots, and playtest notes in the `Vault`.

## v1 focus

Preflight Game OS v1 is optimized for small-scope action and arcade-style games, especially:

- arcade action
- rail shooters
- character action lite
- survival-horror-lite
- mobile action games

## Development

```bash
corepack pnpm typecheck
corepack pnpm test
corepack pnpm build
```

## Documentation

- [Docs index](docs/README.md)
- [Migration from original Preflight](docs/migration-from-preflight.md)
- [Product overview](docs/product-overview.md)
- [Architecture overview](docs/architecture-overview.md)
- [Using with Codex for game projects](docs/using-with-codex-for-games.md)
- [Virtua Cop-style mobile rail shooter example](docs/examples/virtua-cop-mobile-rail-shooter.md)
- [Assumptions](ASSUMPTIONS.md)

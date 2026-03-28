# Migration From Original Preflight

## Preserved architecture

- React + Vite shell
- Dexie / IndexedDB local persistence
- Zustand UI and selection state
- BYOK AI provider layer and streaming generation
- Vault storage pattern
- Copy/export-first output workflow

## Replaced product model

Original Preflight centered on:

- structured app briefs
- research prompts
- design prompts for app UI tools
- PRDs and system instructions for SaaS / web builds
- app-style build stages such as auth, database, deployment

Gameplan Turbo centers on:

- game concept definition
- design pillars and feel targets
- core loop and content planning
- technical constraints for playable builds
- staged implementation prompts for AI coding agents

## Data model migration

- `Project` now stores game-specific metadata: title, pitch, genre, scope, platform targets, agent targets, monetization model, and engine preference.
- `Brief` has been replaced in the visible product by `GameDesignDoc`.
- The app now uses the IndexedDB name `gameplan-turbo`.
- On first launch, it can import existing local data from the older `preflight-game-os` DB before continuing under the renamed app.
- JSON import accepts legacy Preflight exports and maps `briefs` into `GameDesignDoc` records.

## Navigation migration

Old:

- Brief
- Research
- Design
- PRD
- Build
- Ship
- Vault

New:

- Concept
- Design Pillars
- Core Loop
- Controls & Feel
- Content Bible
- Art & Tone
- Technical Design
- Build Plan
- Vault
- Prompt Lab

## Lowest-risk refactor strategy used

1. Keep the provider, export, and persistence primitives.
2. Replace the domain model and creation flow.
3. Swap the workspace IA and routed pages.
4. Add game-focused build-plan and prompt-lab generation.
5. Keep compatibility shims only where needed to avoid breaking legacy files during the fork transition.

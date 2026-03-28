# Using Gameplan Turbo With Codex

## Direct Codex bridge setup

If you want Gameplan Turbo to generate outputs through your local ChatGPT-backed Codex login:

1. Run `codex login`
2. Run `corepack pnpm codex:bridge`
3. Open `Settings`
4. Connect `Codex (ChatGPT login)`
5. Set it as the default provider

This route uses the local Codex CLI as a bridge. The browser app does not store your ChatGPT OAuth tokens.

## Recommended flow

1. Fill `Concept`, `Design Pillars`, `Core Loop`, and `Controls & Feel` before you ask Codex to implement anything.
2. Generate the `Full GDD` or `Mini GDD` in `Prompt Lab`.
3. Generate the `Agent System Prompt` with target tool set to `Codex`.
4. Generate the `Staged Implementation Prompts`.
5. Generate the `Build Roadmap` in `Prompt Lab` and work through it stage by stage, not all at once.

## What to paste into Codex

Use three layers of context:

1. The system prompt from `Prompt Lab`
2. The current stage brief from the `Build Roadmap` in `Prompt Lab`
3. Any supporting notes from `Vault` that are relevant to the current stage

## Good Codex rhythm

- stage one playable systems before content expansion
- keep prompts small and tied to one stage
- prefer one mechanic or loop refinement at a time
- use the design pillars as hard constraints
- revisit the cut list whenever scope expands

## Suggested order

- Foundation
- First Playable
- Core Controls
- Camera / Movement
- Combat Feel
- Enemy Behavior
- Encounter Scripting
- HUD / Feedback
- Progression / Meta
- Content Slice
- Polish
- Packaging / Release Prep

## What not to do

- do not jump straight to content breadth before first playable quality exists
- do not ask Codex to invent the game pillar set mid-implementation
- do not let stage prompts drift into backend/admin tooling that is irrelevant to the game
- do not treat the build roadmap as a todo list without checking feel and readability after each stage

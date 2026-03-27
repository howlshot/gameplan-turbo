# Using Preflight Game OS With Codex

## Recommended flow

1. Fill `Concept`, `Design Pillars`, `Core Loop`, and `Controls & Feel` before you ask Codex to implement anything.
2. Generate the `Full GDD` or `Mini GDD` in `Prompt Lab`.
3. Generate the `Agent System Prompt` with target tool set to `Codex`.
4. Generate the `Staged Implementation Prompts`.
5. Work through `Build Plan` stage by stage, not all at once.

## What to paste into Codex

Use three layers of context:

1. The system prompt from `Prompt Lab`
2. The current stage prompt from `Build Plan`
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
- do not treat the build plan as a todo list without checking feel and readability after each stage

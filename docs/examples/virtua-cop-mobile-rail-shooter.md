# Virtua Cop-Style Mobile Rail Shooter Example

## Product framing

- Fantasy: elite responder clearing tightly staged urban ambushes
- Genre: arcade action / rail shooter
- Target platforms: iOS, Android, optional PC
- Session length: 5 to 10 minutes
- Scope: small

## Design priorities

- threats must read instantly on a phone
- cover, reload, and score pressure need a clear rhythm
- mirrored utility buttons matter for handedness and thumb reach
- authored camera rails should still feel player-controlled because aiming and timing remain fully owned by the player

## Suggested first playable

- one short chapter
- one enemy pop-up role
- one armored variant
- one reload / cover loop
- one combo chain
- one fail state
- one score grade screen

## Build-plan emphasis

- `Core Controls`: aim drag, fire response, mirrored reload / cover buttons
- `Camera / Movement`: authored rail path, target framing, mobile-safe camera shake
- `Combat Feel`: hit sparks, shot cadence, reload rhythm, score feedback
- `Enemy Behavior`: pop-up timing, telegraph readability, silhouette contrast
- `Encounter Scripting`: spawn waves that support combo routes and cover timing
- `HUD / Feedback`: readable reticle, health, combo chain, chapter-grade UI

## Prompt-lab outputs worth generating first

- mini GDD
- vertical slice plan
- agent system prompt for Codex
- staged implementation prompts
- playtest checklist
- cut list

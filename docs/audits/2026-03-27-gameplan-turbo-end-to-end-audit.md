# Gameplan Turbo End-to-End Audit

Date: 2026-03-27

Scope: current local WIP in `<workspace-root>`

Baseline checks:
- `corepack pnpm typecheck` passed
- `corepack pnpm test` passed (`18` files, `97` tests)
- `corepack pnpm build` passed
- Build warning: main Vite chunk `dist/assets/index-DPW8IdTq.js` is `534.49 kB` minified

Browser method:
- Real browser audit via Playwright CLI
- Cold session for first-launch and onboarding
- Persisted-session checks via reload inside the same browser session
- Codex bridge path validated at the UX layer

## What Already Works Well
- The genre-first project creation flow is materially better than the earlier preset-card version. `Horror -> Survival Horror`, `Action -> First-Person Shooter`, and `Other / Custom` all surfaced coherent recommendations without forcing a visible template system.
- Recommendation ownership works. Editing `Typical Session` changed the UI into a user-owned state, and `Reset to recommendations` restored the hidden-profile baseline correctly.
- Local-first Build Plan generation works before any additional provider setup. Both the horror project and the action project generated staged plans from workspace data.
- Vault upload works. Uploading `gameplan-turbo-icon.png` created a vault item, updated the metrics, and exposed the file as active context.
- Settings gives a clear picture of provider state, especially for the Codex bridge path. The bridge-ready state, reconnect actions, default model routing, and launcher toggles are understandable.
- Refreshing after project creation preserved the project and recovered the workspace rather than dropping back to onboarding.

## Confirmed Defects

### 1. Technical Design crashes the workspace
- Severity: critical
- Reproducibility: always in the audited WIP
- Repro:
  1. Create or open a project
  2. Open `Technical Design`
- Expected:
  - The page loads and allows editing engine/pipeline fields
- Actual:
  - The page throws a hook-order error and the global error boundary replaces the workspace
- Evidence:
  - Screenshot state: `.playwright-cli/page-2026-03-27T19-05-58-143Z.yml`
  - Console stack: `.playwright-cli/console-2026-03-27T18-45-32-880Z.log`
- Likely source area:
  - `src/pages/workspace/TechnicalDesignPage.tsx:36-55`
  - `useState` and `useEffect` are declared after an early return path, which changes hook order once `project` and `gameDesignDoc` resolve
- Recommended next action: fix now

### 2. Command Palette crashes on open
- Severity: critical
- Reproducibility: always in the audited WIP
- Repro:
  1. Open the app
  2. Press `Cmd+K`
- Expected:
  - The global command palette opens
- Actual:
  - The app throws a hook-order error and falls into the global error boundary
- Evidence:
  - Console stack: `.playwright-cli/console-2026-03-27T19-10-03-811Z.log`
  - Crash state: `.playwright-cli/page-2026-03-27T19-08-17-633Z.yml`
- Likely source area:
  - `src/components/shared/CommandPalette.tsx:33-51`
  - `useCommandPaletteActions(...)` is called only after `if (!isOpen) return null`, so hook order changes when the palette opens
- Recommended next action: fix now

### 3. Prompt Lab output generation hangs when Codex is connected
- Severity: high
- Reproducibility: repeated once, persistent for the tested project
- Repro:
  1. Complete onboarding with `Codex (ChatGPT login)`
  2. Create a project
  3. Open `Prompt Lab`
  4. Click `Generate Output` on `Full GDD`
- Expected:
  - Output should complete, fail explicitly, or time out with visible feedback
- Actual:
  - The output panel stays in a loading skeleton state, no success/error toast appears, and the request appears to hang
- Evidence:
  - Loading state after click: `.playwright-cli/page-2026-03-27T18-59-25-839Z.yml`
  - Viewport still loading after 10 seconds: `.playwright-cli/page-2026-03-27T19-03-09-669Z.png`
  - Network shows `POST http://127.0.0.1:8765/generate` with no completed status in the captured log: `.playwright-cli/network-2026-03-27T19-03-51-691Z.log`
- Likely source area:
  - `src/pages/workspace/PromptLabPage.tsx:39-95`
  - `src/services/ai/providers/codexBridgeProvider.ts:31-87`
  - `scripts/codex-bridge.mjs:254-309`
  - The bridge request path has no visible timeout/abort behavior and the UI keeps the panel in an indefinite loading state
- Recommended next action: fix now

### 4. Onboarding blocks “local-first without AI” despite saying prompt generation is optional
- Severity: high
- Reproducibility: always in the audited WIP
- Repro:
  1. Launch the app in a clean profile
  2. Complete the name step
  3. Reach provider setup
- Expected:
  - There should be a `skip`, `continue without provider`, or equivalent path if prompt generation is genuinely optional
- Actual:
  - The onboarding cannot be completed without going through a provider flow
- Evidence:
  - Provider step snapshot: `.playwright-cli/page-2026-03-27T18-46-53-329Z.yml`
  - Code path has no skip branch: `src/components/onboarding/OnboardingFlow.tsx:50-192`
- Likely source area:
  - `src/components/onboarding/OnboardingFlow.tsx`
- Recommended next action: needs product decision, then fix

### 5. Browser console starts dirty on every load
- Severity: low
- Reproducibility: always in the audited WIP
- Repro:
  1. Open the app
- Expected:
  - Clean console on baseline load, or at least no avoidable framework/config warnings
- Actual:
  - Baseline page load produces:
    - CSP error for `frame-ancestors` in a meta tag
    - two React Router future-flag warnings
- Evidence:
  - `.playwright-cli/console-2026-03-27T18-45-32-880Z.log`
  - `.playwright-cli/console-2026-03-27T19-14-15-309Z.log`
- Likely source area:
  - `index.html`
  - router initialization / future flags
- Recommended next action: queue

### 6. Build output includes a large shared chunk
- Severity: low
- Reproducibility: always in the audited WIP
- Repro:
  1. Run `corepack pnpm build`
- Expected:
  - No chunk-size warning, or deliberate suppression with rationale
- Actual:
  - Vite warns that the main JS chunk exceeds `500 kB`
- Evidence:
  - Build output from the audit pass
- Likely source area:
  - app-level code splitting strategy
- Recommended next action: queue

## UX / IA Issues

### 1. First launch shows the hub and the onboarding at the same time
- Severity: medium
- Reproducibility: always
- Evidence:
  - `.playwright-cli/page-2026-03-27T18-46-03-300Z.yml`
- Notes:
  - The onboarding overlay works, but the visible hub behind it makes the app feel like it has two competing entry points on first launch
- Recommended next action: queue

### 2. Provider setup defaults to Anthropic details before the user has really chosen a direction
- Severity: medium
- Reproducibility: always
- Evidence:
  - `.playwright-cli/page-2026-03-27T18-46-53-329Z.yml`
- Notes:
  - The provider grid suggests a neutral chooser, but the right-hand detail state defaults into an Anthropic key form immediately
- Recommended next action: fix now

### 3. The Codex sign-in CTA lacks strong inline feedback
- Severity: medium
- Reproducibility: repeated once
- Evidence:
  - Clicking `Open ChatGPT Sign-In` did not visibly update the page state before the main `Continue with Codex` action
  - The overall flow still worked, but only because the bridge was already healthy
- Notes:
  - The CTA appears to do an off-page action. A visible “opened terminal” or “bridge still checking” state would reduce uncertainty
- Recommended next action: queue

### 4. Recommendation panel in new-project flow still competes with the form
- Severity: medium
- Reproducibility: always
- Evidence:
  - Modal snapshots across `Horror -> Survival Horror` and `Action -> First-Person Shooter`
- Notes:
  - The modal is much improved, but the right-hand recommendation block is still visually heavy relative to the actual data entry fields
  - The panel is useful, but it still reads more like a second feature than like contextual guidance
- Recommended next action: queue

### 5. Concept page still appears to expose both preset and custom session controls
- Severity: medium
- Reproducibility: observed after project creation and refresh
- Evidence:
  - `.playwright-cli/page-2026-03-27T19-07-22-480Z.yml`
- Notes:
  - The accessibility snapshot shows a selected `Typical Session` combobox and an additional textbox value at the same time
  - If that textbox is visible in the rendered UI, it reintroduces the same duplication problem that was removed from the creation modal
- Recommended next action: fix now

### 6. Prompt Lab loading state is too opaque even before it becomes a defect
- Severity: medium
- Reproducibility: always during the stalled generation
- Evidence:
  - `.playwright-cli/page-2026-03-27T19-03-09-669Z.png`
- Notes:
  - Even if generation eventually succeeded, the panel gives almost no sense of progress, provider path, timeout window, or fallback state
- Recommended next action: queue

### 7. Hub project actions feel incomplete next to import support
- Severity: low
- Reproducibility: always
- Evidence:
  - Project options menu shows `Edit` and `Delete` only: `.playwright-cli/page-2026-03-27T19-25-07-144Z.yml`
- Notes:
  - The hub exposes `Import JSON`, but there is no equally visible export/share action at the card level
- Recommended next action: needs product decision

## Product Decisions To Revisit

### 1. Decide whether onboarding is mandatory setup or truly skippable setup
- Severity: high
- Reproducibility: always
- Evidence:
  - Onboarding copy says provider setup is optional
  - Onboarding flow currently enforces it
- Notes:
  - The product promise and the onboarding contract disagree
  - If the product is useful with no key, the first-launch flow should respect that
- Recommended next action: needs product decision

### 2. Decide whether Game Hub should be visible behind onboarding
- Severity: medium
- Reproducibility: always
- Evidence:
  - Cold-load snapshots show hub + overlay simultaneously
- Notes:
  - This can feel premium if intentional, but right now it reads more like unfinished staging than deliberate layering
- Recommended next action: needs product decision

### 3. Decide how much “template intelligence” should remain visible
- Severity: medium
- Reproducibility: always
- Evidence:
  - Genre-first flow is working, but recommendation profiles are still fairly assertive
- Notes:
  - The app is in a better place than the old starter-mode cards, but the current recommendation panel still feels close to a hidden template system made visible through prose
- Recommended next action: queue

### 4. Decide how aggressive the app should be about Codex-specific steering
- Severity: medium
- Reproducibility: always
- Evidence:
  - Codex bridge path is clearly the happiest path in onboarding/settings
  - Prompt Lab failure on the Codex path currently makes that steering risky
- Notes:
  - If Codex remains the hero path, its failure modes need to be better than the generic provider experience, not worse
- Recommended next action: needs product decision after the bridge issue is fixed

### 5. Revisit header hierarchy and workspace chrome density
- Severity: low
- Reproducibility: always
- Evidence:
  - Multiple snapshots across hub, modal, and workspace
- Notes:
  - The shell is significantly improved, but it still has a lot of competing chrome:
    - left sidebar project chip
    - top header project identity
    - breadcrumb
    - stage pills
    - context nodes call-to-action
  - None of this is broken, but the chrome still competes with the page content more than it should
- Recommended next action: queue

## Coverage Notes
- Fully exercised:
  - baseline checks
  - cold-launch flow
  - Codex onboarding path
  - new-project flow for curated genre paths
  - `Other / Custom` branch reveal behavior
  - workspace concept/design/build/vault/prompt/settings surfaces
  - returning-user refresh path inside an active session
- Partially exercised:
  - Prompt Lab on provider-connected generation path only
  - import/export entry points were inspected, but export was not discovered as a top-level hub action
- Not exhaustively verified:
  - every non-Codex provider
  - large-project mode
  - every prompt output type

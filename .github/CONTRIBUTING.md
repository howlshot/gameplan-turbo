# Contributing to Gameplan Turbo

Thanks for helping improve Gameplan Turbo.

## What this project is

Gameplan Turbo is a planning-first game development workspace for AI-assisted builders. It is local-first, browser-based, and focused on helping teams move from concept to build roadmap and exportable planning artifacts.

## Basic contribution flow

1. Fork the repository on GitHub.
2. Clone your fork locally.
3. Create a feature branch.
4. Make your changes.
5. Run the validation commands.
6. Open a pull request.

## Development setup

```bash
git clone https://github.com/howlshot/gameplan-turbo.git
cd gameplan-turbo
corepack pnpm install
corepack pnpm dev
```

## Validation

Run these before opening a pull request:

```bash
corepack pnpm typecheck
corepack pnpm test
corepack pnpm build
```

## Contribution guidelines

- Keep changes scoped and reviewable.
- Add or update tests when behavior changes.
- Update public docs when user-facing flows change.
- Prefer current Gameplan Turbo terminology over inherited Preflight terminology.
- If you touch older inherited docs, either modernize them or clearly mark them as legacy.

## Pull requests

- Draft PRs are welcome.
- Use clear commit messages.
- Include a short summary, testing notes, and screenshots for UI changes when useful.

## Reporting issues

- Bugs: [open an issue](https://github.com/howlshot/gameplan-turbo/issues)
- Feature requests: [open an issue](https://github.com/howlshot/gameplan-turbo/issues)

## Notes for contributors

- `origin` is typically your fork.
- `upstream` can point to the historical source repository if you need it, but it is not required for normal contribution flow.
- Some older docs and assets remain in the repo for history. The files linked from `README.md` and `docs/README.md` are the current public source of truth.

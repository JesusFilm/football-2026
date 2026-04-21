# Agent Instructions

## Project Shape

- The active Next.js app lives at the repository root.
- Use `pnpm` for all Node.js package operations. Do not introduce npm, Yarn, or Bun lockfiles.

## Fast Path

- Inspect before editing: start with `rg --files`, `rg`, and targeted `sed` reads.
- Prefer existing scripts in `package.json` over ad hoc commands.
- Run the narrowest useful check while iterating, then the full gate before finishing when feasible.
- Keep command output concise in summaries; mention failures with the command and the relevant error.

## Quality Gate

Run these before handing off changes that affect source, config, or tests:

```bash
pnpm lint
pnpm format:check
pnpm typecheck
pnpm test:run
pnpm build
```

For quick local iteration, use:

```bash
pnpm lint -- --fix
pnpm test:run
```

## Compound Engineering Patterns

- Capture ambiguous product direction in `docs/brainstorms/` before planning implementation.
- Put implementation plans in `docs/plans/` when work crosses multiple files or introduces architectural choices.
- Record reusable lessons in `docs/solutions/` after solving non-obvious problems.
- Keep docs portable with repo-relative paths only.
- Make agent-facing APIs and scripts deterministic: stable command names, non-interactive defaults, and clear failure output.

## Code Style

- Keep TypeScript strict and explicit at module boundaries.
- Prefer small React components with direct props over premature abstractions.
- Keep formatting owned by Prettier and code-quality rules owned by ESLint.
- Do not edit generated folders such as `.next/`, `coverage/`, or `node_modules/`.

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

## Internationalization

- Treat i18n as the default for frontend work. Do not add new user-facing strings directly in React components, pages, metadata, generated social images, aria labels, button titles, empty/loading/error states, or client-side status messages.
- Add or update translation keys in `messages/en.json`, then keep every configured locale file in `messages/*.json` structurally aligned with English. The `test/messages.test.ts` parity check should pass whenever message keys change.
- Use `getTranslations` in server components/routes and `useTranslations` in client components. Use locale-aware navigation from `i18n/navigation.ts` for internal links so users stay in the active locale.
- Keep stable identifiers out of translations: route IDs, JSONBin region codes, team IDs, slugs, country codes, QR targets, and external feed values remain data.
- When showing country names, prefer country codes plus `lib/country-display.ts`/`Intl.DisplayNames` instead of hard-coded English country labels.
- Check RTL impact for layout-facing changes. Arabic (`ar`) and Urdu (`ur`) set `dir="rtl"`, so prefer logical CSS/Tailwind utilities such as `start`/`end`, `ms`/`me`, `ps`/`pe`, and `text-start`/`text-end` when direction should mirror.

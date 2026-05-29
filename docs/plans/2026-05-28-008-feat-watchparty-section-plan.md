# Plan 008 — Watch Party section on /resources

**Date:** 2026-05-28
**Source brainstorm:** `docs/brainstorms/2026-05-28-watch-party-kit-hero.md`

## Goal

Ship a "Watch Party" section on `/resources` modeled on victorybeyondthecup.com/keyplayer's 5-step grid, with a `<details>`-based language-dropdown CTA pointing at the four kit-order URLs.

## Order of operations

1. **Branch.** `feat/watchparty-section` off the latest `origin/main`.
2. **`lib/watchparty-kit.ts`** — typed `as const` catalog of the 4 dropdown languages (id, label, url) and the 5 steps (id, index).
3. **`components/home-watchparty-section.tsx`** — server component. Section header + `<details>` dropdown CTA + 5-card grid. Uses existing dark-glass tokens.
4. **`messages/en.json`** — add `HomeWatchParty` namespace (eyebrow, heading, ctaLabel, menuLabel, stepLabel, steps.<id>.{window,title,body}).
5. **`messages/<locale>.json` × 11** — machine-translated starter copy. `window` strings stay English in every locale.
6. **`app/[locale]/resources/page.tsx`** — import + slot between `<HomeYouVersionCollection />` and the categories `.map(...)`.
7. **Quality gate.** `pnpm lint && pnpm format:check && pnpm typecheck && pnpm test:run && pnpm build`.
8. **Ship.** Commit, push, open PR, watch CI, squash-merge.
9. **Verify production.** curl-grep for `watchparty-heading` on football2026.nextstep.is/resources after Railway redeploys.

## Notes

- The dropdown is a `<details>` / `<summary>` so it stays a server component — no client JS framework needed.
- Each language menu item opens its URL in a new tab.
- Step "window" strings ("Feb – March", etc.) stay English in every locale; titles + bodies translate.
- Section keeps the existing `max-w-[1200px]` content container by inheriting from the page wrapper.

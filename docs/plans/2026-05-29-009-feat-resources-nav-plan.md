# Implementation Plan — `/resources` Nav + Watch Party Polish

**Brainstorm:** [`docs/brainstorms/2026-05-29-resources-nav-and-watchparty-polish.md`](../brainstorms/2026-05-29-resources-nav-and-watchparty-polish.md)
**Date:** 2026-05-29

## Steps

1. Branch off latest `main` → `feat/resources-section-nav`.
2. **Drop date markers from Watch Party section.**
   - Edit `components/home-watchparty-section.tsx`: remove the date-window `<span>` and the `justify-between` on the eyebrow row.
   - Edit all 13 `messages/<locale>.json`: remove `HomeWatchParty.steps.<id>.window` keys.
3. **Add `scroll-mt-*` to the four target H2s** (so anchor jumps don't sit behind the sticky header).
   - `components/home-video-collection.tsx` — `<h2 id="video-collection-heading">` gets `scroll-mt-24`.
   - `components/home-journey-collection.tsx` — same for `journey-collection-heading`.
   - `components/home-youversion-collection.tsx` — same for `youversion-collection-heading`.
   - `components/home-watchparty-section.tsx` — same for `watchparty-heading`.
4. **Build `components/resources-section-nav.tsx`** (server component).
   - `<details>` pill identical to Watch Party CTA. Menu lists 4 entries linking to `#video-collection-heading`, `#journey-collection-heading`, `#youversion-collection-heading`, `#watchparty-heading`.
   - i18n via new `ResourcesSectionNav` namespace.
5. **Add `ResourcesSectionNav` i18n.**
   - English source in `messages/en.json`.
   - Python script seeds 12 non-English locales with machine-translated `ctaLabel`, `menuLabel`, and 4 item labels.
6. **Wire into `app/[locale]/resources/page.tsx`** between `<ResourcesHero />` and `<HomeVideoCollection />`.
7. **Ensure global CSS has `scroll-behavior: smooth`.** Check `app/[locale]/globals.css` or equivalent. Add to `html` selector if missing.
8. **Quality gate**: `pnpm lint && pnpm format:check && pnpm typecheck && pnpm test:run && pnpm build`.
9. **Preview-verify.** Confirm dropdown opens, each anchor scrolls to the right section with offset.
10. Commit → push → open PR → watch CI → squash-merge → verify production.

## Touched files

- `components/home-watchparty-section.tsx` (drop window + add `scroll-mt`)
- `components/home-video-collection.tsx` (add `scroll-mt`)
- `components/home-journey-collection.tsx` (add `scroll-mt`)
- `components/home-youversion-collection.tsx` (add `scroll-mt`)
- `components/resources-section-nav.tsx` (new)
- `app/[locale]/resources/page.tsx` (slot)
- `messages/*.json` × 13 (HomeWatchParty.steps prune + ResourcesSectionNav add)
- Possibly `app/[locale]/globals.css` (smooth-scroll, if not already present)

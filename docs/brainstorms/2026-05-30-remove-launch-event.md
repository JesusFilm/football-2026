# Remove the Launch Event Section

**Date:** 2026-05-30
**Origin:** The June 1, 2026 launch briefing on Zoom has happened. The "Live Briefing — Walk through the toolkit together" card on the homepage is no longer current — remove it from the site entirely.

## What

Delete the entire launch-event surface, end-to-end:

- Unwire `<HomeLaunchEvent />` from `app/[locale]/page.tsx` (the only consumer).
- Delete `components/home-launch-event.tsx`.
- Delete `components/share-button.tsx` — only used inside `HomeLaunchEvent`.
- Delete `lib/launch-event.ts` — only used inside `HomeLaunchEvent`.
- Delete `test/launch-event.test.ts` — covers the deleted lib.
- Remove the `HomeLaunchEvent` namespace from all 13 `messages/*.json` locale files.

## Why

The event ran; the calendar slot, registration link, and "Live Briefing" framing are now stale and would confuse partners. Pruning the section (rather than just hiding it behind a flag) keeps the homepage current and removes a non-trivial amount of dead code (component, share helper, frozen catalog, test, 13 i18n blocks).

## In scope

- The four file deletions above plus the homepage slot removal.
- i18n namespace removal across 13 locales (one Python pass).
- No other homepage edits — `HomeLaunchVideo`, video collection, journey collection, region grid, country views all stay.

## Out of scope

- Replacing the section with anything new. The space simply closes up — `HomeLaunchVideo` becomes the first content section under the hero copy.
- Editing region pages, `/resources`, or any non-homepage surface.
- Archiving the share-button or launch-event code elsewhere. Git history retains it.

## Success criteria

- Homepage no longer shows the "Live Briefing · Walk through the toolkit together" card.
- Build, lint, typecheck all clean (no orphan imports).
- `test/messages.test.ts` parity passes across 13 locales after the namespace removal.
- `test/launch-event.test.ts` is deleted (no orphan test).
- Production deploy confirms the section is gone (`curl ... | grep -c "Live Briefing" == 0`).

## Decisions resolved

| Decision                            | Resolution                                                          |
| ----------------------------------- | ------------------------------------------------------------------- |
| Hide behind a flag or delete?       | Delete — content is stale, no plan to revive in the same form.      |
| Delete `ShareButton` too?           | Yes — only consumer was `HomeLaunchEvent`. Git keeps the history.   |
| Delete `lib/launch-event.ts`?       | Yes — only consumer was `HomeLaunchEvent`.                          |
| Delete `test/launch-event.test.ts`? | Yes — the lib it covers is gone.                                    |
| Remove `HomeLaunchEvent` from i18n? | Yes — keep the bundle clean; key parity test enforces all 13 prune. |

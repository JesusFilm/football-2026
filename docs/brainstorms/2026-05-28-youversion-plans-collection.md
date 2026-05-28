# AIA YouVersion Reading Plans Collection — Requirements & Plan

**Date:** 2026-05-28
**Origin:** Iteration on `/resources` page after the journey collection landed in PR #6.
**Scope:** Additive only — one new section component on `/resources`, no edits to homepage or region pages, no edits to existing components on `/resources`.

## What

Surface the four Athletes In Action (AIA) YouVersion reading plans listed on the JFP ready-to-use resources page as their own collection on `/resources`:

| Plan                                     | Author          | Days | URL                                                                   |
| ---------------------------------------- | --------------- | ---- | --------------------------------------------------------------------- |
| I Belong to Jesus                        | Kaká            | 6    | bible.com/reading-plans/64628-i-belong-to-jesus                       |
| Kingdom Playmaker: Living With Intention | Eyong Enoh      | 5    | bible.com/reading-plans/64771-kingdom-playmaker-living-with-intention |
| Fully His: The Power of Daily Surrender  | Jonathan Mensah | 6    | bible.com/reading-plans/67561-fully-his-the-power-of-daily-surrender  |
| Tools for Transformation                 | Lucas Moura     | 5    | bible.com/reading-plans/68423-tools-for-transformation                |

Each card links to its bible.com reading plan URL in a new tab.

## Why

The journey collection added in PR #6 surfaced an interactive "go share this" beat on `/resources`. The Bible reading plans are the _receptive_ counterpart — what a partner sends to a friend who wants to spend a week in Scripture with an athlete they admire. Currently the plans are tucked inside the existing Ready-to-Use category card; pulling them up as their own carousel makes them discoverable at a glance, matching the journey + video patterns above.

## In scope

- New section component `HomeYouVersionCollection` on `/resources` only, slotted between the journey collection and the existing three-category grid.
- New `lib/youversion-plans.ts` frozen catalog (id, author, daysCount, bibleComUrl, thumbnailUrl).
- New `components/home-youversion-collection.tsx` + `components/youversion-plan-card.tsx` — same visual pattern as `HomeJourneyCollection` (portrait image fill, eyebrow overlay, title overlay, "Open in YouVersion" pill, accent arrow chip).
- New `HomeYouVersionCollection` i18n namespace with eyebrow / heading / seeAllCta / showMoreCta / openInYouVersion / openOnYouVersion / items.<id>.{eyebrow,title,blurb}. Machine-translated to all 11 non-English locales; brand plan titles and author names stay in English across locales (they appear that way on bible.com).
- "Open the full library" CTA at section header → JFP ready-to-use resources page (the source URL).

## Out of scope

- Surfacing the plans on the homepage or region pages. Scoped to `/resources` only.
- Editing the existing Ready-to-Use category (the plans still appear there too, as the original static cards).
- Human translation of new copy. Same starter-machine-translated pattern as the journey + video collections.
- Pulling the list live from JFP's WordPress API. Static catalog, refreshed by hand if JFP rotates the plans.

## Success criteria

- `/resources` shows the new section between the journey collection and the existing categories.
- Each card opens its bible.com URL in a new tab.
- Quality gate green (lint, format, typecheck, tests, build).
- `test/messages.test.ts` parity passes across all 12 locales.

## Implementation plan

1. **`lib/youversion-plans.ts`** — typed `as const` catalog of the 4 plans with stable identifiers (URL, thumbnail, author, days).
2. **`components/youversion-plan-card.tsx`** — server component, portrait card with image fill, eyebrow + title overlay, "Open in YouVersion" pill + small accent arrow chip. Mirrors `journey-collection-card.tsx`.
3. **`components/home-youversion-collection.tsx`** — server component, section wrapper with eyebrow + heading + "Open the full library" link + horizontal scroll row on desktop + 2-col grid on mobile.
4. **`app/[locale]/resources/page.tsx`** — one import + one slot between `<HomeJourneyCollection />` and the categories `.map(...)`.
5. **`messages/*.json`** — new namespace + per-plan items across all 12 locale files (English source + machine-translated starter blurbs in 11 locales).
6. **Quality gate**: `pnpm lint && pnpm format:check && pnpm typecheck && pnpm test:run && pnpm build`.
7. **Preview** — verify on localhost, then push + open PR.

## Risks

- **Thumbnail availability.** All 4 thumbnails are on `jesusfilm.org/wp-content/uploads/`. If JFP rotates them, cards render broken. Mitigation: pin URLs at write time; if a thumbnail breaks, a maintainer updates the catalog (same pattern as other collections).
- **Author + day-count formatting on a small portrait card.** With author + days + title there's risk of cramped layout. Mitigation: eyebrow on the card is "AUTHOR · N DAYS" (compact, all-caps mono); title sits below, has room because the card is portrait-tall.

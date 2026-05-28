---
title: "feat: Journey Collection — Homepage, Region Pages, /resources"
type: feat
status: active
date: 2026-05-28
origin: docs/brainstorms/2026-05-28-journey-collection-requirements.md
---

# feat: Journey Collection — Homepage, Region Pages, /resources

## Overview

One new section component (`HomeJourneyCollection`) lands in three places:

1. **Homepage** (`app/[locale]/page.tsx`) — directly below `HomeVideoCollection`, above `HomeCountryViewsSection`.
2. **Each region page** (`app/[locale]/[id]/page.tsx`) — between `RegionSharePanel` (which ends with the "Explore the map below" prompt) and `CountryViewsSection`.
3. **Resources page** (`app/[locale]/resources/page.tsx`) — placed above the existing three-category grid, alongside a copy of `HomeVideoCollection` (so `/resources` carries both carousels at the top, then the existing static catalog below).

Visual pattern is the same as `HomeVideoCollection`: dark-glass cards in a two-row horizontal scroller on desktop, 2-col grid + "Show all" CTA on mobile, fade overlay on the right edge.

No existing component is modified. The journey collection is one new component, one new data file, one new namespace in messages, plus one short i18n key (`SharePanel.journeyPrompt`) on the region pages.

## Requirements trace

- **R1.** A new `HomeJourneyCollection` section renders on the homepage between `HomeVideoCollection` and the country-views `<Suspense>` block.
- **R2.** The same section renders on every region page between `RegionSharePanel` and `CountryViewsSection`, with a one-line prompt above it ("Have more to share? Try one of these NextSteps journeys.").
- **R3.** The same section renders on `/resources` above the existing three-category grid. `HomeVideoCollection` also renders above it (same component as on the homepage).
- **R4.** Cards link out to `admin.nextstep.is/templates/<uuid>` (new tab, `rel="noopener noreferrer"`).
- **R5.** "Open full library" link in the section header points to <https://nextstep.is/football2026/> (new tab).
- **R6.** Catalog (ids, URLs, optional thumbnailUrl) lives in `lib/journey-collection.ts`. Stable identifiers stay out of translations per AGENTS.md.
- **R7.** Titles and blurbs live in `messages/<locale>.json` under `HomeJourneyCollection.items.<id>.{title,blurb}`. English source values, machine-translated starter values in the 11 other locales.
- **R8.** `test/messages.test.ts` passes across all 12 locales.
- **R9.** Full quality gate green.

## Scope boundaries

- No custom NextSteps embed. Cards link out — NextSteps hosts the journey.
- No live fetch from NextSteps API. Catalog is frozen at write time.
- No region-specific journey filtering. All regions show the same four journeys.
- No edits to `RegionSharePanel`, `CountryViewsSection`, `ResourceCategorySection`, or other existing components.
- No human translation in this PR. Machine-translated starter values, refined later by JFP's translation team.

## Context & research

### Source data (curation date 2026-05-28)

Pulled from <https://nextstep.is/football2026/>. Four templates:

| ID                               | NextSteps template UUID                | English title                  |
| -------------------------------- | -------------------------------------- | ------------------------------ |
| `spiritual-conversation-starter` | `d336c09c-25fd-41f9-8e19-2e944ce16b1b` | Spiritual Conversation Starter |
| `prayer-connect`                 | `d941b7f7-621f-4ccc-ad3f-c49d7b53c06d` | Prayer Connect                 |
| `gospel-encounter`               | `d3c0093f-06a7-4049-9a61-5b3ce7ae14c7` | Where You Belong               |
| `four-spiritual-laws`            | `be24ad2f-81b2-4741-a8ac-1e1819027b15` | The FOUR · Sports              |

Each card links to `https://admin.nextstep.is/templates/<uuid>`. The "Open full library" CTA links to `https://nextstep.is/football2026/`.

### Relevant patterns to reuse

- `components/home-video-collection.tsx` — section wrapper pattern (eyebrow, heading, see-all link, two scrolling rows on desktop, 2-col grid on mobile, edge fade).
- `components/video-collection-card.tsx` — card surface (dark-glass border + backdrop blur + external arrow corner).
- `components/inline-video-player.tsx` — _not_ needed for journeys (no inline play). Cards stay pure server components.
- `lib/soccer-videos.ts` — typed `as const` catalog with helper exports. Mirror this shape in `lib/journey-collection.ts`.
- `messages/en.json` — `HomeVideoCollection` namespace structure. Mirror for `HomeJourneyCollection`.

## Key technical decisions

- **Server components everywhere.** Journeys are static link cards. No state, no interactivity beyond a click that opens a new tab. No `"use client"` needed.
- **Card design without thumbnails for v1.** The NextSteps page returns SVG-placeholder thumbnails in plain HTML scraping. Rather than fragile thumbnail discovery, the v1 card is typography-led: a small icon, eyebrow ("Journey"), title, blurb, external-link arrow. Cleaner and ages well; thumbnails can be added later without restructuring.
- **Same two-row scroller pattern.** Even though there are only 4 journeys, reusing the pattern keeps the page rhythm consistent. With 4 items, both rows will fit comfortably without scrolling on most viewports — the fade overlay still appears but doesn't suggest scroll if all cards are visible. Acceptable tradeoff for visual consistency. Alternative: a single row of 4 cards on desktop, 2-col grid on mobile. Pick whichever reads cleaner in preview — decision deferred to implementation.

  **Updated decision (during planning):** Single row on desktop, 2-col grid on mobile. With 4 journeys the two-row pattern would feel empty; one tight row of 4 ~280-300px cards reads better at desktop width.

- **Region-page prompt copy.** Renamed key: `SharePanel.journeyPrompt`, value: "Have more to share? Try one of these NextSteps journeys." Lives in `SharePanel` namespace so it sits alongside the existing `mapPrompt`. Refined from Miheret's draft: _"Checkout first more nextsteps journeys you could also share."_

## Open questions

### Resolved during planning

- **Live fetch vs. static catalog?** Static. Same rationale as `lib/soccer-videos.ts`.
- **Thumbnails per journey?** Skip for v1. Typography-led card design works for 4 items.
- **One row or two rows for the journeys?** One row of 4 on desktop. Two rows would feel empty with only 4 items.
- **Region-specific journey filtering?** No, defer. All regions show the same four journeys.

### Deferred to implementation

- **Exact eyebrow icon for journey cards.** A small interactive-page icon (cursor or hand pointer or chat-bubble) vs. just the external-arrow corner alone. Decision deferred — start with just the corner arrow, add an icon only if cards feel under-decorated.

## Implementation plan

### Step 1 — Data file

**New file:** `lib/journey-collection.ts`

```ts
export const JOURNEY_COLLECTION_URL = "https://nextstep.is/football2026/";

export type JourneyTemplate = {
  /** Stable slug — matches the i18n key under
   *  HomeJourneyCollection.items.<id>. */
  id: string;
  /** Public template URL on nextstep.is — the "preview + clone" page. */
  templateUrl: string;
};

export const JOURNEYS: readonly JourneyTemplate[] = [
  // 4 entries, populated from nextstep.is/football2026/ on 2026-05-28.
] as const;
```

### Step 2 — Components

**New files:**

- `components/home-journey-collection.tsx` — server component, mirrors `home-video-collection.tsx`. Single-row layout on desktop (`flex` + scroll-snap), 2-col grid on mobile + Show More CTA.
- `components/journey-collection-card.tsx` — server component, dark-glass card with eyebrow ("Journey"), title, blurb, external-arrow corner.

### Step 3 — i18n keys

**Modified files:** `messages/{en,ar,bn,de,es,fr,hi,id,pt-BR,ru,ur,zh-Hans}.json`

New namespace `HomeJourneyCollection`:

```
HomeJourneyCollection: {
  eyebrow: "Collection · {count, plural, one {# journey} other {# journeys}}",
  heading: "NextSteps journeys for the World Cup",
  seeAllCta: "Open full library",
  showMoreCta: "Open all {total} journeys",
  itemTypeLabel: "Journey",
  openOnNextSteps: "Open {title} on NextSteps",
  items: {
    "spiritual-conversation-starter": { title, blurb },
    "prayer-connect": { title, blurb },
    "gospel-encounter": { title, blurb },
    "four-spiritual-laws": { title, blurb },
  }
}
```

Plus one new key inside the existing `SharePanel` namespace:

```
SharePanel.journeyPrompt: "Have more to share? Try one of these NextSteps journeys."
```

Translation pass: English source in `en.json`, machine-translated starter values in the 11 non-English locale files. Translation script `scripts/translate-journey-collection.py` captures the pass for the audit trail.

### Step 4 — Tests

**New file:** `test/journey-collection.test.ts` — same shape as `test/soccer-videos.test.ts`:

- `JOURNEYS.length === 4`
- No duplicate ids
- Every `templateUrl` matches `/^https:\/\/admin\.nextstep\.is\/templates\/[a-f0-9-]{36}$/`
- Every id has a corresponding `HomeJourneyCollection.items.<id>` key in `messages/en.json`

### Step 5 — Wire into pages

**Modified files:**

- `app/[locale]/page.tsx` — one import, one JSX slot below `<HomeVideoCollection />`.
- `app/[locale]/[id]/page.tsx` — one import + one new wrapping section that renders the `journeyPrompt` text plus `<HomeJourneyCollection />`, slotted between `<RegionSharePanel />` and `<CountryViewsSection />`.
- `app/[locale]/resources/page.tsx` — imports for `HomeVideoCollection` and `HomeJourneyCollection`, both rendered above the existing `RESOURCE_CATEGORIES_IN_ORDER.map(...)` loop.

### Step 6 — Quality gate

```bash
pnpm lint
pnpm format:check
pnpm typecheck
pnpm test:run
pnpm build
```

### Step 7 — Preview

Restart dev server. Screenshot: homepage scrolled to the new section, region page scrolled to the new section, `/resources` scrolled to the new section. Stop before push; wait for Miheret's approval.

## Expected diff surface

| File                                              | New / Modified                              |
| ------------------------------------------------- | ------------------------------------------- |
| `lib/journey-collection.ts`                       | new                                         |
| `components/home-journey-collection.tsx`          | new                                         |
| `components/journey-collection-card.tsx`          | new                                         |
| `app/[locale]/page.tsx`                           | modified (1 import + 1 slot)                |
| `app/[locale]/[id]/page.tsx`                      | modified (1 import + 1 prompt + 1 slot)     |
| `app/[locale]/resources/page.tsx`                 | modified (2 imports + 2 slots)              |
| `messages/*.json` × 12                            | modified (new namespace + 1 SharePanel key) |
| `test/journey-collection.test.ts`                 | new                                         |
| `scripts/translate-journey-collection.py`         | new                                         |
| `docs/solutions/2026-05-28-journey-collection.md` | new (after impl)                            |

## Out of scope (recap)

- Custom NextSteps embed
- Live fetch from NextSteps
- Region-specific journey filtering
- Human translation in this PR
- Thumbnails on journey cards (deferred to v2)

---
title: "feat: Soccer Video Collection Carousel"
type: feat
status: active
date: 2026-05-16
origin: docs/brainstorms/2026-05-16-soccer-video-collection-requirements.md
---

# feat: Soccer Video Collection Carousel

## Overview

A horizontal carousel of 12 soccer-themed gospel videos drops into the
campaign homepage between `HomeLaunchVideo` and `HomeCountryViewsSection`.
Cards open jesusfilm.org watch pages in a new tab; a "See full
collection" link opens the upstream collection at jesusfilm.org. Nothing
existing changes: no edits to `HomeHero`, `HomeRegionGrid`,
`HomeRegionHeading`, `HomeLaunchEvent`, `HomeLaunchVideo`,
`HomeCountryViewsSection`, `SiteFooter`, `StadiumBg`, `proxy.ts`,
`lib/regions.ts`, or region routes under `app/[locale]/[id]/`.

Visual thesis: the page reads as one quiet narrative. Adding a row of
video cards in the existing dark-glass vocabulary widens the _browse_
beat without disrupting the _convert_ beat from the Zoom card or the
_vision_ beat from the launch video.

## Problem frame

Visitors landing between now and the June 1 launch call have no fast
way to see the actual films Jesus Film Project has produced for the
World Cup moment. The Resources page surfaces a catalog, but it lives
one click away from the homepage and reads like an index. The carousel
collapses that path — videos become visible on the homepage and one
click from being watched.

See origin: `docs/brainstorms/2026-05-16-soccer-video-collection-requirements.md`.

## Requirements trace

- **R1.** A new section renders on the homepage in every locale, slotted
  between `HomeLaunchVideo` and `HomeCountryViewsSection`.
- **R2.** Section shows: micro-caps eyebrow ("Video collection"), display
  heading, supporting body line, and a "See full collection" link in the
  end-of-row corner that opens the upstream collection page in a new tab.
- **R3.** Section contains a horizontally scrollable list of cards — one
  per video — using CSS scroll-snap. No client JS.
- **R4.** Each card surfaces a thumbnail, title, optional duration
  badge, and a single-sentence blurb. Click target is the video's watch
  URL on jesusfilm.org (English), opens in a new tab with
  `rel="noopener noreferrer"`.
- **R5.** Card surface visually reuses the same border, background, and
  backdrop blur as `RegionCard` and the existing `ResourceCard` —
  `rounded-[var(--radius-lg)] border border-line bg-[rgb(20_16_12_/_0.6)]
backdrop-blur-md`.
- **R6.** Mobile (≤640px) renders ~1.2 cards visible with native swipe.
  Desktop (≥1024px) renders ~3.5–4 cards visible with trackpad scroll.
  RTL layout safe via logical Tailwind utilities (`ms`/`me`/`start`/`end`).
- **R7.** Video catalog (id, watchUrl, thumbnailUrl, durationSeconds) is
  frozen in `lib/soccer-videos.ts`. Per AGENTS.md, stable identifiers
  stay out of translations.
- **R8.** Titles and blurbs are i18n keys under
  `HomeVideoCollection.items.<id>.{title,blurb}`. `messages/en.json` is
  canonical; the 11 other locale files receive structurally identical
  keys with machine-translated starter values.
- **R9.** `test/messages.test.ts` passes across all 12 locales.
- **R10.** Full quality gate green:
  `pnpm lint && pnpm format:check && pnpm typecheck && pnpm test:run && pnpm build`.

## Scope boundaries

- No custom video player. Cards link out to jesusfilm.org which has its
  own player.
- No live fetch from Arclight at request time. Catalog is curated and
  frozen at write time in `lib/soccer-videos.ts`. The collection is
  fixed for the June 1 campaign; static is faster and more predictable.
- No locale-aware watch URLs. All cards link to `<slug>.html/english.html`.
  JFP doesn't translate every video into every locale; English avoids
  broken links.
- No human translation pass in this PR — machine-translated starter
  values across the 11 non-English locales, tracked as a follow-up for
  the JFP translation team.
- No carousel arrow buttons (`<`/`>`). Trackpad scroll + touch swipe
  cover the primary input modes. Add later if needed.
- No autoplay, no preview-on-hover, no inline video embedding.
- No changes to region pages, country views logic, footer, or any
  existing route or component.

## Context & research

### Relevant code patterns

- **`lib/resources.ts`** — closest precedent. Frozen catalog of
  `Resource` entries with stable URLs, typed exports, and a category
  filter helper. `lib/soccer-videos.ts` mirrors this shape with the
  video-specific fields.
- **`components/region-card.tsx`** — defines the dark-glass card
  surface. Reused by `components/resource-card.tsx` and now by
  `components/video-collection-card.tsx`. Same Tailwind class string for
  the outer surface to keep the vocabulary tight.
- **`components/resource-category.tsx`** — wraps a category of resource
  cards with a heading and grid. The new
  `components/home-video-collection.tsx` follows a similar shape: a
  heading row plus a list, except the list is a horizontal scroller
  rather than a fixed grid.
- **`app/[locale]/page.tsx`** — homepage composition. We slot the new
  component by importing and rendering between `<HomeLaunchVideo />` and
  the `<Suspense>` around `HomeCountryViewsStream`.
- **`messages/en.json`** — canonical key shape. We add one new top-level
  namespace `HomeVideoCollection` plus the per-video items.
- **`test/messages.test.ts`** — structural parity test across all 12
  locales; enforces key-set equivalence. The new keys must be present in
  every locale.

### Source data

The upstream collection lives at
`https://www.jesusfilm.org/watch/soccer_event_collection.html/english.html`
and contains 12 videos in 79 languages. The page is client-rendered
(plain HTML scrape returns the collection metadata but not the
individual items), so we'll hydrate `lib/soccer-videos.ts` via one of:

1. **Arclight GraphQL** — same backend `lib/journeys.ts` already
   queries. Get the 12 items under `collectionId`. Output is the
   canonical source of truth; we copy the 12 entries into the static
   catalog and freeze them.
2. **Manual transcription** from the rendered page — paste-and-format
   from a browser view.

(1) is preferred during implementation since it pulls the structured
data we need (id, slug, duration, image URL) without manual error. The
fetched data still lands in a static `as const` array; we do NOT keep a
live fetch in the request path.

## Key technical decisions

- **Static catalog over live fetch.** Same rationale as `lib/resources.ts`:
  the collection is fixed for the campaign window, no external API
  dependency on the hot path, no failure modes for visitors. A maintainer
  refreshes the array if JFP rotates videos.
- **Server components everywhere.** Both `HomeVideoCollection` and
  `VideoCollectionCard` are server components — no client state, no
  hover affordances that need JS, no autoplay.
- **CSS scroll-snap for the carousel.** Native horizontal scroll on a
  flex row with `scroll-snap-type: x mandatory` on the container and
  `scroll-snap-align: start` on each child. No JS, no JS hydration
  overhead, no broken scroll position bugs.
- **One link target per card, English.** Avoids broken links from
  missing locale variants. We trust that the JFP watch page itself will
  offer language switching for visitors who land there in a non-English
  context.
- **Card surface reuse.** No new design tokens. Same class string the
  existing region and resource cards use.

## Open questions

### Resolved during planning

- **Live fetch vs. static catalog?** Static. (Reasons in Scope and
  Decisions.)
- **Carousel arrows?** No, defer. Trackpad + swipe cover desktop +
  mobile; the third case (keyboard-only desktop nav) can be solved with
  Tab into the carousel + arrow keys natively scrolling — sufficient for
  v1.
- **Locale-aware watch URLs?** No, defer. Link to English universally.

### Deferred to implementation

- **Exact thumbnail URLs from Arclight CDN.** Fetched and pinned at
  write time. If they don't load, fall back to a per-card data attribute
  with the video ID and let JFP serve from their canonical path.
- **Whether to include a duration badge.** Yes if durationSeconds is
  available from Arclight; skip the badge gracefully if it's missing.

## Implementation plan

### Step 1 — Data file

**New file:** `lib/soccer-videos.ts`

```ts
export type SoccerVideo = {
  id: string; // stable slug, matches messages key
  watchUrl: string; // jesusfilm.org watch URL (English)
  thumbnailUrl: string; // Arclight CDN URL
  durationSeconds?: number; // optional; shown as "M:SS" badge if present
};

export const COLLECTION_URL =
  "https://www.jesusfilm.org/watch/soccer_event_collection.html/english.html";

export const SOCCER_VIDEOS: readonly SoccerVideo[] = [
  // 12 entries, populated from the Arclight collection at write time.
] as const;
```

Curation date noted in a top-of-file comment.

### Step 2 — Components

**New files:**

- `components/home-video-collection.tsx`
- `components/video-collection-card.tsx`

`home-video-collection.tsx` (server component):

- Receives no props.
- Reads `useTranslations("HomeVideoCollection")` for eyebrow, heading,
  body, seeAllCta.
- Renders a `<section aria-labelledby="video-collection-heading">` with
  the eyebrow + heading + body in the left of the head row, and the
  "See full collection →" external link in the right (logical `end`).
- Renders the cards in a `<ul role="list">` with horizontal scroll-snap
  utilities.

`video-collection-card.tsx` (server component):

- Receives a `SoccerVideo` prop.
- Renders an `<a>` with `target="_blank" rel="noopener noreferrer"`.
- Card surface uses the same class string as `RegionCard`.
- Inner layout: thumbnail (with aspect-video container), title, blurb,
  optional duration badge in the corner.

### Step 3 — Wire into homepage

**Modified file:** `app/[locale]/page.tsx`

Add one import and render the new section between
`<HomeLaunchVideo />` and the `<Suspense>` that streams country views.
No other changes to this file.

### Step 4 — i18n keys

**Modified files:**

- `messages/en.json` — canonical, English source values.
- `messages/{ar,bn,de,es,fr,hi,id,pt-BR,ru,ur,zh-Hans}.json` — same
  key shape, machine-translated starter values.

New top-level namespace `HomeVideoCollection`:

```
HomeVideoCollection: {
  eyebrow: "Video collection",
  heading: "Stories to share during the World Cup.",
  body: "Short films designed to spark gospel conversations. Send one, share many.",
  seeAllCta: "See full collection",
  durationLabel: "{minutes}:{seconds}",
  items: {
    <video-id-1>: { title: "...", blurb: "..." },
    // 12 entries total
  }
}
```

Translation script `scripts/translate-soccer-video-collection.py`
parallels `scripts/translate-launch-additions.py`. Captures the
machine-translation pass as an auditable artifact.

### Step 5 — Tests

**New file:** `test/soccer-videos.test.ts`

Assertions:

- `SOCCER_VIDEOS.length === 12` (catalog completeness)
- No duplicate `id` values
- Each `watchUrl` matches `/^https:\/\/www\.jesusfilm\.org\/watch\//`
- Each `thumbnailUrl` is an https URL
- Every `SoccerVideo.id` has a corresponding key in
  `messages/en.json` under `HomeVideoCollection.items.<id>`

The existing `test/messages.test.ts` covers structural parity across
the 12 locale files automatically.

### Step 6 — Quality gate

Run in order before stopping for review:

```bash
pnpm lint
pnpm format:check
pnpm typecheck
pnpm test:run
pnpm build
```

All five must pass.

### Step 7 — Preview

Start dev server, navigate to `/`, `/pt-BR/`, and `/`-with-mobile-viewport.
Capture screenshots. Stop before pushing the branch; wait for user
approval.

## i18n plan

- Add ~30 keys (`HomeVideoCollection` namespace + 12 × 2 item fields)
  to `messages/en.json`.
- Run `scripts/translate-soccer-video-collection.py` to populate the 11
  non-English locales. Machine-translation starter values; quality
  reviewable by JFP's translation team.
- `test/messages.test.ts` enforces parity automatically.

## Test plan

- **Existing tests run unchanged:** `test/messages.test.ts` (parity),
  `test/launch-event.test.ts`, `test/resources.test.ts`,
  `test/regions.test.ts`, etc. All should pass with no edits.
- **New test:** `test/soccer-videos.test.ts` — as described in Step 5.
- **No component-level Vitest renders.** The new components are pure
  presentational server output; the type system + parity test + data
  test cover the failure modes.

## Quality gate

```
pnpm lint
pnpm format:check
pnpm typecheck
pnpm test:run
pnpm build
```

All five pass before declaring the work ready for preview.

## Risks & mitigations

- **Thumbnail URL drift on Arclight CDN.** Mitigation: pin URLs at
  write time; `test/soccer-videos.test.ts` asserts URL shape, not
  content. If a thumbnail breaks in production, a maintainer updates
  the catalog.
- **iOS horizontal scroll fights vertical page scroll.** Mitigation:
  `overscroll-behavior-x: contain` and `scroll-snap-type: x mandatory`
  on the carousel container scope the gesture cleanly.
- **A11y of horizontal-scroll lists.** Mitigation: `<section
aria-labelledby>`, `<ul role="list">`, and meaningful card text. The
  external-link icon gets `aria-hidden="true"` and an `aria-label` on
  the anchor describes the action.
- **Catalog drift after launch.** Mitigation: top-of-file comment in
  `lib/soccer-videos.ts` documents the curation date and source URL so
  a maintainer can refresh easily.
- **Machine-translation quality.** Mitigation: the script writes a
  tracked artifact (`scripts/translate-soccer-video-collection.py`),
  making it obvious what to review during the translation team's pass.

## Out of scope (recap)

- Custom video player
- Live Arclight fetch in the request path
- Locale-aware watch URLs
- Carousel arrow buttons
- Autoplay / preview-on-hover
- Human translation of new strings
- Any change to existing components or routes

## Expected diff surface

| File                                                   | New / Modified                                 |
| ------------------------------------------------------ | ---------------------------------------------- |
| `lib/soccer-videos.ts`                                 | new                                            |
| `components/home-video-collection.tsx`                 | new                                            |
| `components/video-collection-card.tsx`                 | new                                            |
| `app/[locale]/page.tsx`                                | modified (one import + one JSX slot)           |
| `messages/*.json` × 12                                 | modified (new `HomeVideoCollection` namespace) |
| `test/soccer-videos.test.ts`                           | new                                            |
| `scripts/translate-soccer-video-collection.py`         | new (translation audit trail)                  |
| `docs/solutions/2026-05-16-soccer-video-collection.md` | new (after impl)                               |

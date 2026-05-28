# Soccer Video Collection — Requirements

**Date:** 2026-05-16
**Scope:** Additive only. No changes to the hero, region grid, country views, footer, region pages, `proxy.ts`, or i18n routing.

## Problem & value

The June 1 launch call exists to mobilize partners around the World Cup, but visitors who land on `football2026.nextstep.is` between now and the call don't yet have an easy way to _see_ the actual content Jesus Film Project has created for the moment. The Resources page (added in PR #5) lists the catalog with link cards, but it lives one navigation step away from the homepage and reads more like an index than a watch experience.

Adding a video collection carousel on the homepage closes that gap. Visitors get an at-a-glance preview of the soccer-themed gospel films that exist, can click into any of them to watch on `jesusfilm.org`, and can jump to the full collection page with a single "See full collection" link. The carousel works as both browse and discovery.

## In scope

### One new section on the homepage

A horizontal carousel of video cards drawn from the **JFP Soccer Event Collection** (`https://www.jesusfilm.org/watch/soccer_event_collection.html/english.html`). The collection contains 12 short evangelistic films themed around soccer in 79 languages — we surface them as a row of cards on the homepage so they're discoverable without leaving the site.

- **Card content per video**: thumbnail image, title, optional duration badge, optional ~one-sentence blurb.
- **Card click target**: the corresponding `jesusfilm.org/watch/<slug>.html/english.html` page, opens in a new tab with `rel="noopener noreferrer"`.
- **Section header**: short eyebrow ("Video collection"), display heading, supporting body line, and a "See full collection →" link in the top-right that opens the collection page on jesusfilm.org in a new tab.
- **Card surface**: same dark-glass aesthetic as `RegionCard` and `ResourceCard` (rounded border, translucent embersoot background, backdrop blur). No new design tokens.

### Position on the homepage

Between `HomeLaunchVideo` and `HomeCountryViewsSection`. The story flow becomes:

```
Hero → Region grid → Zoom card (briefing) → Single launch video (vision) → Video collection (browse) → Country views (impact) → Footer
```

The single launch video is a one-vision-moment. The carousel is many-videos-to-explore. Putting them adjacent lets the page transition from "watch this one" to "here's everything else" without a jarring shift in mode.

### Data layer

- New `lib/soccer-videos.ts` — frozen catalog of `{ id, watchUrl, thumbnailUrl, durationSeconds }` entries. Same pattern as `lib/resources.ts`.
- Collection URL (`COLLECTION_URL`) and per-video URLs are stable identifiers that live in `lib/`, not in translations (per AGENTS.md).
- Titles and blurbs live in `messages/<locale>.json` under `HomeVideoCollection.items.<id>.{title,blurb}` so they localize per the existing i18n parity contract.

### Components

- `components/home-video-collection.tsx` — server component, section wrapper (eyebrow, heading, body, see-all link, list of cards).
- `components/video-collection-card.tsx` — server component, one card.

All server components. No client JS needed — pure CSS scroll-snap handles the horizontal scroll.

### i18n

- New top-level namespace `HomeVideoCollection` in `messages/en.json`.
- Mirrored structurally into the 11 non-English locale files.
- Initial values: English source in `en.json`, machine-translated starter values in the other 11 (same approach as launch additions). Translation team refines later.
- Per-video titles/blurbs nested under `HomeVideoCollection.items.<id>`.

## Out of scope

- Building a custom video player. We link out to jesusfilm.org which already has a player.
- Auto-playing thumbnails or preview-on-hover. Heavy, distracting, and breaks the page's quiet rhythm.
- Pulling the video list live from the Arclight API at request time. The collection is frozen for the June 1 campaign window; static is faster and more predictable.
- Locale-aware watch URLs (`<slug>.html/<locale>.html`). JFP doesn't translate every video into every locale, so we link all cards to the English version to avoid 404s. Future iteration can map per-video locale availability if needed.
- Human translation pass for the 11 non-English locales. Same follow-up commitment as the launch additions.
- Arrow buttons (`<` `>`) on the carousel for keyboard/desktop nav. Defer to a follow-up if needed; trackpad scroll and touch swipe cover the primary cases.
- Region page changes, country views logic, JSONBin/Plausible fetchers, region configs in `lib/regions.ts`.

## Success criteria

- New carousel renders on `/` (and `/<locale>`) without disturbing the existing component order, animation timing, or layout breakpoints.
- Each card opens its watch URL on jesusfilm.org in a new tab.
- "See full collection" link opens the JFP collection page in a new tab.
- Mobile (≤640px) shows ~1.2 cards with native horizontal swipe.
- Desktop (≥1024px) shows ~3.5–4 cards with trackpad scroll.
- Quality gate green: `pnpm lint && pnpm format:check && pnpm typecheck && pnpm test:run && pnpm build`.
- `test/messages.test.ts` passes across all 12 locales after key additions.

## Assumptions

- The Soccer Event Collection on jesusfilm.org will not add or remove videos between now and June 1. Catalog is intentionally frozen in `lib/soccer-videos.ts`. If JFP edits the collection, a maintainer updates the array.
- Arclight CDN thumbnail URLs are stable for the campaign window. If rotation breaks a thumbnail, we'd see a broken image and update the URL in the catalog.
- Visitors on non-English locales are okay with the cards linking to English video pages (their UI surrounding the card is translated; only the destination is English). This matches the existing pattern for "All videos — Global Football Event" already in `lib/resources.ts`.

## Risks

- **Thumbnail CDN drift.** If JFP changes their image hosting path, the cards render broken. Mitigation: pin the URLs we fetch today and surface a `test/soccer-videos.test.ts` assertion that they at least have the expected shape (https + jesusfilm.org host).
- **Mobile horizontal scroll fighting vertical page scroll on iOS.** Mitigation: `overscroll-behavior-x: contain` scopes the gesture to the carousel.
- **Carousel a11y.** Screen readers need an accessible name for the region and clear card labels. Mitigation: `<section aria-labelledby>` on the wrapper and meaningful card text (title + duration in human-readable form for a11y).
- **Catalog drift after launch.** The collection on jesusfilm.org may rotate between Jun 1 and the World Cup window. Mitigation: a comment in `lib/soccer-videos.ts` documenting the curation date and pointing to the upstream URL, so the maintainer can refresh easily.

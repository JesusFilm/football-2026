# Journey Collection — Requirements

**Date:** 2026-05-28
**Scope:** Additive only. No edits to `HomeHero`, `HomeRegionGrid`, `HomeRegionHeading`, `HomeLaunchEvent`, `HomeLaunchVideo`, `HomeVideoCollection`, `HomeCountryViewsSection`, `SiteFooter`, `StadiumBg`, `proxy.ts`, or region IDs in `lib/regions.ts`. Region pages (`app/[locale]/[id]/page.tsx`) get one new section inserted, and `/resources` gets two new sections, but no existing component on those pages is modified.

## Problem & value

Two gaps to close:

1. **Discoverability of the NextSteps journeys.** Visitors landing on `football2026.nextstep.is` currently see a video carousel, a Zoom card, a region grid, and a country-views map — but the _interactive_ NextSteps journeys (the gospel walk-throughs Cru staff and partners actually share with friends) are buried inside the Resources page and not discoverable from the homepage or region pages. The set lives at <https://nextstep.is/football2026/> and contains four templates (Spiritual Conversation Starter, Prayer Connect, Gospel Encounter / Where You Belong, The FOUR | Sports). Surfacing them on the homepage and on every region page closes the gap.
2. **Consistency on /resources.** The Resources page currently uses a static grid; the homepage now has a polished carousel pattern. Bringing the same carousel-style sections onto `/resources` for both videos and journeys makes `/resources` feel like a richer extension of the homepage instead of a parallel page with different patterns.

## In scope

### One new section pattern: HomeJourneyCollection

Modeled directly on `HomeVideoCollection`: section eyebrow ("Collection · 4 items"), heading ("NextSteps journeys for the World Cup"), the same dark-glass card surface, and a "Watch full collection" → "Open full library" link in the top-right pointing at <https://nextstep.is/football2026/>.

Card shape per journey:

- Thumbnail image (still — no inline player, journeys aren't videos)
- Title + 1-line blurb (localized)
- External-link arrow in the corner
- Click target → the NextSteps template URL (`admin.nextstep.is/templates/<uuid>`)
- No duration badge, no play overlay (these are interactive web pages, not video)

Four journeys at curation time (2026-05-28):

| ID                               | Title                          | URL                                                                | Blurb                                                             |
| -------------------------------- | ------------------------------ | ------------------------------------------------------------------ | ----------------------------------------------------------------- |
| `spiritual-conversation-starter` | Spiritual Conversation Starter | `admin.nextstep.is/templates/d336c09c-25fd-41f9-8e19-2e944ce16b1b` | Pick a famous player and we'll surface a conversation prompt.     |
| `prayer-connect`                 | Prayer Connect                 | `admin.nextstep.is/templates/d941b7f7-621f-4ccc-ad3f-c49d7b53c06d` | "Do you pray for a win?" A simple onramp to talking about prayer. |
| `gospel-encounter`               | Where You Belong               | `admin.nextstep.is/templates/d3c0093f-06a7-4049-9a61-5b3ce7ae14c7` | A full gospel walk-through framed around belonging.               |
| `four-spiritual-laws`            | The FOUR · Sports              | `admin.nextstep.is/templates/be24ad2f-81b2-4741-a8ac-1e1819027b15` | The Four Spiritual Laws, written for sports fans.                 |

Layout: same two-row horizontal scroller pattern as `HomeVideoCollection` on desktop, with a 2-col grid on mobile. Right-edge fade communicates "more to scroll." Mobile shows a "Show all" CTA below the grid.

Since there are only 4 journeys (vs. 12 videos), the two-row scroller becomes one-row at most on wide viewports. Acceptable — the visual pattern still matches.

### Three placement targets

1. **Homepage** — slot `HomeJourneyCollection` directly below `HomeVideoCollection`, before the country-views map.
2. **Each region page** — slot it on the region page (`app/[locale]/[id]/page.tsx`) under the existing "mapPrompt" line ("Want to see how people around the world are responding to faith this season? Explore the map below."), before the map. Same component, same data — no region-specific filtering. The map remains last on the region page.
3. **Resources page** — slot both `HomeVideoCollection` and `HomeJourneyCollection` on `/resources`, above the existing three-category grid. Keeps the existing Ready-to-Use / Customizable / Physical Kits intact below.

### Region-page lead-in copy

User-supplied draft: _"Checkout first more nextsteps journeys you could also share."_

Refined options (pick one in plan):

- **A.** _"Have more to share? Try one of these NextSteps journeys."_
- **B.** _"Looking for more? These NextSteps journeys are ready to share."_
- **C.** _"More ways to start a conversation — share a NextSteps journey."_

Will use **A** unless overridden. Lives in `SharePanel.journeyPrompt` (new key) so it sits naturally next to the existing `mapPrompt`.

## Out of scope

- Building a custom NextSteps embed. We link out — NextSteps hosts the actual journey.
- Pulling the journey list live from a NextSteps API at request time. Catalog is frozen for the campaign window.
- Region-specific journey filtering. All regions show all 4 journeys for v1.
- Human translation of new strings. English source + machine-translated starter for the 11 non-English locales, same approach as `HomeVideoCollection`.
- Editing existing region-page or resources-page components beyond inserting the new section.

## Success criteria

- `/`, `/<locale>/`, `/<region>`, `/<locale>/<region>`, `/resources`, `/<locale>/resources` all render with the new `HomeJourneyCollection` section in the documented place.
- Each journey card opens its NextSteps template URL in a new tab.
- "Open full library" CTA opens <https://nextstep.is/football2026/> in a new tab.
- Right-edge fade scroll affordance reads the same as `HomeVideoCollection`.
- `test/messages.test.ts` passes across all 12 locales.
- Full quality gate green.

## Assumptions

- The four NextSteps templates listed on <https://nextstep.is/football2026/> on 2026-05-28 are the canonical campaign set. JFP may refresh them; the catalog is intentionally frozen and a maintainer updates `lib/journey-collection.ts` if needed.
- Linking to `admin.nextstep.is/templates/<uuid>` is the correct share target. Each template page lets the user preview the journey and clone-and-customize it. (If JFP later publishes customer-facing URLs at `your.nextstep.is/<slug>`, we'd swap.)
- Thumbnails on `nextstep.is/football2026/` are lazy-rendered SVG placeholders in the public HTML. For v1 we'll either use NextSteps-hosted thumbnails (if discoverable) or render a typography-led card without an image. Decision deferred to implementation; the brainstorm doesn't block on it.

## Risks

- **Thumbnail discovery.** The NextSteps page returned SVG data-URI placeholders in the curl-fetched HTML. Mitigation: either curl with a real browser UA to capture the rendered template thumbnails, or fall back to a clean typography-only card design (eyebrow + title + blurb + external arrow) — both work visually.
- **Region-page layout regression.** Inserting a new section between the share panel and the map shifts the map further down the page. Mitigation: keep the journey section visually compact and verify the existing animation/scroll behavior of `HomeCountryViewsSection` still triggers correctly.
- **Resources page bloat.** Adding two new carousel sections plus the existing three categories may make `/resources` feel long. Mitigation: place the carousels at the top (they're discoverable, scannable) and keep the existing static grid below as the deeper catalog.

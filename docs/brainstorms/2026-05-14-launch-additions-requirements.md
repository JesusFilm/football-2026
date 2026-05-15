# Launch Additions — Requirements

**Date:** 2026-05-14
**Scope:** Additive only. No changes to existing hero, region grid, country views, footer, region pages, `proxy.ts`, or i18n routing.

## Problem & Value

Three concurrent activations need surface area on the campaign microsite ahead of the May 28 launch call:

1. A **hero launch video** to give visitors a 30-second emotional onramp before they scroll into the region grid.
2. A **Zoom launch event card** to convert interested partners into registrants for the kickoff call.
3. A **/resources page** that consolidates the live JFP resource catalog (Ready-to-Use, Customizable, Physical Kits) so partners stop bouncing to two upstream pages.

## In Scope

### Addition 1 — Hero launch video (`components/home-launch-video.tsx`)

- Slot between `<HomeHero />` and `<HomeRegionHeading />` in `app/[locale]/page.tsx`.
- Desktop (≥641px): 16:9 YouTube embed, video id `k7F3RpqXhW8`.
- Mobile (≤640px): 9:16 YouTube Short embed, id `evGkJ_ZbJQQ`.
- Pure CSS swap via media query, no client JS.
- Both iframes `loading="lazy"`.
- i18n: `HomeLaunchVideo.eyebrow`, `HomeLaunchVideo.heading`, `HomeLaunchVideo.iframeTitle`.

### Addition 2 — Zoom launch event card (`components/home-launch-event.tsx`)

- Slot below `<HomeRegionGrid />` and above the country views `<Suspense>`.
- Event: World Cup 2026 Activation launch call, Thursday May 28, 2026, 9:00 AM EST, 60 min.
- Registration URL (new tab, `rel="noopener noreferrer"`): `https://staffweb.zoom.us/meeting/register/E9vxp8T5TLmyfii4gh8SXw`.
- Meeting ID `963 3748 1824` shown for reference.
- Stable values (URL, ID, ISO date, time, duration) live in `lib/launch-event.ts` — out of translations per AGENTS.md.
- Visual reuse: same card surface as `RegionCard` (rounded border, dark glass background, accent eyebrow); no new tokens.
- i18n: `HomeLaunchEvent.eyebrow`, `heading`, `body`, `cta`, `dateLabel`, `timeLabel`, `durationLabel`, `meetingIdLabel`.

### Addition 3 — `/resources` page (`app/[locale]/resources/page.tsx`)

- Three categories in order: Ready-to-Use, Customizable, Physical Kits.
- Catalog (curated from upstream JFP pages, frozen in `lib/resources.ts`):

  **Ready-to-Use**
  - `prayforawin` — PrayForAWin.com
  - `when-everything` — When Everything is On the Line
  - `where-you-belong` — Where You Belong (76 languages)
  - `i-belong-jesus` — YouVersion: I Belong to Jesus (Kaká)
  - `kingdom-playmaker` — YouVersion: Kingdom Playmaker (Eyong Enoh)
  - `fully-his` — YouVersion: Fully His (Jonathan Mensah)
  - `tools-transformation` — YouVersion: Tools for Transformation (Lucas Moura)

  **Customizable**
  - `nextsteps-templates` — NextSteps Journey Templates
  - `hope-ball-not-enough` — Hope Ball: When You Feel Like You're Not Enough
  - `hope-ball-joy-gone` — Hope Ball: When the Joy is Gone
  - `praying-hands-prayer` — Praying Hands
  - `praying-hands-talk-jesus` — Praying Hands: You Can Talk to Jesus
  - `ultimate-coach` — The Ultimate Coach
  - `most-asked-questions` — The Most Asked Questions Online
  - `after-the-win` — After the Win
  - `print-collection` — Print & Other Materials
  - `all-videos` — All Videos collection

  **Physical Kits**
  - `watch-party-kit` — Watch Party Kit (USA)
  - `movement-maker-kit` — Movement Maker Kit (Global)
  - `jesus-loves-you-ball` — Jesus Loves You Ball

- Resource IDs, URLs, and category enums live in `lib/resources.ts`; titles + blurbs come from `Resources.items.<id>.title` and `Resources.items.<id>.blurb`.
- Components: `components/resources-hero.tsx`, `components/resource-category.tsx`, `components/resource-card.tsx`.
- SEO: `generateMetadata` parallel to homepage (`Metadata.resourcesTitle`, `Metadata.resourcesDescription`) plus JSON-LD WebPage schema.
- Optional language count exposed as `languageCount` on resources that have one (Where You Belong: 76).

### Navigation

- New `Resources` link in `SiteHeader`, using `Link` from `i18n/navigation.ts`.
- Highlights when current path is `/resources`.
- i18n: `Header.resources`.

## Out of Scope

- Registration form (Zoom hosted page handles it).
- Backend, database, email, analytics events.
- New design tokens or fonts.
- Localized translations of the new strings — English source text is duplicated into all 12 locale files to keep `test/messages.test.ts` parity, with a follow-up translation pass tracked separately.
- Region page changes; country views logic.

## Success Criteria

- All three sections render on `/` (or `/<locale>`) without disturbing existing component order, animation timing, or layout breakpoints.
- `/resources` and `/<locale>/resources` both render with proper metadata and JSON-LD.
- Quality gate green: `pnpm lint && pnpm format:check && pnpm typecheck && pnpm test:run && pnpm build`.
- `test/messages.test.ts` passes across all 12 locales after key additions.
- Header "Resources" link works from English (`/resources`) and every prefixed locale (`/<locale>/resources`).

## Assumptions

- Localized translations of new copy are out of scope for this PR; English placeholders in all locale files are acceptable and tracked for a follow-up i18n pass.
- The two upstream JFP pages will not change before launch in a way that invalidates the curated catalog. Catalog is intentionally frozen in `lib/resources.ts` rather than fetched live.
- Existing dark glass card aesthetic from `RegionCard` is the right visual register for the Zoom card; no new tokens needed.

## Risks

- Locale parity test failure if any key is missed. Mitigation: write English first, then mirror keys structurally into each locale file in one pass.
- YouTube embed iframe sizing fights `aspect-ratio` CSS at narrow widths. Mitigation: wrap each iframe in an aspect-ratio container with overflow hidden, swap container visibility via Tailwind responsive utilities.

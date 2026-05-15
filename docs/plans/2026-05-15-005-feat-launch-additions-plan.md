---
title: "feat: Launch Additions — Hero Video, Zoom Event Card, /resources"
type: feat
status: active
date: 2026-05-15
origin: docs/brainstorms/2026-05-14-launch-additions-requirements.md
---

# feat: Launch Additions — Hero Video, Zoom Event Card, /resources

## Overview

Three additive sections land on the campaign microsite ahead of the June 1
launch call. Nothing existing changes: no edits to `HomeHero`,
`HomeRegionGrid`, `HomeRegionHeading`, `HomeCountryViewsSection`,
`SiteFooter`, `StadiumBg`, `proxy.ts`, `lib/regions.ts`, or region routes
under `app/[locale]/[id]/`. Each new piece reuses the existing token set
(`text-fg`, `text-accent`, `border-line`, `font-mono`, `font-display`),
the dark glass card aesthetic from `RegionCard`, and the locale-aware
`Link` from `@/i18n/navigation`.

Visual thesis: keep the page's quiet rhythm intact. The video sits between
hero and region grid as a held breath; the Zoom card lands below the
region grid as a single conversion beat; `/resources` is a quiet catalog
page using the same tokens and card surface as the homepage.

## Problem Frame

We need to add (1) a hero launch video that gives visitors a 30-second
emotional onramp before they pick a region, (2) a Zoom launch event card
that converts interested partners into registrants for the kickoff call,
and (3) a `/resources` page that consolidates the live JFP outreach
catalog so partners stop bouncing to two upstream pages. The site is
already serving 1M+ views across 12 locales; any addition must respect
the existing i18n parity contract (`test/messages.test.ts`), the RTL
support for `ar` and `ur`, and the existing standalone Railway deploy.

See origin: `docs/brainstorms/2026-05-14-launch-additions-requirements.md`.

## Requirements Trace

- **R1.** Hero video renders between `HomeHero` and `HomeRegionHeading`
  on the homepage in every locale.
- **R2.** Desktop (≥641px) shows a 16:9 YouTube embed of video
  `k7F3RpqXhW8`; mobile (≤640px) shows a 9:16 Short embed of `evGkJ_ZbJQQ`.
  Swap is pure CSS, no client JS.
- **R3.** Both iframes are lazy-loaded.
- **R4.** Zoom launch event card renders below the region grid and above
  the country views `Suspense` boundary, in every locale.
- **R5.** Card links to the Zoom registration URL in a new tab with
  `rel="noopener noreferrer"`. Meeting ID is shown for reference.
- **R6.** Stable values (URL, ID, ISO date, time, duration) live in
  `lib/launch-event.ts`, not in translation strings.
- **R7.** `/resources` (and `/<locale>/resources`) renders the catalog
  with three categories: Ready-to-Use, Customizable, Physical Kits.
- **R8.** Catalog entries (ids, URLs, category, optional `languageCount`)
  live in `lib/resources.ts`, frozen at write time.
- **R9.** A "Resources" link in `SiteHeader` navigates to `/resources`
  with locale-aware routing.
- **R10.** All new user-facing strings are keyed in `messages/en.json` and
  mirrored structurally in all 11 other locale files. English source values
  populate non-English locales for this PR; localization is a tracked
  follow-up.
- **R11.** `test/messages.test.ts` passes across all 12 locales.
- **R12.** `/resources` emits metadata and JSON-LD `WebPage` schema
  parallel to the homepage pattern in `app/[locale]/page.tsx`.
- **R13.** Full quality gate green:
  `pnpm lint && pnpm format:check && pnpm typecheck && pnpm test:run && pnpm build`.

## Scope Boundaries

- No custom registration form. Zoom hosted page handles registration.
- No backend, database, email, or analytics events.
- No new design tokens, fonts, or radius variables. Reuse what exists.
- No changes to region pages, country views logic, or JSONBin/Plausible
  fetchers.
- No live fetching of the upstream JFP resource pages. Catalog is curated
  and frozen at write time in `lib/resources.ts`.
- No localized translations of the new strings in this PR — English source
  text is duplicated into all 12 locale files to keep parity, with a
  follow-up translation pass tracked separately.

## Context & Research

### Relevant Code and Patterns

- **`app/[locale]/page.tsx`** — homepage composition. We slot the new
  components by importing them and rendering between existing siblings in
  the `<main>` block (lines 47–59). Server component with `dynamic =
"force-dynamic"` and JSON-LD schema in `<script>` block.
- **`components/home-hero.tsx`** — server component using
  `useTranslations("Home")` (next-intl supports this pattern in server
  components). Uses `hero-transition-item*` classes for staggered animation
  and arbitrary-value Tailwind clamps. The new video component should _not_
  hijack the hero animation timing.
- **`components/region-card.tsx`** — defines the dark-glass card surface
  the Zoom card and resource cards reuse:
  `rounded-[var(--radius-lg)] border border-line bg-[rgb(20_16_12_/_0.6)]
backdrop-blur-md`. Uses logical utilities (`end-5`, `pe-12`, `rtl-mirror`)
  for RTL safety.
- **`components/site-header.tsx`** — flex header with `<Link>` from
  `@/i18n/navigation` for the home link, `<LanguagePicker />` after it.
  We insert a nav slot between them.
- **`i18n/navigation.ts`** — `createNavigation(routing)` exposes a
  locale-aware `Link`, used everywhere for internal routing.
- **`messages/en.json`** — canonical key shape. Existing namespaces:
  `Metadata`, `Home`, `Regions`, `Region`, `Steps`, `CountryViews`,
  `SharePanel`, `Footer`, `Header`, `LanguagePicker`. We add three new
  namespaces (`HomeLaunchVideo`, `HomeLaunchEvent`, `Resources`) plus one
  key inside `Header`.
- **`test/messages.test.ts`** — structural parity test across all 12
  locales; enforces key-set equivalence.
- **`lib/regions.ts`** — pattern for module-level data with typed
  exports. `lib/launch-event.ts` and `lib/resources.ts` follow the same
  pattern: typed const arrays + named lookup helpers.

### External References

- YouTube embed URL convention: `https://www.youtube.com/embed/<id>`.
  `loading="lazy"` is honored by all modern browsers; the iframe is only
  network-fetched on scroll into view.
- Tailwind 4 supports `@media` arbitrary breakpoints natively; we use the
  `max-sm:` and `sm:` prefixes for the responsive video swap (Tailwind 4's
  default `sm` breakpoint is 640px, which matches the requirement at the
  640/641 boundary).
- Apps using YouTube Shorts via the `/embed/` URL must use the standard
  embed (not `/shorts/`). The `evGkJ_ZbJQQ` ID resolves cleanly when
  rendered in a 9:16 container.

## Key Technical Decisions

- **Two iframes, CSS-only swap.** Tailwind's `hidden sm:block` and
  `sm:hidden block` classes mount both iframes in the DOM but only render
  one. YouTube's `loading="lazy"` defers actual fetch until the displayed
  iframe is near the viewport. No JS, no flicker, SSR-safe.
- **Server components everywhere.** All three new top-level components
  (`HomeLaunchVideo`, `HomeLaunchEvent`, the `/resources` page) are server
  components using `useTranslations` (next-intl 3.x supports this for
  components without hooks-based state). No `"use client"` needed.
- **Reuse `RegionCard`'s card surface** for the Zoom event card and each
  resource card. Same border, background, backdrop blur, hover transition.
  Avoids introducing a second card vocabulary.
- **Catalog freeze.** `lib/resources.ts` is the single source of truth for
  resource ids/URLs/category. Titles and blurbs come from translations via
  `Resources.items.<id>.title` and `.blurb`. This keeps URLs (stable
  identifiers) out of translations per AGENTS.md, while keeping copy
  localizable.
- **English placeholders in non-English locales.** Faster path to parity
  and ship-ability. The translation team can replace English values later
  without changing key shape.
- **Resources nav link** lives in `SiteHeader` so it appears on every page
  (homepage, region pages, `/resources` itself). Locale-aware via
  `i18n/navigation`'s `Link`. A subtle current-page indicator is not
  required for v1; a follow-up can wire `usePathname` if desired.
- **No new SEO route in `sitemap.ts`** without confirming the sitemap
  generator pattern. After the homepage pattern is mirrored, the
  `/resources` page emits its own JSON-LD; if `app/sitemap.ts` is static,
  we extend it; if dynamic from regions, we add a `/resources` entry by
  hand. (Resolved during implementation.)

## Open Questions

### Resolved During Planning

- **Should we fetch the upstream JFP resource pages live?** No. Catalog
  is curated and frozen at write time. Upstream changes between now and
  June 1 are unlikely; a manual sync is faster and more reliable than
  building a fetcher for a one-time campaign.
- **Should the Zoom card use a different visual treatment than the region
  cards?** No. Reuse `border border-line bg-[rgb(20_16_12_/_0.6)]
backdrop-blur-md` to keep the page coherent. Card prominence comes from
  position (single card spanning full width below the grid), not from
  decoration.
- **Should we localize the date display?** Yes via i18n placeholders
  (`HomeLaunchEvent.dateLabel = "Monday, June 1, 2026"`,
  `timeLabel = "9:00 AM EST"`, `durationLabel = "60 min"`). Stable ISO
  date stays in `lib/launch-event.ts`.

### Deferred to Implementation

- **Whether to add an Apple Calendar / Google Calendar link** next to the
  Zoom registration CTA. Not in the brainstorm scope; defer to a follow-up.
- **Whether to show a current-page underline on the SiteHeader Resources
  link.** Skip in v1, revisit if it reads as ambiguous in review.

## High-Level Technical Design

```mermaid
flowchart TD
  Page[app/[locale]/page.tsx]

  subgraph existing [Existing — Untouched]
    Hero[HomeHero]
    Heading[HomeRegionHeading]
    Grid[HomeRegionGrid]
    Views[HomeCountryViewsSection]
  end

  subgraph new [New]
    Video[HomeLaunchVideo]
    Event[HomeLaunchEvent]
  end

  Page --> Hero
  Page --> Video
  Page --> Heading
  Page --> Grid
  Page --> Event
  Page --> Views

  Resources[/locale/resources page] --> ResourcesHero[ResourcesHero]
  Resources --> Cat1[ResourceCategory: Ready-to-Use]
  Resources --> Cat2[ResourceCategory: Customizable]
  Resources --> Cat3[ResourceCategory: Physical Kits]
  Cat1 -.uses.-> Card[ResourceCard]
  Cat2 -.uses.-> Card
  Cat3 -.uses.-> Card

  LibLE[lib/launch-event.ts] --> Event
  LibR[lib/resources.ts] --> Cat1
  LibR --> Cat2
  LibR --> Cat3

  Header[SiteHeader] -.adds link.-> Resources
```

## Implementation Plan

Work proceeds in dependency order so each commit is independently
buildable and the messages parity test stays green after every step.

### Step 1 — Data files

**Files added:**

- `lib/launch-event.ts`
- `lib/resources.ts`

`lib/launch-event.ts` exports:

```ts
export const LAUNCH_EVENT = {
  registrationUrl:
    "https://staffweb.zoom.us/meeting/register/E9vxp8T5TLmyfii4gh8SXw",
  meetingId: "963 3748 1824",
  dateIso: "2026-06-01T13:00:00Z", // 9 AM ET (EDT)
  durationMinutes: 60,
} as const;
```

`lib/resources.ts` exports a typed `Resource` shape and a frozen array:

```ts
export type ResourceCategory = "ready-to-use" | "customizable" | "physical-kit";

export type Resource = {
  id: string; // stable, used as translation key
  url: string;
  category: ResourceCategory;
  languageCount?: number; // optional, displayed when present
};

export const RESOURCES: readonly Resource[] = [
  // Ready-to-use (7)
  { id: "prayforawin", url: "...", category: "ready-to-use" },
  // ...
  {
    id: "where-you-belong",
    url: "...",
    category: "ready-to-use",
    languageCount: 76,
  },
  // Customizable (10)
  // Physical Kits (3)
] as const;

export function resourcesByCategory(
  category: ResourceCategory,
): readonly Resource[] {
  return RESOURCES.filter((r) => r.category === category);
}
```

All 20 resource URLs come from the brainstorm's curated list.

### Step 2 — i18n keys

**Files modified:**

- `messages/en.json` (canonical)
- `messages/ar.json`, `bn.json`, `de.json`, `es.json`, `fr.json`,
  `hi.json`, `id.json`, `pt-BR.json`, `ru.json`, `ur.json`, `zh-Hans.json`
  (English placeholders, same structure)

**New top-level namespaces:**

```
HomeLaunchVideo: { eyebrow, heading, iframeTitle }
HomeLaunchEvent: { eyebrow, heading, body, cta, dateLabel, timeLabel,
                   durationLabel, meetingIdLabel }
Resources: {
  eyebrow, tagline, title, description,
  categories: { readyToUse: { heading, body },
                customizable: { heading, body },
                physicalKits: { heading, body } },
  languageCountLabel,
  openCta,
  items: {
    prayforawin: { title, blurb },
    "when-everything": { title, blurb },
    // ... all 20 ids
  }
}
```

**New keys added to existing namespaces:**

```
Header.resources       — "Resources"
Metadata.resourcesTitle  — "Resources — World Cup 2026 Activation"
Metadata.resourcesDescription
Metadata.resourcesSchemaName
```

`test/messages.test.ts` runs after this step to confirm parity before any
component work.

### Step 3 — Hero launch video

**Files added:**

- `components/home-launch-video.tsx`

**Files modified:**

- `app/[locale]/page.tsx` — import + render between `<HomeHero />` and
  `<HomeRegionHeading />`.

```tsx
// home-launch-video.tsx
import { useTranslations } from "next-intl";

const VIDEO_ID_DESKTOP = "k7F3RpqXhW8";
const VIDEO_ID_MOBILE = "evGkJ_ZbJQQ";

export function HomeLaunchVideo() {
  const t = useTranslations("HomeLaunchVideo");
  return (
    <section className="px-0 py-8 sm:py-10">
      <div className="mb-4 text-center">
        <span className="font-mono text-[11px] tracking-[0.18em] text-accent uppercase">
          {t("eyebrow")}
        </span>
        <h2 className="mt-2 font-display text-[clamp(22px,3vw,32px)] font-extrabold tracking-[-0.01em] text-fg">
          {t("heading")}
        </h2>
      </div>
      <div className="mx-auto max-w-[960px]">
        {/* Desktop: 16:9 */}
        <div className="hidden sm:block aspect-video overflow-hidden rounded-[var(--radius-lg)] border border-line bg-[rgb(20_16_12_/_0.6)]">
          <iframe ... loading="lazy" title={t("iframeTitle")} />
        </div>
        {/* Mobile: 9:16 */}
        <div className="sm:hidden mx-auto max-w-[360px] aspect-[9/16] overflow-hidden rounded-[var(--radius-lg)] border border-line bg-[rgb(20_16_12_/_0.6)]">
          <iframe ... loading="lazy" title={t("iframeTitle")} />
        </div>
      </div>
    </section>
  );
}
```

### Step 4 — Zoom launch event card

**Files added:**

- `components/home-launch-event.tsx`

**Files modified:**

- `app/[locale]/page.tsx` — import + render between `<HomeRegionGrid />`
  and `<Suspense>`.

```tsx
import { useTranslations } from "next-intl";
import { LAUNCH_EVENT } from "@/lib/launch-event";

export function HomeLaunchEvent() {
  const t = useTranslations("HomeLaunchEvent");
  return (
    <section className="px-0 py-8 sm:py-10">
      <article className="mx-auto max-w-[960px] rounded-[var(--radius-lg)] border border-line bg-[rgb(20_16_12_/_0.6)] backdrop-blur-md p-6 sm:p-8 grid sm:grid-cols-[1fr_auto] gap-6 items-center">
        <div>
          <span className="font-mono text-[11px] tracking-[0.18em] text-accent uppercase">
            {t("eyebrow")}
          </span>
          <h2 className="mt-2 font-display text-[clamp(22px,3vw,32px)] font-extrabold tracking-[-0.01em] text-fg">
            {t("heading")}
          </h2>
          <p className="mt-3 text-fg-dim leading-[1.55]">{t("body")}</p>
          <dl className="mt-4 text-sm text-fg-mute space-y-1">
            <div>
              <dt className="inline">{t("dateLabel")}:</dt>{" "}
              <dd className="inline">...</dd>
            </div>
            <div>
              <dt className="inline">{t("timeLabel")}:</dt>{" "}
              <dd className="inline">...</dd>
            </div>
            <div>
              <dt className="inline">{t("durationLabel")}:</dt>{" "}
              <dd className="inline">...</dd>
            </div>
            <div>
              <dt className="inline">{t("meetingIdLabel")}:</dt>{" "}
              <dd className="inline">{LAUNCH_EVENT.meetingId}</dd>
            </div>
          </dl>
        </div>
        <a
          href={LAUNCH_EVENT.registrationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-md bg-accent px-5 py-3 font-medium text-white no-underline hover:bg-accent-hover transition-colors"
        >
          {t("cta")}
        </a>
      </article>
    </section>
  );
}
```

### Step 5 — `/resources` page + components

**Files added:**

- `app/[locale]/resources/page.tsx`
- `components/resources-hero.tsx`
- `components/resource-category.tsx`
- `components/resource-card.tsx`

`app/[locale]/resources/page.tsx` mirrors `app/[locale]/page.tsx`:

- Receives `params` with `locale`, calls `setRequestLocale`.
- Exports `generateMetadata` returning `Metadata.resourcesTitle` /
  `resourcesDescription`.
- Renders `<StadiumBg />`, `<SiteHeader />`, `<main>` with
  `ResourcesHero` + three `ResourceCategory` sections, then `<SiteFooter />`.
- Emits JSON-LD `WebPage` schema parallel to the homepage.

`ResourceCategory` accepts a `category: ResourceCategory` prop, pulls
items via `resourcesByCategory(category)`, and renders a heading + grid
of `ResourceCard` items.

`ResourceCard` is a server component (no hover state beyond CSS) that
takes a `Resource` prop, looks up title/blurb via
`useTranslations("Resources").raw(`items.${id}`)`, renders the same
glass-card surface as `RegionCard`, links to `resource.url` in a new tab.

### Step 6 — SiteHeader nav link

**Files modified:**

- `components/site-header.tsx`

Add a `<nav>` between the home `<Link>` and `<LanguagePicker />`:

```tsx
<nav className="ms-auto me-4 flex items-center">
  <Link
    href="/resources"
    className="font-mono text-[11px] tracking-[0.18em] text-fg-dim uppercase hover:text-fg transition-colors"
  >
    {t("resources")}
  </Link>
</nav>
```

The `ms-auto` pushes the link to the end of the header before the language
picker, RTL-safe.

### Step 7 — Sitemap entry (if needed)

**Files modified (conditional):**

- `app/sitemap.ts`

If `app/sitemap.ts` enumerates routes statically, add `/resources` to the
list. If it derives from `regions`, append a hardcoded `/resources` entry.
Determined during implementation.

## i18n Plan

The non-English locale files receive **structurally identical** keys with
**English values** as placeholders. `test/messages.test.ts` only enforces
key-set parity, not value translation. Example:

`messages/en.json` (added):

```json
"HomeLaunchVideo": {
  "eyebrow": "Watch",
  "heading": "Why this moment matters",
  "iframeTitle": "World Cup 2026 launch video"
}
```

`messages/ar.json` (added, same shape, English placeholders):

```json
"HomeLaunchVideo": {
  "eyebrow": "Watch",
  "heading": "Why this moment matters",
  "iframeTitle": "World Cup 2026 launch video"
}
```

Translation pass is tracked as a follow-up issue (not in this PR).

## Test Plan

- **Existing:** `test/messages.test.ts` runs unchanged and passes —
  proves key-set parity across all 12 locales.
- **New, lightweight:** `test/launch-event.test.ts` —
  - Asserts `LAUNCH_EVENT.registrationUrl` matches the expected Zoom URL
    pattern (`/^https:\/\/staffweb\.zoom\.us\/meeting\/register\//`).
  - Asserts `meetingId` matches the documented format.
- **New, lightweight:** `test/resources.test.ts` —
  - Asserts every `Resource.id` has a corresponding key in
    `messages/en.json` under `Resources.items.<id>`.
  - Asserts `RESOURCES` covers all three categories with at least one
    entry each.
  - Asserts no duplicate ids.
- **Component-level:** no Vitest renders for the new presentational
  components in this PR. They are pure server-rendered output with no
  conditional logic worth covering; the type system + parity test cover
  the failure modes.

## Quality Gate

Run in order before declaring the work done:

```bash
pnpm lint
pnpm format:check
pnpm typecheck
pnpm test:run
pnpm build
```

All five must pass. The `build` step doubles as a runtime check that the
new page renders without missing translation errors.

## Risks & Mitigations

- **Locale parity drift.** Each translation file must receive the exact
  same key shape. _Mitigation:_ write English first, then mirror keys in
  a single pass; rely on `test/messages.test.ts` to catch gaps.
- **YouTube iframe sizing under Tailwind 4.** `aspect-video` and
  `aspect-[9/16]` are supported, but iframe + container width interaction
  can cause overflow. _Mitigation:_ wrap each iframe in an
  `overflow-hidden` container with explicit `aspect-ratio`.
- **Catalog drift after launch.** Upstream JFP pages may add or remove
  resources before June 1. _Mitigation:_ document the curation date in a
  comment at the top of `lib/resources.ts`; encourage a manual sync as
  part of pre-launch checks.
- **RTL layout in the Zoom card.** The `grid-cols-[1fr_auto]` layout
  inverts naturally in RTL via the browser's direction handling.
  _Mitigation:_ verify visually with `ar` locale before merging.
- **Pre-commit hook `pnpm` lookup.** Husky's hook runs in a minimal shell
  that may not include user-level `pnpm`. _Mitigation:_ documented in
  `docs/solutions/` after the workflow shakes out; for local work, a
  `~/.config/husky/init.sh` exporting `PNPM_HOME` resolves it.

## Out of Scope (recap)

- Custom registration form
- Backend / database / email
- Localized translations (English placeholders ship; translation is a
  follow-up)
- Region page changes
- New design tokens
- Live fetch of upstream JFP resource pages

## Expected Diff Surface

New files (8):

- `lib/launch-event.ts`
- `lib/resources.ts`
- `components/home-launch-video.tsx`
- `components/home-launch-event.tsx`
- `components/resources-hero.tsx`
- `components/resource-category.tsx`
- `components/resource-card.tsx`
- `app/[locale]/resources/page.tsx`

New tests (2):

- `test/launch-event.test.ts`
- `test/resources.test.ts`

Modified files (15):

- `app/[locale]/page.tsx` (add two imports + two JSX slots)
- `components/site-header.tsx` (add nav link)
- `app/sitemap.ts` (conditional — add `/resources`)
- `messages/en.json` + 11 other locale JSON files

Solution doc (1, after work completes):

- `docs/solutions/2026-05-15-launch-additions.md`

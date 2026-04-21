---
title: feat: Add Country Views Map
type: feat
status: active
date: 2026-04-21
origin: docs/brainstorms/2026-04-21-region-country-views-map-requirements.md
---

# feat: Add Country Views Map

## Overview

Replace the placeholder at the bottom of each region page with a country-level views map and ranked list backed by the JSONBin payload. JSONBin becomes the canonical source for region labels and country membership, while the app keeps its existing route IDs and team IDs.

Visual thesis: extend the existing stadium-toolkit interface with a dark, data-forward map section that feels like an impact dashboard, using restrained accent color, stable panels, and scannable country rankings.

## Problem Frame

Region pages currently promise a "Where The Story is Spreading" map but only render a placeholder. The feature needs to show `[JourneyViews]` for every country in the current JSONBin region and resolve existing taxonomy drift by treating `prod_geo[cru_global_region]` as the source of truth (see origin: `docs/brainstorms/2026-04-21-region-country-views-map-requirements.md`).

## Requirements Trace

- R1-R4. Render a bottom-of-page country views section that is useful on desktop and mobile.
- R5-R8. Normalize JSONBin rows into valid country view records, filtering aggregate and non-country artifacts.
- R9-R12. Make JSONBin region labels canonical for country views, with `Other/Unknown` excluded from normal region navigation.
- R13-R14. Keep pages resilient when JSONBin fails and choose a concrete cache/revalidation policy.

## Scope Boundaries

- No country detail pages.
- No analytics pipeline or JSONBin schema changes.
- No URL churn for existing region routes.
- No real-time streaming updates.
- `Other/Unknown` is not added as a public activation region in this plan.

## Context & Research

### Relevant Code and Patterns

- `lib/journeys.ts` shows the existing server-side fetch helper pattern: typed normalization, explicit errors, and Next.js `fetch` revalidation.
- `lib/regions.ts` owns region route IDs, display metadata, team IDs, and current hard-coded country arrays.
- `app/[id]/page.tsx` is the insertion point. It already fetches region journeys server-side and renders the current map placeholder.
- `components/region-share-panel.tsx` is the closest interactive data component. It uses a client component with explicit props and local state.
- `test/journeys.test.ts` shows the current Vitest pattern for mocking `fetch` and asserting normalized output.

### External References

- `react-svg-worldmap` is a better fit than `react-simple-maps` for this repo because it accepts ISO 3166-1 alpha-2 codes, bundles the map locally, has React `>=16.8` peer dependencies, and avoids runtime map API calls.
- `react-simple-maps` v3 documents good TopoJSON/GeoJSON and choropleth primitives, but its published peer dependencies currently stop at React 18, while this app uses React 19.2.5.

## Key Technical Decisions

- Add a canonical JSONBin region code to each app region, and move `Region.code` toward the JSONBin label. If compact UI labels are still needed, add a separate `shortCode`/`displayCode` rather than overloading the analytics code.
- Derive the region page country count from normalized JSONBin country rows instead of `region.countries`.
- Fetch JSONBin server-side and pass normalized rows into a client map/list component. This keeps remote fetch behavior centralized and avoids exposing future access keys in browser code.
- Use `react-svg-worldmap` for the first geographic visualization. It matches the data shape with lowercase ISO alpha-2 country codes and avoids a heavier tile-map stack.
- Pair the map with a ranked country list. A map alone will underserve small countries and territories, especially on mobile.
- Use a one-hour revalidation window initially, matching `fetchJourneys`, unless implementation uncovers a stronger product reason for a different value.

## Open Questions

### Resolved During Planning

- **Should Mexico follow app grouping or JSONBin grouping?** JSONBin wins. Mexico appears in `LAC`, not `NAmOceania`.
- **Should `Other/Unknown` become a public region?** No for this plan. Treat it as a recognized data bucket that is filtered out of normal region navigation.
- **Should the map use `react-simple-maps`?** No. Its current peer dependency range does not include React 19, and this app only needs a bundled SVG world map.

### Deferred to Implementation

- **Exact map package behavior under Next.js SSR:** If `react-svg-worldmap` does not render cleanly in SSR, keep the data fetch server-side but render the map component client-only.
- **Country code coverage gaps:** Validate which JSONBin alpha-2 codes are unsupported by the bundled map and show those countries in the ranked list even when they cannot be highlighted on the map.

## High-Level Technical Design

> _This illustrates the intended approach and is directional guidance for review, not implementation specification. The implementing agent should treat it as context, not code to reproduce._

```mermaid
flowchart LR
  JSONBin[JSONBin country rows] --> Fetch[fetchCountryViews]
  Fetch --> Normalize[normalize + filter rows]
  Normalize --> RegionFilter[filter by region.code JSON label]
  RegionFilter --> Page[app/[id]/page.tsx]
  Page --> Section[CountryViewsSection]
  Section --> Map[SVG world map]
  Section --> Ranking[Ranked country list]
```

## Implementation Units

- [ ] **Unit 1: Canonicalize Region Codes**

**Goal:** Update region configuration so each region carries the JSONBin region label as its canonical country-views code while preserving existing route IDs and team IDs.

**Requirements:** R2, R9-R12

**Dependencies:** None

**Files:**

- Modify: `lib/regions.ts`
- Test: `test/regions.test.ts`

**Approach:**

- Introduce a constrained region-code type for JSONBin labels rendered by normal region pages: `Africa`, `East Asia`, `Europe`, `LAC`, `NAMESTAN`, `NAmOceania`, `SESA`.
- Exclude `Other/Unknown` from `REGIONS` unless a future product decision adds an unclassified page.
- Make `Region.code` or a new explicit field hold the canonical JSONBin label. If visible compact codes are still desirable, split them into a separate display field.
- Remove or de-emphasize `countries` as a source of truth. Keep it only if it has a display-only purpose; otherwise plan to replace count usage with JSONBin-derived data.

**Patterns to follow:**

- Current static `REGIONS` shape and `getRegion` lookup in `lib/regions.ts`.

**Test scenarios:**

- Happy path: every region in `REGIONS` has a JSONBin region label from the allowed set.
- Edge case: `REGIONS` does not include `Other/Unknown`.
- Regression: `getRegion` still resolves every existing route ID.
- Data correctness: the `NAmOceania` region no longer lists Mexico as country-view membership if display country arrays remain.

**Verification:**

- Region routes remain stable.
- Region metadata can be used directly to filter JSONBin rows.

- [ ] **Unit 2: Add Country Views Data Helper**

**Goal:** Fetch and normalize JSONBin country views into typed records that are safe for rendering.

**Requirements:** R2, R5-R8, R10, R13-R14

**Dependencies:** Unit 1

**Files:**

- Create: `lib/country-views.ts`
- Test: `test/country-views.test.ts`

**Approach:**

- Add a server-side helper that fetches `https://api.jsonbin.io/v3/b/69d452a936566621a8867f6b?meta=false`.
- Normalize raw keys into explicit fields: `countryName`, `regionCode`, `countryCode`, and `journeyViews`.
- Exclude the aggregate-only row and non-country artifacts like `Error` and `Unknown`.
- Preserve real rows without `countryCode` only when they represent a real country/territory, so they can appear in a list fallback without breaking the map.
- Return a non-throwing result for JSONBin failures so `app/[id]/page.tsx` can still render the region page with an unavailable state.
- Use one-hour Next.js revalidation and a stable fetch tag such as `country-views`.

**Patterns to follow:**

- Typed normalization and fetch caching in `lib/journeys.ts`.
- Fetch mocking style in `test/journeys.test.ts`.

**Test scenarios:**

- Happy path: valid JSONBin rows normalize into typed country view records with numeric `journeyViews`.
- Filtering: aggregate-only row is excluded.
- Filtering: `Error` and `Unknown` rows are excluded.
- Edge case: `Kosovo` without `prod_geo[iso3_2]` is preserved as a list-only real row.
- Region filtering: Mexico is returned for `LAC` and not returned for `NAmOceania`.
- Error path: non-OK response returns an unavailable result instead of throwing into the page.
- Error path: malformed JSON or unexpected shape returns an unavailable result with no render-breaking exception.

**Verification:**

- Data helper produces stable, sorted country rows for every canonical app region.
- The page can distinguish "no rows" from "data unavailable."

- [ ] **Unit 3: Build Country Views Map Section**

**Goal:** Create a responsive bottom-of-page section with a world map, top-country highlights, and a complete ranked list for the selected region.

**Requirements:** R1-R8, R13

**Dependencies:** Unit 2

**Files:**

- Create: `components/country-views-section.tsx`
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`
- Test: `test/country-views-section.test.tsx`

**Approach:**

- Add `react-svg-worldmap` with `pnpm`.
- Implement a client component that receives normalized country rows and an availability state from the server.
- Feed map data as lowercase alpha-2 codes with `journeyViews` values.
- Render a ranked list for every row, including list-only countries/territories without a mappable code.
- Use a compact stats header: total views, country count, and top country.
- Style with existing Tailwind tokens, radii, font families, border colors, and accent color. Avoid nested cards; use one framed section with clear internal layout.
- Provide empty and unavailable states with concise product UI copy, not implementation commentary.
- Keep mobile layout list-first or stacked so long country names and counts do not overlap.

**Patterns to follow:**

- Existing dark framed panel treatment in `components/region-share-panel.tsx`.
- Section heading style currently used in `app/[id]/page.tsx`.
- Frontend-design Module C: match the existing system, define clear states, and verify visually after implementation.

**Test scenarios:**

- Happy path: renders section heading, total views, top country, and all country rows.
- Happy path: passes only rows with valid `countryCode` into the map data.
- Edge case: renders list-only rows without trying to map them.
- Empty state: renders a clear message when the region has no country rows.
- Error state: renders an unavailable state when JSONBin fetch failed.
- Accessibility: map/list section has an accessible heading and country rows expose country names and formatted view counts.

**Verification:**

- The placeholder copy is gone.
- Map and ranked list both reflect the same normalized country-view data.
- Layout remains stable with long names such as `Tanzania, United Republic of` and `Micronesia, Federated States of`.

- [ ] **Unit 4: Integrate Section into Region Pages**

**Goal:** Replace the existing placeholder in `app/[id]/page.tsx` with the real country views section and update counts to reflect JSONBin-derived membership.

**Requirements:** R1-R4, R9-R14

**Dependencies:** Units 1-3

**Files:**

- Modify: `app/[id]/page.tsx`
- Test: `test/region-page-country-views.test.tsx`

**Approach:**

- Fetch journeys and country views server-side for the current region.
- Use the canonical JSONBin region code to filter country views.
- Replace the placeholder block under "Where The Story is Spreading" with `CountryViewsSection`.
- Update the region hero country count to use the normalized country row count when data is available; use a graceful fallback if unavailable.
- Keep the existing route, metadata, and share-panel behavior unchanged.

**Patterns to follow:**

- Existing server component structure in `app/[id]/page.tsx`.
- Existing `notFound()` handling for unknown routes.

**Test scenarios:**

- Happy path: a region page renders country views for its JSONBin region.
- Data correctness: `NAmOceania` page excludes Mexico when mock JSONBin classifies Mexico as `LAC`.
- Error path: JSONBin failure still renders the page and share panel with an unavailable country views section.
- Regression: unknown region IDs still call `notFound()`.

**Verification:**

- Every existing region route renders the new section.
- No route ID or team ID changes are required.

- [ ] **Unit 5: Visual and Quality Verification**

**Goal:** Verify the feature behaves and looks correct across responsive viewports and complete the project quality gate.

**Requirements:** R1-R4, R13

**Dependencies:** Units 1-4

**Files:**

- Modify: implementation files only if visual or test fixes are needed.

**Approach:**

- Run the narrow tests while iterating, then the full repo gate from `AGENTS.md`.
- Start the Next.js dev server and inspect representative region pages.
- Capture desktop and mobile screenshots for at least one high-country-count region and one low-country-count region.
- Check that long country names, map labels/tooltips, and ranked rows do not overlap or clip.

**Patterns to follow:**

- `AGENTS.md` quality gate: `pnpm lint`, `pnpm format:check`, `pnpm typecheck`, `pnpm test:run`, `pnpm build`.

**Test scenarios:**

- Test expectation: none beyond the feature tests above. This unit is verification and polish.

**Verification:**

- Full quality gate passes, or any failure is documented with the relevant command and error.
- Visual review confirms the new section fits the existing design system on desktop and mobile.

## System-Wide Impact

- **Interaction graph:** Region pages gain a second external data source. The share panel and journey fetch remain independent.
- **Error propagation:** JSONBin failures should stop at the country views section and must not take down region pages.
- **State lifecycle risks:** Cached country views may briefly lag the JSONBin object; one-hour revalidation is accepted for the first implementation.
- **API surface parity:** No public route or API endpoint changes. Region config type changes may affect all components importing `Region`.
- **Integration coverage:** Page-level tests should prove the country views helper, region config, and section integration work together.
- **Unchanged invariants:** `REGIONS` route IDs, `teamId` values, metadata generation, and journey-sharing flows remain unchanged.

## Risks & Dependencies

| Risk                                                                      | Mitigation                                                                                                                               |
| ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Map package does not cover every JSONBin country/territory code           | Keep the ranked list as the complete source of visible country rows and treat the map as geographic visualization, not sole data access. |
| `react-svg-worldmap` SSR behavior conflicts with Next.js server rendering | Keep fetches server-side and isolate map rendering in a client component; use dynamic import only if implementation proves it necessary. |
| Region code changes break UI that expects short labels                    | Split canonical JSONBin code from compact display code if needed, and add region config tests.                                           |
| JSONBin shape changes                                                     | Normalize defensively and render unavailable state instead of throwing.                                                                  |
| High-country regions become visually dense                                | Pair map with ranked list, responsive stacking, and stable row dimensions.                                                               |

## Documentation / Operational Notes

- No user-facing docs required.
- The final PR description should call out the JSONBin taxonomy decision, especially Mexico moving under `LAC` for country views.
- If JSONBin later becomes private, move the key into server-only environment configuration without changing the client component contract.

## Sources & References

- **Origin document:** `docs/brainstorms/2026-04-21-region-country-views-map-requirements.md`
- Related code: `lib/regions.ts`
- Related code: `lib/journeys.ts`
- Related code: `app/[id]/page.tsx`
- External package: `react-svg-worldmap` npm README
- External docs considered: React Simple Maps `Geographies` and `Styling` documentation

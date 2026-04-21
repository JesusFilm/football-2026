---
date: 2026-04-21
topic: region-country-views-map
---

# Region Country Views Map

## Problem Frame

Each region page currently ends with a placeholder for "Where The Story is Spreading." The next iteration should turn that placeholder into a real country-level views section backed by the public JSONBin data so regional activators can see where journey views are coming from across the countries in that region.

The JSONBin payload should now be treated as the true source for region taxonomy and country membership. Existing app region codes and hard-coded country lists are legacy display/config data where they disagree with the JSONBin object.

## Data Observations

- The JSONBin payload is readable at `https://api.jsonbin.io/v3/b/69d452a936566621a8867f6b?meta=false`.
- The payload contains 246 rows: one aggregate-looking row with only `[JourneyViews]`, and 245 country-like rows.
- Country rows use `prod_geo[country_name]`, `prod_geo[cru_global_region]`, `prod_geo[iso3_2]`, and `[JourneyViews]`.
- 241 country rows include `prod_geo[iso3_2]`; `Antarctica`, `Error`, `Unknown`, and `Kosovo` do not.
- JSON region labels are `Africa`, `East Asia`, `Europe`, `LAC`, `NAMESTAN`, `NAmOceania`, `Other/Unknown`, and `SESA`.
- App region codes currently diverge from the JSON labels: `NAO` should align to `NAmOceania`, `EUR` to `Europe`, `EA` to `East Asia`, and `AFR` to `Africa`.
- Mexico belongs to `LAC` under the JSONBin taxonomy and should no longer be treated as part of `NAmOceania` for country views.

## Requirements

**Region Page Experience**

- R1. Every valid region page must show a country-level views section at the bottom, replacing the current map placeholder.
- R2. The section must show view counts for every country in the JSONBin data that belongs to the current JSONBin region label.
- R3. The section must make the highest-view countries easy to identify without requiring users to inspect every row manually.
- R4. The section must handle regions with many countries on mobile without producing overlapping text, clipped controls, or an unreadable map.

**Country Data Behavior**

- R5. Country rows must display the country name and `[JourneyViews]` value from JSONBin.
- R6. Rows without a real country identity, such as `Error` and `Unknown`, must not appear as normal countries.
- R7. Country rows without `prod_geo[iso3_2]` must not break the map or country list; they can appear in a non-map fallback list only if they represent a real country or territory.
- R8. The aggregate-looking first row with only `[JourneyViews]` must be excluded from country rendering.

**Region Mapping**

- R9. The app's region configuration must include the canonical JSONBin region label for each region it renders.
- R10. Country membership for the map/views section must come from `prod_geo[cru_global_region]`, not from the current hard-coded `countries` arrays when the two disagree.
- R11. Existing display names, route IDs, and team IDs may remain app-controlled, but the country views section must use JSONBin labels as the region code source of truth.
- R12. `Other/Unknown` must be recognized as a JSONBin data bucket, but it should not be presented as a normal activation region unless the product explicitly chooses to add an unclassified/other page.

**Reliability and Freshness**

- R13. If JSONBin is unavailable or malformed, region pages must still render with a clear empty or unavailable state for the country views section.
- R14. View counts should be treated as live or frequently refreshed data unless planning determines a specific caching policy.

## Success Criteria

- Every region page has a real country views section instead of the "Coming next pass" placeholder.
- Users can quickly see which countries in a region have the most journey views.
- The section does not expose JSON artifacts like aggregate rows, `Error`, or `Unknown`.
- The experience remains usable on desktop and mobile for high-country-count regions such as Europe, Africa, and Latin America & Caribbean.
- The implementation has an explicit, testable rule that app regions use JSONBin region labels for country views.
- Mexico appears in the `LAC` country views data, not in `NAmOceania`.

## Scope Boundaries

- This brainstorm covers the country-level views section only; it does not add country detail pages.
- It does not change the source JSONBin object or require a new analytics pipeline.
- It does not require every public route, title, or marketing label to be renamed, but it does require country views to follow the JSONBin region taxonomy.
- It does not require real-time streaming updates.

## Key Decisions

- Use JSONBin as the source of truth for country view counts: this matches the requested data source and avoids duplicating analytics data in the app.
- Use JSONBin as the source of truth for region labels and country membership in the country views section: this resolves current mismatches by grounding the feature in the returned analytics object.
- Treat the current placeholder as the insertion point: this keeps the feature scoped to an already-planned region page section.
- Keep app-facing route IDs and friendly names separate from JSONBin region labels: this avoids unnecessary URL churn while still making the analytics taxonomy explicit.
- Prefer a map plus scannable country ranking over a map alone: small countries and territories can be hard to inspect visually, especially on mobile.

## Dependencies / Assumptions

- The phrase "views for every country" means showing `[JourneyViews]` per country from the JSONBin payload.
- `prod_geo[iso3_2]` is intended to be a two-letter country or territory code, despite the field name containing `iso3`.
- The public JSONBin URL is acceptable for application use; if access restrictions are added later, the app will need a server-side fetch path.
- The current region page route structure in `app/[id]/page.tsx` remains the place where the section appears.
- Planning should treat current `lib/regions.ts` country arrays as candidates for replacement or derivation from JSONBin data.

## Outstanding Questions

### Resolve Before Planning

- None.

### Deferred to Planning

- [Affects R1-R4][Technical] Should the visual map use an added map dependency, static GeoJSON/SVG assets, or a simpler ranked geographic panel for the first implementation?
- [Affects R12][Product] Should `Other/Unknown` get any visible experience, or remain filtered out of normal region navigation while its valid territories are handled only where needed?
- [Affects R14][Technical] What cache/revalidation policy should the JSONBin fetch use in Next.js?

## Next Steps

-> `/ce:plan` for structured implementation planning.

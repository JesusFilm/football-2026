# Add Team Tidy Up section to the homepage

**Date:** 2026-06-10
**Origin:** Same TTU section that landed at the top of `/resources` in PR #17 should also appear on the homepage so it's discoverable from the first surface partners hit.
**Scope:** One-line slot edit on the homepage. Zero new code, zero new copy, zero i18n changes.

## What

Render the existing `<HomeTeamTidyUpSection />` on the homepage, slotted **right after the hero video and before the Global Football Media Collection**.

Homepage section order after this change:

1. HomeHero
2. HomeRegionHeading
3. HomeRegionGrid
4. HomeLaunchVideo
5. **HomeTeamTidyUpSection** ← new slot
6. HomeVideoCollection
7. HomeJourneyCollection
8. HomeCountryViewsStream

## Why

- Partners landing on the homepage today see: hero → "Activate Your Region" video → directly into the media collection. The metaverse game is a high-signal asset; surfacing it on the homepage matches its prominence on `/resources`.
- Reuses the same component, same content, same i18n keys, same CTA, same image — zero net new surface area.
- The placement (under the video, above the media collection) puts it next to the other "watch / play" experiences rather than the strategy / mobilization rows.

## In scope

- One import + one slot in `app/[locale]/page.tsx`.

## Out of scope

- New copy, new image, new i18n. The 13-locale i18n shipped with PR #17 already covers it.
- Region pages. Homepage only (for now).
- A second header-dropdown entry. The existing dropdown's "Team Tidy Up" anchor still points at `/resources#teamtidyup-heading`; that's the right destination from anywhere on the site for the deep-link case.

## Risks

- **Anchor ID collision.** Both pages now render an H2 with `id="teamtidyup-heading"`. IDs are scoped per document, so this is fine in HTML, but the header dropdown's `/resources#teamtidyup-heading` link will always navigate to `/resources` even when the section is already visible on the homepage. Acceptable — keeping the dropdown destination consistent is more important than saving one cross-page navigation.

## Decisions resolved

| Decision                                 | Resolution                                                           |
| ---------------------------------------- | -------------------------------------------------------------------- |
| Reuse `<HomeTeamTidyUpSection />` as-is? | Yes — identical content, no new component or i18n.                   |
| Placement                                | After `<HomeLaunchVideo />`, before `<HomeVideoCollection />`.       |
| Add to region pages?                     | No — homepage only this iteration.                                   |
| Add a homepage-specific dropdown anchor? | No — existing `/resources#teamtidyup-heading` is the canonical link. |

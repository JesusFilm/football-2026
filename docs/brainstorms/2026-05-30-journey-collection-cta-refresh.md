# Journey Collection — Repoint to Admin Templates + Add Discover CTA

**Date:** 2026-05-30
**Origin:** Iteration on the NextSteps journey collection. Library link is moving from `nextstep.is/football2026` to the tag-filtered admin templates view; we also want a prominent button under the section to drive partners into the full library.

## What

1. **Repoint `JOURNEY_COLLECTION_URL`** from `https://nextstep.is/football2026/` to **`https://admin.nextstep.is/templates?tagIds=c3f9a4b9-87fa-4d2c-8d1d-2e5b7f6241a7`**. This automatically updates both existing CTAs that reference it:
   - Desktop top-right "Open full library" link
   - Mobile bottom "Show all N journeys" pill
2. **Add a new "Discover more templates" red CTA button** rendered directly under the journey-collection carousel/grid in `HomeJourneyCollection`. Same destination URL as above. Visible on both desktop and mobile, sized as a primary accent-red pill — louder than the existing mono "Open full library" link.

Verified: the destination URL responds `HTTP/2 200` from Vercel without the trailing `_gl=…` GA cross-domain session token — stripped that param since it's ephemeral and not load-bearing.

## Why

- Partners following "Open full library" today land on the football2026 collection page on `nextstep.is`. Going forward, JFP wants them inside the admin templates view filtered by the World Cup 2026 tag, where they can clone and customize directly.
- The new red button below the section is the loud, primary call. The existing mono link in the corner stays as a secondary affordance for keyboard / power users.
- Centralizing the URL in `lib/journey-collection.ts` means both existing references update from one source.

## In scope

- Edit `lib/journey-collection.ts` — update `JOURNEY_COLLECTION_URL`.
- Edit `components/home-journey-collection.tsx` — add a new "Discover more templates" CTA below both the mobile grid and the desktop horizontal scroller (one component-level slot, shown across both breakpoints).
- Add new i18n key `HomeJourneyCollection.discoverMoreCta` = "Discover more templates" in all 13 locales.

## Out of scope

- Changing the existing `seeAllCta` ("Open full library") / `showMoreCta` ("Show all N journeys") copy — only the URL behind them moves.
- Adding the new CTA to the homepage / region pages independently. `HomeJourneyCollection` is what renders on all three surfaces; one edit propagates everywhere it's used.
- Touching unrelated collections (videos, YouVersion, Watch Party).

## Visual design

- Solid accent-red pill, slightly larger than the mono "Open full library" link to signal it's the primary action.
- Centered below the carousel (desktop) and the grid + show-more pill (mobile).
- Trailing arrow icon (`→`) to communicate "leads off-site to library", matching other primary CTAs.
- Reuse the dark-glass + accent treatment (`bg-accent`, `hover:bg-accent-hot`, rounded-full).

## Success criteria

- All three CTA paths on the journey collection (top-right link, mobile show-more pill, new red button) point to `https://admin.nextstep.is/templates?tagIds=c3f9a4b9-87fa-4d2c-8d1d-2e5b7f6241a7`.
- New button renders on homepage, region pages, and `/resources` (every surface that uses `HomeJourneyCollection`).
- All 13 locales translate the new CTA label and pass `test/messages.test.ts` parity.
- Quality gate green.
- Production deploy verified — `curl | grep admin.nextstep.is/templates?tagIds=` returns hits and "Discover more templates" is in the rendered text.

## Decisions resolved

| Decision                                | Resolution                                                                                           |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Strip the `_gl` GA cross-domain token?  | Yes — ephemeral, not load-bearing, destination 200s without it.                                      |
| Update both existing CTAs?              | Yes — they share `JOURNEY_COLLECTION_URL`, one constant update handles both.                         |
| New CTA placement                       | Centered, directly under the carousel/grid inside `HomeJourneyCollection`. Shown on all breakpoints. |
| New CTA styling                         | Solid accent-red pill with arrow, larger than the existing mono link.                                |
| New CTA on homepage / region pages too? | Yes — `HomeJourneyCollection` renders there too, propagation is free.                                |

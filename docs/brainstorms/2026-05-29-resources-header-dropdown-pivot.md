# `/resources` Iteration #3 — Move Section Nav into the Header

**Date:** 2026-05-29
**Origin:** Pivot on iteration #2 (PR #12). The in-page "Jump to section" pill landed under the ResourcesHero, but the intent was always for the dropdown to **hang off the "Resources" item in the top SiteHeader** — a header mega-menu pattern, not an in-page nav.

## What

Move the four section anchors from an in-page pill into a dropdown attached to the **Resources** nav item in the SiteHeader.

- On every page, hovering or focusing the Resources nav item reveals a panel listing the 4 section anchors.
- Clicking "Resources" still navigates to `/resources` (no change to the existing primary action).
- Each sub-item is a fragment link to `/resources#<anchor>`. From any page, it cross-navigates to `/resources` and scrolls to the anchor; from `/resources` itself, it smooth-scrolls in-page.
- Remove `<ResourcesSectionNav />` from `app/[locale]/resources/page.tsx` — the in-page pill goes away.

## Why

- Matches the actual user ask (visible in the screenshot: the dropdown should hang under the "Resources" header item).
- Mega-menu makes the four primary sections discoverable from **anywhere on the site** — homepage, region pages, /resources — without the partner having to navigate to /resources first.
- Cleaner page: `/resources` returns to a single column of content sections without the orphan nav pill at the top.

## In scope

- Edit `components/site-nav.tsx`:
  - Desktop: render the Resources item as a `group/resources` wrapper with a hover/focus-within dropdown panel beneath the Resources link. Same `<details>`-style menu visual treatment as the iter-#2 pill (border, background, chevron, item rows).
  - Add `aria-haspopup="menu"` / `aria-expanded` accessibility hooks.
  - Mobile: when the mobile panel is open, expand Resources to show the 4 sub-items indented under it. No extra toggle button required; just always shown.
- Reuse the existing `ResourcesSectionNav` i18n namespace (`ctaLabel`, `menuLabel`, `items.<id>`) verbatim — already translated across 13 locales. The `ctaLabel` ("Jump to section") becomes the dropdown's aria-label rather than visible UI; the actual trigger is just "Resources".
- Edit `app/[locale]/resources/page.tsx` — remove the `<ResourcesSectionNav />` slot and the import.
- Delete `components/resources-section-nav.tsx` — superseded by the inline dropdown inside `SiteNav`.
- Keep the four `scroll-mt-24` offsets on the target H2s (already shipped; still load-bearing for header-anchored jumps).

## Out of scope

- Reorganizing the rest of the header (logo, language picker stay put).
- Hover delays / animation choreography beyond a simple opacity transition.
- Adding sections to the dropdown beyond the existing four.
- Making the dropdown clickable-to-toggle on desktop. Hover + keyboard focus is sufficient; the underlying Resources link is still a real navigation target.
- Touching the existing in-page H2 IDs.

## Visual design

```
Desktop SiteHeader
┌──────────────────────────────────────────────────────────────┐
│ [Logo]                              Home   Resources ▾  EN ▾ │
│                                              │               │
│                                              ▼ (on hover)    │
│                                     ┌─────────────────────┐  │
│                                     │ RESOURCE SECTIONS   │  │
│                                     │ Media Collection  → │  │
│                                     │ NextSteps journeys→ │  │
│                                     │ YouVersion plans  → │  │
│                                     │ Watch Party Kit   → │  │
│                                     └─────────────────────┘  │
└──────────────────────────────────────────────────────────────┘

Mobile (open menu)
┌──────────────────────────┐
│ Home                     │
│ Resources                │
│   · Media Collection     │
│   · NextSteps journeys   │
│   · YouVersion plans     │
│   · Watch Party Kit      │
└──────────────────────────┘
```

- Dropdown panel: same dark-glass + accent treatment used elsewhere (`bg-[rgb(20_16_12_/_0.96)]` + `border border-line` + `backdrop-blur-md`).
- A small chevron (`▾`) appears next to "Resources" on desktop to signal the dropdown exists.
- Hover OR keyboard focus within the wrapper opens the panel (`group-hover` + `group-focus-within`). Closes when focus or pointer leaves.
- Touch devices on the desktop breakpoint will tap → navigate to /resources (the link still works); the dropdown isn't required for them since the in-page sections are already accessible by scroll.

## Success criteria

- Resources item in the SiteHeader shows a small chevron and opens a dropdown on hover/focus.
- Dropdown lists the four sections; each fragment link cross-navigates to `/resources#anchor` cleanly with the correct header offset.
- Mobile panel shows the 4 sub-items indented under Resources.
- The in-page "Jump to section" pill is gone from `/resources`.
- Quality gate green; i18n parity passes across 13 locales (no key changes — namespace reused).
- Production deploy verified.

## Risks

- **Hover-only dropdown on touch.** Touch users on tablet-sized screens may tap and immediately navigate before seeing the dropdown. Mitigation: the Resources link goes straight to /resources, where they can scroll. We do NOT block the link's primary action. If a future iteration needs touch-friendly disclosure, add a separate caret-button next to the link.
- **Mobile inline indentation makes the panel taller.** Adds 4 rows. Mitigation: the mobile panel already vertically scrolls; 6 total items still fits in a single tap-region without scrolling on any reasonable phone height.
- **Cross-page fragment scroll.** `/<locale>/resources#anchor` from a different page: browser scrolls after page load + hydration. CSS `scroll-mt-24` already takes care of the offset. Smooth-scroll won't trigger on initial load (browser native scroll-to-fragment is instant). Acceptable — instant landing is fine for cross-page jumps.

## Decisions resolved

| Decision                                       | Resolution                                                                        |
| ---------------------------------------------- | --------------------------------------------------------------------------------- |
| Where does the section nav live?               | Attached to the Resources item in the SiteHeader (mega-menu pattern), not in-page |
| Keep the in-page pill?                         | No — remove it. Header dropdown is the only entry point.                          |
| Show dropdown on which pages?                  | Every page (header is global). Sub-items always link to `/resources#anchor`.      |
| Trigger pattern                                | Hover + `focus-within` (CSS-only). No click toggle.                               |
| Mobile pattern                                 | Always-expanded sub-items indented under Resources inside the mobile panel.       |
| i18n changes?                                  | None — reuse the existing `ResourcesSectionNav` namespace shipped in PR #12.      |
| Delete `components/resources-section-nav.tsx`? | Yes — superseded by inline dropdown inside `SiteNav`.                             |

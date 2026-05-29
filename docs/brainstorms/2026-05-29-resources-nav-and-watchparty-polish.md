# `/resources` Iteration #2 — Drop Date Markers + In-Page Section Nav

**Date:** 2026-05-29
**Origin:** Iteration on `/resources` after the Watch Party section landed in PR #11.
**Scope:** Two bundled tweaks. Additive plus one polish edit. No homepage / region-page touches.

## What

### Change 1 — Remove step date markers (locked)

The five Watch Party step cards currently show a date window in the top-right corner (e.g. "Feb – March", "March – May", … "July + Beyond"). Drop the date window entirely. The cards just show STEP N + title + body.

**Why:** The campaign calendar has already moved on — partners landing now are effectively in the Step 4 (June – July) window, so showing "Feb – March" on the first card reads as stale. Removing the dates makes the grid evergreen — the journey shape (kit → explore → plan → host → keep connecting) still teaches the right rhythm without anchoring it to a calendar that's already half-past.

### Change 2 — In-page section-nav dropdown (locked)

Add a small **"Jump to section"** dropdown directly under the `<ResourcesHero />` on `/resources` (only). It lists the four primary section anchors so a partner can fast-travel down the page:

| Label              | Target anchor                    |
| ------------------ | -------------------------------- |
| Media Collection   | `#video-collection-heading`      |
| NextSteps journeys | `#journey-collection-heading`    |
| YouVersion plans   | `#youversion-collection-heading` |
| Watch Party Kit    | `#watchparty-heading`            |

**Why:** `/resources` has grown into a 5-section page. A partner who knows what they want (e.g. "I just need the Watch Party kit") shouldn't have to scroll past three carousels to find it. A pro-feel jump-menu pinned at the top of the page collapses that scroll into one click.

## In scope

- Edit `components/home-watchparty-section.tsx` — remove the date-window `<span>` from each step card.
- Remove `steps.<id>.window` keys from `HomeWatchParty` in all 13 locale files (i18n parity test enforces this).
- New `components/resources-section-nav.tsx` — server component, `<details>` dropdown matching the Watch Party CTA pattern (same accent-red pill, same chevron, same menu styling). 4 entries linking to in-page anchors.
- New `ResourcesSectionNav` i18n namespace: `ctaLabel`, `menuLabel`, `items.{mediaCollection,nextStepsJourneys,youVersionPlans,watchPartyKit}`. Machine-translated to 12 non-English locales.
- Slot edit in `app/[locale]/resources/page.tsx` — render `<ResourcesSectionNav />` between `<ResourcesHero />` and `<HomeVideoCollection />`.
- Add `scroll-mt-24` (or matching offset) to the four target H2s — `video-collection-heading`, `journey-collection-heading`, `youversion-collection-heading`, `watchparty-heading` — so anchor jumps don't land behind the sticky `SiteHeader`.

## Out of scope

- Header mega-menu (Option A from the brainstorm conversation). `/resources` page-only nav for now.
- Homepage and region-page nav surfaces.
- A sticky / floating jump-menu that follows the viewport. Single fixed placement under the hero — partners can scroll back up if they need to re-jump.
- Smooth-scroll polyfills. CSS `scroll-behavior: smooth` already covers all evergreen browsers in scope.
- Touching the existing Physical Kits category or its "Watch Party Kit" card.

## Visual design

- The "Jump to section" dropdown reuses the same `<details>` + accent-red pill component pattern shipped for the Watch Party CTA in PR #11 — same border, same background tint, same chevron animation, same menu panel styling.
- Anchored top-left under the hero copy, with normal `mb-*` spacing so it feels like part of the hero, not an interrupting bar.
- Mobile: full-width tap target with the panel expanding underneath. Same as Watch Party CTA mobile treatment.

```
┌────────────────────────────────────────────────────────┐
│ ResourcesHero (existing)                               │
└────────────────────────────────────────────────────────┘
┌────────────────────────────┐
│ Jump to section          ▾ │   ← new
└────────────────────────────┘
  (opens dropdown:
    Media Collection
    NextSteps journeys
    YouVersion plans
    Watch Party Kit )
┌────────────────────────────────────────────────────────┐
│ Global Football (Soccer) Media Collection              │
│ (carousel)                                             │
└────────────────────────────────────────────────────────┘
…
```

## Success criteria

- The five Watch Party step cards no longer show date markers.
- `/resources` shows a "Jump to section" pill under the hero. Clicking each entry scrolls smoothly to the matching section heading with appropriate offset (no hide-under-header).
- All 13 locales translate the dropdown labels and pass `test/messages.test.ts` parity.
- Quality gate green.
- Production deploy verified by curl-grepping for the new `resources-section-nav-label` (or equivalent marker) and absence of `steps.get-kit.window` in the page HTML.

## Risks

- **Anchor offset drift.** If the `SiteHeader` height ever changes, the four `scroll-mt-*` values go stale and anchor jumps land in the wrong spot. Mitigation: pick one `scroll-mt` value sized to the current header (~`scroll-mt-24` / 6rem); document the link in the plan doc so a future header-resize remembers to revisit.
- **Translation length.** Some locales (German "Watch-Party-Kit", Russian Cyrillic, Arabic) may stretch the menu width. Mitigation: menu width auto-sizes; pill has `whitespace-nowrap` so it never wraps to two lines.
- **Step cards visually look smaller without the date chip.** The right-column space is now empty. Mitigation: top row of each card becomes just the STEP N eyebrow left-aligned. Cards still feel anchored because of the title + body weight below.

## Decisions resolved

| Decision                                | Resolution                                                                                                        |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Keep date markers?                      | No — remove from UI and i18n                                                                                      |
| Section nav placement                   | In-page only, under `ResourcesHero` on `/resources`                                                               |
| Section nav style                       | Reuse the Watch Party CTA `<details>` pattern (accent-red pill + dropdown panel)                                  |
| Sections to include                     | All four primary section collections — Media Collection / NextSteps journeys / YouVersion plans / Watch Party Kit |
| Section nav on homepage / region pages? | No — `/resources` only                                                                                            |
| Smooth scroll                           | CSS `scroll-behavior: smooth` only; no JS scroll helper                                                           |
| Header-offset technique                 | `scroll-mt-24` (or matching) on each target H2                                                                    |

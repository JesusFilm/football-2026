# Team Tidy Up section on `/resources`

**Date:** 2026-06-04
**Origin:** New surface for the JFP Team Tidy Up Meta Horizon Worlds game. Partner-facing entry point so the gospel-side-quest game is discoverable alongside the rest of the World Cup toolkit.
**Scope:** Additive only — one new section at the top of `/resources`, one new entry in the SiteHeader Resources dropdown. No homepage / region-page edits.

## What

Add a single-product hero card for **Team Tidy Up** — a Meta Horizon Worlds game with a side-quest gospel presentation, playable solo or with friends, on mobile or VR — directly under the ResourcesHero on `/resources`. Add a matching anchor entry at the top of the SiteHeader Resources dropdown.

### Locked content

| Element         | Value                                                                                                                                                                                                                                                                                                               |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Section eyebrow | `TEAM TIDY UP`                                                                                                                                                                                                                                                                                                      |
| Section heading | Clean up the stadium. Spark the conversation.                                                                                                                                                                                                                                                                       |
| Body (50-word)  | "Team Tidy Up has SO much trash and SO little time! The stadium is a mess and needs to be cleaned before the next World Cup match. Grab your friends, clean up the stadium and get BIG points. Inspire others and REALLY clean things up! Check out the secret side quest. Join Team Tidy Up!" (Media Kit, slide 4) |
| Sub-line        | Solo or group · Mobile or VR · Meta Horizon Worlds                                                                                                                                                                                                                                                                  |
| Primary CTA     | **Play on Meta Horizon** → `https://horizon.meta.com/world/1125956943927154/?hwsh=3xnZE98OMq` (opens in new tab)                                                                                                                                                                                                    |
| Hero image      | `169-MHW TTU Graphic.png` (the 16:9 _with_ QR variant) — copied into `public/team-tidy-up/hero.png`                                                                                                                                                                                                                 |
| Anchor ID       | `teamtidyup-heading` (matches existing `*-heading` convention for header-dropdown jumps)                                                                                                                                                                                                                            |

### Resources header dropdown

- Insert **Team Tidy Up** as the **first** item, ahead of Media Collection. Final order: Team Tidy Up → Media Collection → NextSteps journeys → YouVersion plans → Watch Party Kit.

## Why

- The deck (slide 8) frames TTU as evangelism-through-application, leaning into "Gen Z and Gen Alpha spend more time in the metaverse than on social media." Surfacing this on `/resources` makes the toolkit feel forward-leaning, not just print + carousels.
- Putting it at the top (above the three carousels) signals it's a distinct, primary asset partners can hand to a friend or social audience, not buried below the standard collections.
- The QR is already baked into the chosen image — partners screenshotting the card still get a direct-connect path without us doing extra QR generation work.

## Visual design

```
Desktop  ┌──────────────────────────────────────────────────────────────┐
         │ TEAM TIDY UP                                                 │
         │                                                              │
         │ ┌────────────────────────────┐  Clean up the stadium.        │
         │ │                            │  Spark the conversation.      │
         │ │  16:9 TTU graphic w/ QR    │                               │
         │ │                            │  Team Tidy Up has SO much …   │
         │ │                            │  …Join Team Tidy Up!          │
         │ └────────────────────────────┘  ┌───────────────────────┐    │
         │                                 │ ▶ Play on Meta Horizon │   │
         │                                 └───────────────────────┘    │
         │                                 Solo or group · Mobile or VR │
         └──────────────────────────────────────────────────────────────┘

Mobile   ┌─────────────────────────────────┐
         │ TEAM TIDY UP                    │
         │ Clean up the stadium…           │
         │ ┌─────────────────────────────┐ │
         │ │  16:9 TTU graphic w/ QR     │ │
         │ └─────────────────────────────┘ │
         │ Team Tidy Up has SO much …      │
         │ …Join Team Tidy Up!             │
         │ ┌─────────────────────────────┐ │
         │ │ ▶ Play on Meta Horizon      │ │
         │ └─────────────────────────────┘ │
         │ Solo or group · Mobile or VR    │
         └─────────────────────────────────┘
```

- Dark-glass card matches `/resources` rhythm: `rounded-[var(--radius-lg)] border border-line bg-[rgb(20_16_12_/_0.6)] backdrop-blur-md`.
- Image rendered with `next/image` (or `<img>` for parity with the existing collection card pattern), 16:9 aspect-ratio container, full bleed inside the card on the left half (desktop) or top (mobile).
- Primary CTA: solid accent-red pill matching the "Discover more templates" treatment shipped in PR #15.

## In scope

- New `public/team-tidy-up/hero.png` (copy of `169-MHW TTU Graphic.png`).
- New `lib/teamtidyup.ts` — frozen catalog (Meta Horizon URL, image path).
- New `components/home-teamtidyup-section.tsx` — server component, hero card.
- Edit `lib/resources-sections.ts` — add `teamTidyUp` as first entry, anchor `teamtidyup-heading`. Type widens by one literal.
- Edit `app/[locale]/resources/page.tsx` — render `<HomeTeamTidyUpSection />` between `<ResourcesHero />` and `<HomeVideoCollection />`.
- New `HomeTeamTidyUp` i18n namespace (eyebrow / heading / body / subLine / ctaLabel) across all 13 locales.
- Add `ResourcesSectionNav.items.teamTidyUp` label across all 13 locales.

## Out of scope

- Homepage / region pages. `/resources` only.
- Embedding the Meta Horizon experience inline. CTA opens a new tab; the experience launches on Meta's domain.
- Per-locale image variants. Single hero image with built-in QR works across locales.
- Generating a JFP-side QR code on the page. The graphic already includes one; redundant work.
- Video preview / trailer embed. Out of scope for the first cut; revisit if metrics show demand.

## Risks

- **Image legibility on small viewports.** The graphic includes its own typography + QR. On mobile, our outer card padding might compress it. Mitigation: cap image height to ~280px on mobile, let it shrink with the viewport but keep aspect-ratio.
- **External link friction.** Meta Horizon is heavy. Mitigation: `target="_blank" rel="noopener noreferrer"`, sub-line tells partners what to expect ("Solo or group · Mobile or VR").
- **Anchor-jump offset.** The new H2 needs `scroll-mt-24` like the other anchor targets so cross-page jumps from the header dropdown land cleanly.
- **`lib/resources-sections.ts` type widening.** Adding `teamTidyUp` to the literal union touches a stable identifier. Mitigation: TypeScript will flag every consumer; only the `SiteNav` dropdown uses the union, and that gets the new key in the same PR.

## Decisions resolved

| Decision                                   | Resolution                                                                                                                    |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| Image variant                              | 16:9 _with_ QR (`169-MHW TTU Graphic.png`) — QR is bonus for screenshots even though the on-page CTA replaces its primary job |
| Description length                         | 50-word from Media Kit slide 4 (verbatim)                                                                                     |
| Primary CTA copy                           | "Play on Meta Horizon"                                                                                                        |
| Section placement on `/resources`          | Top of the page, between ResourcesHero and HomeVideoCollection                                                                |
| Header dropdown placement                  | First (above Media Collection)                                                                                                |
| Translate the body across 13 locales?      | Yes — same machine-translation pattern; brand "Team Tidy Up" stays English                                                    |
| Translate the eyebrow "TEAM TIDY UP"?      | No — brand mark stays English in every locale, same as "Watch Party"                                                          |
| Show the QR-bearing image in every locale? | Yes — one image, no locale variants                                                                                           |
| Add to homepage too?                       | No — `/resources` only                                                                                                        |

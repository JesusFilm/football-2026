# Launch Additions — Iteration 1 Feedback

**Date:** 2026-05-15
**Origin:** Feedback after preview of `feat/launch-additions` (commits b2a036f..f303e5d).
**Scope:** Refinements to the three additions already on `feat/launch-additions`. Still additive only — no changes to existing hero, region grid, country views, footer, region pages, or i18n routing.

## What the preview surfaced

The first cut shipped clean (full quality gate green, 114 static pages, all four preview screens correct), but three things read as weak in actual use:

1. **The Resources nav link is hard to see.** A single mono-cap link `RESOURCES` between the logo and the language picker doesn't read as a navigation tab — it reads as a label. Visitors don't perceive it as a way to switch pages.
2. **The video sits too high.** Currently the launch video is between `HomeHero` and `HomeRegionHeading`, which interrupts the existing "tagline → headline → pick your region" beat. The Zoom card lands below the region grid, but by then visitors have already scrolled past the prime conversion zone.
3. **The Zoom card reads informational, not inviting.** The current treatment (eyebrow + heading + body + 4-row data list + accent button) communicates the facts but doesn't _sell_ the moment. The mock from product reference shows a richer card: a "Live briefing" pill, 4 side-by-side data cards with icons (Date / Time / Duration / Where), a prominent white CTA, a small reassurance caption underneath, and tertiary actions (Add to calendar, Toolkit and resources, Share link).

## What we're changing

### Change A — SiteHeader: explicit nav tabs + mobile hamburger

- Top-right of the header gets **two tabs**: "Home" and "Resources", styled as visible nav items (not micro caps).
- Active page is highlighted with an accent underline (or text color shift) so the current location is obvious.
- On mobile (`< sm`), the two tabs collapse into a **hamburger toggle**. The toggle uses an HTML-only mechanism (no client JS) — `<details>` element or CSS `:checked` hack — to keep `SiteHeader` a server component.
- The language picker stays at the far right on desktop, and moves inside the hamburger panel on mobile.
- New i18n key: `Header.home`.

### Change B — Homepage reorder: Zoom card up, video after

Updated section order on `app/[locale]/page.tsx`:

```
Hero (existing, untouched)
HomeRegionHeading (existing)
HomeRegionGrid (existing)
HomeLaunchEvent  ← stays in this position
HomeLaunchVideo  ← MOVED here from between Hero and HomeRegionHeading
HomeCountryViewsSection (existing)
```

Narrative becomes: tagline → pick your region → join the briefing → watch the vision → see impact.

The video as a _vision-reinforcement_ beat after the conversion ask reads stronger than as an _onramp_ before it, because the existing hero already does the emotional onramp work via the italic tagline.

### Change C — HomeLaunchEvent redesign

- **"Live briefing" pill** (accent red on a translucent accent-red bg, matching the existing eyebrow vocabulary — not blue like the mockup).
- Heading: short, present-tense. (`HomeLaunchEvent.heading` reused.)
- Body: rewritten to be more inviting. ~2 sentences, no jargon.
- **Four data cards** in a horizontal row (stack on mobile): Date, Time, Duration, Where. Each is a small nested dark-glass card with a 14px icon + tiny mono caps label + value in normal weight.
- **Primary CTA**: white pill button with accent-red text and a small arrow icon. Reads as "the action to take." Opens registration in a new tab.
- **Reassurance caption** under the CTA: "Free. Confirmation and join link sent by Zoom after you register."
- **Three tertiary actions** in a row below a horizontal rule:
  - "Add to calendar" — generates an `.ics` data URI that downloads on click; works in Google/Outlook/Apple
  - "Toolkit and resources" — locale-aware link to `/resources`
  - "Share link" — `mailto:` with prefilled subject/body for forwarding to a team

The card retains the same outer dark-glass surface as `RegionCard` so it stays visually native.

## Out of scope (still)

- Custom registration form
- Backend / database / email sending
- Translation of new English strings into the 11 non-English locales
- Pre-launch reminder emails
- Editing existing components beyond `SiteHeader` and `HomeLaunchEvent`

## Success criteria

- Resources is recognizable as a navigation tab, not a label, on both desktop and mobile.
- Hamburger toggle works without JS (server component preserved).
- Homepage reads `Hero → Region grid → Zoom card → Video → Country views`.
- Zoom card visually integrates with the existing card aesthetic, reads as inviting, and surfaces the four key facts plus three useful tertiary actions.
- Quality gate green: `pnpm lint && pnpm format:check && pnpm typecheck && pnpm test:run && pnpm build`.
- `test/messages.test.ts` passes after adding any new i18n keys.

## Risks

- **Hamburger without JS** can run into accessibility traps (keyboard focus, ARIA semantics). Mitigation: use the `<details>`/`<summary>` pattern with explicit `aria-label` so screen readers announce it cleanly.
- **.ics data URI in iframes** sometimes fails on iOS Safari. Mitigation: also link to a Google Calendar URL fallback if the .ics doesn't trigger a download — but ship the data URI first; revisit if reports come in.
- **Resource nav highlighting**. We need to detect current pathname to highlight the active tab. Server components can read the pathname via `headers()` or use `usePathname` in a tiny client component. Cleanest: read pathname in a server component via Next.js 16's per-request headers — but if that requires a client component, scope it to just the nav, not the whole header.

# Watch Party Section — Requirements & Plan

**Date:** 2026-05-28 (revised same day after design pivot)
**Origin:** Iteration on `/resources` after the YouVersion plans collection landed in PR #7.
**Scope:** Additive only — one new section component on `/resources`, slotted directly after `<HomeYouVersionCollection />` and before the existing 3-category grid. No edits to homepage or region pages, no edits to existing components.

## What

Surface the **Watch Party Host Kit** — JFP / Cru's free, multi-language digital host kit — as a section on `/resources` modeled on the "How to Host a Watch Party" step grid from `victorybeyondthecup.com/keyplayer`, adapted to our dark-glass + accent-red design language.

### Locked copy

| Element        | Copy                               |
| -------------- | ---------------------------------- |
| Eyebrow / kind | `WATCH PARTY` (mono, all-caps)     |
| Heading        | `Order Your Free Digital Host Kit` |
| Primary CTA    | `Download Free Host Kit`           |

### Locked CTA destinations (language dropdown)

The primary CTA opens a small dropdown menu with 4 language options. Each option opens its kit-order URL in a new tab.

| Language  | URL                                                          |
| --------- | ------------------------------------------------------------ |
| English   | http://s.victorybeyondthecup.com/KeyPlayerDigitalKitOrder    |
| Español   | http://s.victorybeyondthecup.com/KeyPlayerDigitalKitOrder-ES |
| Português | http://s.victorybeyondthecup.com/KeyPlayerDigitalKitOrder-PT |
| Français  | http://s.victorybeyondthecup.com/KeyPlayerDigitalKitOrder-FR |

### Locked 5-step grid content (mirrors keyplayer source)

| #      | Window        | Title              | Body                                                                                                                                                |
| ------ | ------------- | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Step 1 | Feb – March   | Get a Host Kit     | Fill out a form to get your free host kit. Digital Kits will be sent immediately to your email. Physical kits are shipped in May.                   |
| Step 2 | March – May   | Explore Your Kit   | Once you receive your kit, use the included guide to familiarize yourself with the resources and how to use each.                                   |
| Step 3 | April – May   | Plan Your Event    | Start planning your watch party including when, who to invite, recipes to make, etc. Pray for God to stir your community's hearts leading up to it. |
| Step 4 | June – July   | Host Your Event(s) | The big day is here! Use kit materials to help you stay present, have meaningful conversations, deepen connections, and most importantly, have fun. |
| Step 5 | July + Beyond | Keep Connecting    | Even after the World Cup is over, keep building community. You can use the kit resources to continue connecting in fun and meaningful ways.         |

## Why

After three horizontal carousels (videos, journeys, YouVersion plans), the page needs a different rhythm. The keyplayer "How to Host a Watch Party" model is **already proven for this audience** — partners recognize the framing and the step-grid teaches the journey from kit order → host → keep connecting in one glance.

Hijacking that model on football2026 does three jobs at once:

1. **Frames the watch party as a multi-step commitment**, not a one-click download — partners self-qualify before clicking through.
2. **Removes the language-routing friction** by exposing all four kit URLs directly via the dropdown — partners don't have to bounce through the keyplayer language switcher.
3. **Keeps the visual brand consistent** with our existing sections (dark glass, accent-red eyebrows, monospace eyebrow text) rather than feeling like a foreign embed.

## In scope

- New `components/home-watchparty-section.tsx` — server component, section wrapper with eyebrow + heading + CTA (with dropdown) + 5-step grid below.
- New `components/watchparty-cta-menu.tsx` — small client component, the language dropdown menu. Implemented as a `<details>` / `<summary>` pattern OR a minimal Stimulus-style toggle. Picks zero JS framework cost.
- New `lib/watchparty-kit.ts` — frozen catalog with:
  - `WATCHPARTY_KIT_LANGUAGES`: ordered array of `{ id, label, url }` for the dropdown.
  - `WATCHPARTY_STEPS`: ordered array of `{ id, window, title, body }` for the grid (used for stable identifiers; titles + bodies actually live in i18n).
- New `HomeWatchParty` i18n namespace with `eyebrow`, `heading`, `ctaLabel`, `menuLabel`, `steps.<id>.{window,title,body}`. Machine-translated starter copy across the 11 non-English locales. Step `window` strings ("Feb – March") stay in English across locales — they map to a Northern-Hemisphere calendar and are easier to recognize as-is for international partners.
- One slot edit in `app/[locale]/resources/page.tsx` — import + render between `<HomeYouVersionCollection />` and the categories `.map(...)`.

## Out of scope

- Homepage and region pages. `/resources` only.
- Editing or removing the existing "Watch Party Kit" card inside the Physical Kits category — it stays as the in-category entry, matching the YouVersion precedent.
- Auto-routing the dropdown based on the active site locale. The kit only ships in 4 languages; mapping our 12 locales onto 4 kit languages is more friction than value. Show all 4, let the partner pick.
- Embedding the kit-order form on `/resources`. Out of scope — Cru's form owns the conversion.
- Pulling step copy live from victorybeyondthecup.com. Static catalog, refreshed by hand if the campaign updates the steps.

## Visual design — keyplayer 5-step grid, football2026 dark-glass treatment

**Reference (source pattern on `victorybeyondthecup.com/keyplayer`):** 5 cards in a 3 + 2 desktop grid, each with a green step-label eyebrow, a date-range chip, a bold title, and 2–3 lines of body.

**Adapted for football2026:**

```
┌───────────────────────────────────────────────────────────────┐
│ WATCH PARTY                                                   │
│ Order Your Free Digital Host Kit                              │
│                                                               │
│ ┌────────────────────────────┐                                │
│ │ Download Free Host Kit  ▾  │                                │
│ └────────────────────────────┘                                │
│   (opens dropdown:                                            │
│    English ↗                                                  │
│    Español ↗                                                  │
│    Português ↗                                                │
│    Français ↗  )                                              │
└───────────────────────────────────────────────────────────────┘

┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ STEP 1       │  │ STEP 2       │  │ STEP 3       │
│ Feb – March  │  │ March – May  │  │ April – May  │
│              │  │              │  │              │
│ Get a Host   │  │ Explore      │  │ Plan Your    │
│ Kit          │  │ Your Kit     │  │ Event        │
│              │  │              │  │              │
│ Fill out a   │  │ Once you     │  │ Start        │
│ form …       │  │ receive …    │  │ planning …   │
└──────────────┘  └──────────────┘  └──────────────┘
┌──────────────┐  ┌──────────────┐
│ STEP 4       │  │ STEP 5       │
│ June – July  │  │ July + Beyond│
│              │  │              │
│ Host Your    │  │ Keep         │
│ Event(s)     │  │ Connecting   │
│              │  │              │
│ The big day  │  │ Even after … │
│ is here! …   │  │              │
└──────────────┘  └──────────────┘
```

**Token treatment:**

- Cards use the standard dark-glass: `rounded-[var(--radius-lg)] border border-line bg-[rgb(20_16_12_/_0.6)] backdrop-blur-md`.
- "STEP N" eyebrow: mono caps in accent-red (`text-accent`) — replaces keyplayer's green with our brand-aligned red.
- Date-range chip ("Feb – March"): mono small-caps, muted (`text-fg/60`), top-right of card on desktop, inline next to the step on mobile.
- Title: `font-display` bold, ~22px on desktop / 18px on mobile.
- Body: `text-fg/80`, ~14–15px, 3–4 lines.
- Card min-height matches the tallest card so the 3 + 2 grid stays visually even.

**Primary CTA + language dropdown:**

- Pill button matching the YouVersion "Open the full library" CTA style: accent-red border + light tinted background + bold text, with a small `▾` chevron on the right.
- Click toggles a small panel (anchored bottom-left of the button) listing the 4 languages, each as an inline link with an external-link `↗` chip.
- Implementation: `<details><summary>` pattern — server-renderable, no client JS framework needed, keyboard-accessible by default.
- Each menu item opens in a new tab (`target="_blank" rel="noopener noreferrer"`).
- Mobile: dropdown panel uses full available width; tap target sized for thumb (~44px min).

**Layout:**

- Section sits inside the same content container as the other `/resources` sections (`max-w-[1200px]`).
- Desktop grid: 3 columns × 2 rows, with the second row left-aligned (cards 4–5 in columns 1 and 2; column 3 empty). Same shape as keyplayer.
- Tablet: 2 columns × 3 rows.
- Mobile: 1 column, stacked.

## Success criteria

- `/resources` shows the new section between the YouVersion plans collection and the existing 3-category grid.
- Primary CTA opens a working language dropdown with 4 entries, each link opening its URL in a new tab.
- All 5 step cards render with correct copy in English; non-English locales show machine-translated step bodies (titles + windows stay English).
- Quality gate green (lint, format:check, typecheck, test:run, build).
- `test/messages.test.ts` parity passes across all 12 locales.
- Production deploy on football2026.nextstep.is shows the new section under `/resources`.

## Risks

- **`<details>` styling cross-browser.** Safari sometimes renders `<summary>` markers unexpectedly. Mitigation: explicitly hide the default marker via `list-style: none` + `::-webkit-details-marker { display: none }`, render our own chevron.
- **Step body length differences in translation.** Some locales (German, French) run longer; the 3 + 2 grid can look uneven if one card grows. Mitigation: lock card min-height; let body wrap inside. Card alignment stays visually clean.
- **Brand handoff clarity.** The destination is `s.victorybeyondthecup.com` — partners may wonder why they're leaving football2026. Mitigation: copy makes the handoff explicit ("Order your free digital host kit"), CTA shows external-link affordance, new-tab keeps football2026 still loaded behind them.
- **Locale-vs-kit-language mismatch.** A Spanish-locale partner clicking the dropdown still sees English/Español/Português/Français labels (we don't translate those — they're language self-names). The kit URL takes them to a Spanish kit. This is the standard pattern, but worth noting in QA.

## Decisions resolved

| Decision                    | Resolution                                                              |
| --------------------------- | ----------------------------------------------------------------------- |
| Section model               | Keyplayer 5-step grid (not the asset-collage hero in the earlier draft) |
| Heading copy                | "Order Your Free Digital Host Kit"                                      |
| Eyebrow                     | "WATCH PARTY"                                                           |
| CTA copy                    | "Download Free Host Kit"                                                |
| CTA destination             | 4-language dropdown — see URLs table above                              |
| Step content                | Verbatim from keyplayer.com (5 steps, locked in table above)            |
| Step "window" translation   | Stay English in every locale                                            |
| Dropdown implementation     | `<details>` / `<summary>` — server-renderable, no client JS framework   |
| Auto-locale routing of CTA  | Out of scope — show all 4 languages, let partner pick                   |
| Existing Physical Kits card | Stays as-is (same precedent as YouVersion plans)                        |

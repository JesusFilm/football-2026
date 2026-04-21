---
date: 2026-04-21
topic: scroll-animation-polish
---

# Scroll-Driven Animation Polish

## Problem Frame

The site looks editorial and composed at rest — dark stadium background, film-grain overlay, Archivo/Fraunces typography, thoughtful color and spacing — but it doesn't _feel_ premium in motion. Sections appear instantly and the fixed background sits perfectly still as the user scrolls, which makes a carefully-composed design read as a flat webpage rather than a produced experience.

The goal is to add a restrained editorial motion language that:

- Reveals content with intent as it enters the viewport
- Adds a quiet sense of depth behind the content
- Makes a first-time visitor (regional coordinator, partner, or supporter) feel they're on a well-produced brand surface from Jesus Film Project, not a generic toolkit
- Stays tasteful, not promotional — consistent with the existing Apple/magazine-adjacent aesthetic

This applies to the marketing-facing surfaces that a supporter or coordinator will actually read and share: the home page (`app/page.tsx`) and the region detail page (`app/[id]/page.tsx`). Utility state (dropdowns, copy button, QR) stays snappy and unanimated beyond what already exists.

## Requirements

**Motion Vocabulary (shared by both pages)**

- R1. The site has exactly one entrance-reveal pattern used consistently across all animated elements: a short opacity fade from 0 → 1 combined with a small upward translate of ~8–12px. No other entrance transforms (no scale, rotate, blur, skew, letter reveals, clip paths, or elastic curves).
- R2. Each reveal completes in 400–600ms using the curve `cubic-bezier(0.16, 1, 0.3, 1)` (expo-out) — a clean deceleration to rest with no overshoot or bounce. The curve is named at the requirements level because the perceptual difference between this and the browser's default `ease-out` at this duration range determines whether the motion reads as editorial or generic.
- R3. Within a logical group (e.g., the three step cards, a heading + subcopy pair), elements stagger by 60–80ms so the group reads as a single gesture rather than independent items.
- R4. Reveals trigger once, when the element first crosses ~15% into the viewport. Scrolling back up does not re-trigger them; the site never "replays" itself.
- R5. Reveals are layout-stable: elements reserve their final space before the reveal runs. There is no CLS caused by the motion layer.

**Home Page (`app/page.tsx`)**

- R6. On first page load, the hero performs a light staggered sequence: eyebrow ("World Cup 2026 · Toolkit") → italic tagline ("One story. Every language.") → headline ("Activate Your Region") → subcopy. Elements stagger by ~80ms. Total home hero sequence completes within ~700ms of the cascade's trigger point (see R28 for the trigger signal). This is a mount-time cascade, not scroll-triggered — the hero is above the fold.
- R7. The three step cards (`01 / CHOOSE`, `02 / SHARE`, `03 / TRACK`) reveal as a staggered wave when the step-cards section enters the viewport. **Exception:** on short viewports where the step cards are already within the initial viewport at first paint, they join the hero cascade as a trailing wave rather than running a separate IntersectionObserver-triggered sequence (see R24, R29) — this keeps the page reading as a single choreographed moment rather than "hero animates while step cards sit finished behind it."
- R8. The "Select Your Region" heading and its subcopy reveal as a pair, staggered.
- R9. The 7-card region grid reveals with a stagger that reads as visual rows. The actual rendered layout (confirmed against `app/page.tsx` and `components/region-card.tsx`):
  - **Mobile (1-col):** 7 rows × 1 card. Staggered top-to-bottom by index.
  - **Tablet (2-col):** 3 rows of 2 + 1 centered row of 1. Each row reveals as a wave.
  - **Desktop (6-col):** each card spans 2 columns (`lg:col-span-2`); the 7th card begins at column 3 (`lg:last:col-start-3`). Effective visual layout is **3 + 3 + 1**. Row 1 reveals as a 3-card wave, row 2 as a second 3-card wave, row 3 reveals the 7th card alone as a trailing beat.
- R10. The site footer reveals when it enters the viewport, using the shared pattern.

**Region Detail Page (`app/[id]/page.tsx`)**

- R11. On first load, the hero block performs the same staggered mount sequence as the home page: back crumb → eyebrow → italic tagline → headline → subcopy. The stats row (flags · countries · languages) reveals as the trailing element of the same sequence. The stats row reveals as a single unit — its internal flag / separator-dot / country-count / language-count children do not stagger among themselves. Total region hero budget is ~1000ms (6-element cascade × 80ms stagger + 400–600ms reveal). The home hero's ~700ms budget does not apply to the region hero because it has more elements.
- R12. The three step cards reveal as a staggered wave when the section enters the viewport, matching home-page behavior (same above-fold exception as R7; see R24, R29).
- R13. The "Pick a language. Pass it on." heading and subcopy reveal as a staggered pair.
- R14. The `RegionSharePanel` reveals as a single block (the panel's inner widgets — language picker, share link, QR — do not have individual reveal animations, because they are interactive controls and the user may interact with them before a stagger would complete).
- R15. The "Where The Story is Spreading" section heading, eyebrow, and placeholder card reveal as a staggered group.

_R16 — removed during the 2026-04-21 review. The prior "`animate-bob` preserved as-is" requirement documented existing code behavior rather than a new deliverable; `animate-bob`'s reduced-motion behavior is now owned by R20._

**Ambient / Background Motion**

- R17. The fixed stadium background (`.bg-stadium`) drifts very slowly as the user scrolls — a scroll-linked parallax at roughly 10–15% of scroll speed. The drift is restricted to vertical translate only (no scale, no blur change, no color shift). The maximum absolute offset across a full page scroll is small enough that the motion is felt as depth rather than seen as motion (target: ≤ ~60px of offset across a typical full-page scroll). **Note:** the exact formula, behavior on variable-length region pages, and separation from the rest of this work are tracked under `## Deferred / Open Questions` and may cause R17–R18 to be split into their own follow-up.
- R18. The parallax drift must not cause visible frame drops on a mid-range mobile device (iPhone 12 / Moto G Power class). Implementation mechanism (rAF transform, CSS `animation-timeline: scroll()`, etc.) is a planning decision; only the outcome — no jank — is a product requirement.
- R19. The film-grain overlay (`.grain`) does not move with parallax and has no additional animation. It stays a constant surface texture.
- R20. The site header stays static as the user scrolls. It does not shrink, gain a backdrop blur, or otherwise react to scroll position. All continuous ambient animations on the site — the existing `animate-bob` scroll cue between the share panel and the "story is spreading" section, and the R17 parallax drift — fully honor `prefers-reduced-motion: reduce` by setting `animation: none` (or equivalent) under that media query.

**Accessibility and Progressive Enhancement**

- R21. Users with `prefers-reduced-motion: reduce` see no entrance reveals, no mount staggers, no parallax drift, and no `animate-bob` loop. All content is present and fully visible immediately on page load. User-initiated hover/focus microinteractions that already exist (region card hover transform, copy-button color change) are preserved because they are user-initiated, not scroll- or time-driven.
- R22. Animated elements are server-rendered opaque, and the initial-hidden state is applied by a small pre-paint client script that sets `.motion-ready` on the `<html>` element before first paint. CSS keys the initial-hidden transform/opacity behind `.motion-ready .reveal { opacity: 0; transform: translateY(10px); ... }`. Under no-JS or pre-hydration conditions the script never runs, `.motion-ready` is never applied, and all animated elements render in their final visible state — no invisible content, no FOUC.
- R23. Reveal animations do not block keyboard focus, clicks, or screen-reader announcement of any element. Focusable elements are focusable whether or not their reveal has played.

**Interaction Edge Cases (added during 2026-04-21 review)**

- R24. Elements already past the ~15% viewport threshold at initial hydration render in their revealed state immediately, with no animation — IntersectionObserver does not fire a reveal for them. This covers tall desktops, short-viewport landscape mobile, and any browser-restored scroll position. Exception: above-fold step cards (R7, R12) on fresh loads where the hero cascade is still running — those join the hero cascade as a trailing wave (R29) rather than rendering instantly.
- R25. When keyboard focus is acquired on an element whose reveal is still in progress (e.g., a user tabs into the region grid while cards 4–7 are staggering in, or uses a skip-to-main link), the focused element immediately jumps to its final revealed state (opacity 1, translate 0). This guarantees the focus ring is rendered on fully-visible content and meets WCAG 2.4.11 Focus Appearance.
- R26. Reveal translates are applied on an inner wrapper element, never on the same element that carries user-initiated hover/focus transforms. This prevents Tailwind's `transform` utility from composing `hover:-translate-y-0.5` (region card) with the reveal translate into a single transform chain where one class wholesale overrides the other. Concretely, the region card's outer `<Link>` carries only the hover transform; a nested `<div>` carries the reveal transform; user-initiated state always composes cleanly with whatever reveal state exists.
- R27. When the page is entered via an anchor link or the browser restores a non-zero scroll position (back-navigation), the hero cascade (R6 / R11) is suppressed — the hero renders in its revealed state. Elements already past the 15% threshold at the restored position follow R24. Only elements not yet in view use the normal IntersectionObserver-triggered reveal.
- R28. The hero cascade trigger signal is `document.fonts.ready` gated inside a `requestAnimationFrame` after React hydration, with a 300ms fallback timeout so the cascade is not blocked indefinitely on slow font loads. This avoids a visible font swap mid-cascade on cold loads while keeping the region hero's ~1000ms budget (R11) and the success-criterion "current viewport settled within ~1.5s" achievable.
- R29. On viewports where the hero and the step-cards section are both fully visible at first paint (iPhone 12 / iPad landscape, narrow-window desktops, short laptops), the step cards become a trailing wave of the hero cascade rather than running a separate scroll-enter sequence. The hero-cascade trigger (R28) fires for the whole group, and the step cards reveal as the final staggered beat of that cascade.
- R30. Revealed elements stay revealed across viewport resize and device rotation. Grid stagger groupings (R9) are computed once at first render and do not recompute on resize — a user rotating an iPad mid-session does not see already-revealed cards re-animate or enter an inconsistent state. The hero cascade runs once per fresh page mount; App Router client-nav remount behavior is tracked under `## Deferred / Open Questions` (back-button behavior may still replay the cascade pending resolution of that question).

## Priority Tiering (added during 2026-04-21 review)

If time or performance pressure forces cuts, requirements shed in this order:

- **P0 (ship-or-not gates) — without these, the feature regresses or breaks accessibility.** R1–R5 (motion vocabulary), R6 + R11 (hero cascades), R21 (reduced-motion), R22 (SSR-visible baseline / no FOUC), R23 (focus / keyboard), R25 (focus appearance on mid-reveal), R26 (transform composition), R28 (ready signal).
- **P1 (core value) — the premium-feel outcome on both pages.** R7–R10, R12–R15, R24, R27, R29, R30, R20 (reduced-motion for ambient loops).
- **P2 (optional polish — first to cut).** R17–R18 (parallax background — see `## Deferred / Open Questions` about separating into its own track), R9's precise desktop 3+3+1 row timing (can degrade to a simpler top-to-bottom stagger), R19 (grain documents existing behavior and is functionally free).

If only P0 ships, the site still delivers the first-impression premium-feel goal on both pages. This is the minimum viable ship.

## Success Criteria

- A first-time visitor scrolling through either page should describe the motion as "nice" or simply not notice it at all — and never as "animated", "bouncy", "slick", or "a lot going on". The motion should feel like a property of the site, not a feature of it.
- A motion-literate designer comparing the site before and after agrees the treatment reads as editorial/premium and is consistent with the existing brand surface.
- `prefers-reduced-motion` users get a fully functional, visually complete site on both pages with zero motion — including `animate-bob` and the R17 parallax, both of which are explicitly disabled under that media query (R20, R21).
- No visible jank while scrolling on a mid-range mobile device (iPhone 12 / Moto G Power class). Scrolling stays at 60fps and the parallax background does not "chase" the content.
- Cumulative Layout Shift remains 0 on both pages. The motion layer never causes content to jump.
- **Lighthouse mobile performance score drops by ≤3 points from the pre-change baseline; LCP and CLS are unchanged.** If this threshold cannot be met and the cause is parallax, R17–R18 are cut (not the rest of the work) per the Priority Tiering above.
- Any element within the user's current viewport finishes revealing within ~1.5s of entering that viewport. (Earlier phrasing — "the entire page feels settled within ~1.5s" — was replaced because scroll-triggered content on pages longer than one viewport cannot satisfy it.)

## Scope Boundaries

- **No scroll hijacking, no snap scrolling, no pinned/scrubbed full-viewport sections.** The user always controls scroll velocity and direction.
- **No letter-by-letter text reveals, text masking, or typewriter effects.** Text appears as whole blocks.
- **No scale, rotate, skew, blur, or clip-path entrance animations.** Opacity + small translate is the entire vocabulary.
- **No scroll-scrubbed content animations** — no content elements whose opacity or position is tied directly to scroll offset. The R17 parallax is a separate category (it scroll-yokes the fixed background, not content) and is the only scroll-linked motion on the site.
- **No animated counters, progress bars, or data-driven motion** (e.g., "2.3M people reached" tickers). The existing stats row reveals as static text.
- **No page-transition animations** between the home page and a region detail page, or on back navigation. Route changes remain instant; the destination page plays its own mount sequence.
- **No new motion on interactive controls** beyond what already exists. Region card hover, language picker open/close, copy-button state, and QR rendering stay as they are today.
- **No animation on `RegionSharePanel` internals** (language picker items, QR box, download/share buttons). The panel reveals as a single block, then behaves exactly as it does today.
- **No additional ambient/continuous animations** beyond the existing `animate-bob` scroll cue and the R17 parallax — both of which now honor reduced-motion per R20.

## Key Decisions

- **Restrained editorial flavor, not cinematic.** The aesthetic is already editorial — heavy choreography would fight the existing tone. Motion should be felt but not watched.
- **Both pages get the same vocabulary.** A coordinator moving from the home page to a region detail page should experience one consistent motion language, not two different treatments.
- **Hero cascade on first load, everywhere else on scroll.** The hero is above the fold on both pages; using an IntersectionObserver-style trigger on content the user can already see would look like a delay. Every other element uses scroll-enter (modulated by the initial-hydration rule in R24 and the short-viewport rule in R29).
- **Parallax is opt-in depth, not opt-in cinema.** 10–15% scroll speed is deliberately subtler than typical parallax. The user should never say "oh, the background is moving."
- **One-shot reveals, not replays.** Scrolling back up does not re-animate content, because the site should settle and stay settled.
- **`prefers-reduced-motion` is the one-and-only motion kill switch.** Every motion on the site — entrance reveals, parallax, `animate-bob` — is disabled under that media query. The earlier framing that described `animate-bob` as "already reduced-motion-safe because it is not scroll- or entrance-driven" was incorrect; time-driven continuous loops belong in the same disable list as scroll-linked motion.
- **Region grid staggers as visual rows, not as a flat index across 7.** The actual 3+3+1 desktop layout drives the row-based stagger in R9.
- **Editorial ease curve is named at the requirements level.** `cubic-bezier(0.16, 1, 0.3, 1)` (expo-out) is the character of the motion; leaving this to the implementer would delegate the most consequential single motion decision to whoever opens the file first.

## Dependencies / Assumptions

- Assumes the current DOM structure on both pages remains roughly as it is today. Light wrapping of siblings into group containers (for staggered reveals) is acceptable in planning; R26 additionally requires a nested inner wrapper on the region card so reveal and hover transforms don't fight.
- Assumes there is room in the critical rendering path for a small amount of motion logic without hurting the Lighthouse performance score. If measurement during planning shows this is not true, R17–R18 (parallax) are cut per the Priority Tiering.
- Assumes modern evergreen browser targets. Exact feature-support strategy (lightweight `useInView` hook vs. motion library) is a planning decision, not a product decision — `animation-timeline: view()` was ruled out for content reveals during this review because its native replay-on-reentry conflicts with R4.

## Outstanding Questions

### Resolve Before Planning

_None. All product decisions are resolved above._

### Deferred to Planning

- [Affects R1–R15, R24–R30][Technical] Should entrance reveals be implemented with a lightweight custom `useInView` hook + CSS transitions or a motion library (framer-motion / motion)? The requirement is only that the resulting behavior matches R1–R5 and R24–R30; the choice is a planning trade-off between bundle size and ergonomics. `animation-timeline: view()` is no longer a candidate (R4 incompatibility).
- [Affects R17–R18][Technical] If parallax stays in this scope, should it be driven by CSS `animation-timeline: scroll()`, a `requestAnimationFrame`-driven transform, or a small scroll listener? Planning picks whichever hits R18 (no jank) with the least code.
- [Affects R9][Needs research] Lock in the exact row-stagger timings and inter-row gaps for the 3+3+1 desktop layout before implementation; confirm the fallback for the tablet centered 7th card.

## Next Steps

-> `/ce-plan` for structured implementation planning, after resolving any items under `## Deferred / Open Questions` that the user wants answered before planning begins.

## Deferred / Open Questions

### From 2026-04-21 review

- **Parallax scope expansion — is it in this bundle at all?** — Ambient / Background Motion (P1, scope-guardian + product-lens + adversarial, confidence 0.98)

  The stated goal is content-reveal motion; R17–R18 add a second, categorically different motion system (scroll-linked runtime effect, own performance budget, own reduced-motion path, own SSR story). The Dependencies note already calls parallax "the first thing to cut if Lighthouse regresses," which is an implicit acknowledgement that it is optional relative to the core goal. Shipping entrance reveals without parallax fully satisfies premium-feel; parallax is a bonus with disproportionate cost and risk, and it creates a precedent ("background is a motion surface now") that later features would inherit. Consider moving R17–R18 to a separate follow-up and measuring the reveal-only ship first.

  <!-- dedup-key: section="ambient background motion" title="parallax scope expansion is it in this bundle at all" evidence="if measurement during planning shows this is not true the parallax background r17 is the first thing to cut" -->

- **Parallax formula "10–15% of scroll speed" is page-length-dependent and clips** — R17 (P1, design-lens + adversarial, confidence 0.94)

  A fixed ratio of scroll distance produces different absolute offsets on pages of different lengths; on long region pages the 60px cap contradicts the 10–15% ratio. Applying translateY to a `position: fixed` element with `background-size: cover` clips the image at max offset. Resolve by specifying a concrete formula like `translateY = min(scrollY × 0.12, 60px)` and either oversizing the background image height to avoid clip, or acknowledging the clip is acceptable at the chosen offset. Only matters if parallax stays in scope (see the parallax-scope entry above).

  <!-- dedup-key: section="r17" title="parallax formula 1015 of scroll speed is pagelengthdependent and clips" evidence="the fixed stadium background bgstadium drifts very slowly as the user scrolls a scrolllinked parallax at roughly 1015 of scroll speed" -->

- **Parallax on `.bg-stadium` (`position: fixed`) semantics + iOS Safari `backdrop-blur` interaction** — R17–R18 (P1, feasibility, confidence 0.82)

  `.bg-stadium` is `position: fixed`, so it already "stays still" in viewport space. Parallax must keep it fixed and apply `transform: translate3d(0, var(--parallax-y), 0)` via a single rAF scroll loop. The iOS Safari combination of fixed element + transform + `backdrop-blur-xl` on `RegionSharePanel` has historical repaint quirks worth confirming. Also only matters if parallax stays in scope.

  <!-- dedup-key: section="r17r18" title="parallax on bgstadium position fixed semantics ios safari backdropblur interaction" evidence="bgstadium is position fixed inset 0 in globalscss" -->

- **R18 as written prescribes implementation inside a product requirement** — R18 (P2, scope-guardian, confidence 0.82)

  "GPU-accelerated (transform-based, no top/background-position animation)" is an implementation detail, not a product outcome. The current version of R18 already separates outcome ("no frame drops") from mechanism; this entry is preserved in case parallax stays and planners revisit whether any mechanism wording should remain at the requirements level.

  <!-- dedup-key: section="r18" title="r18 as written prescribes implementation inside a product requirement" evidence="the parallax drift is gpuaccelerated transformbased no topbackgroundposition animation and does not cause jank on a midrange mobile device" -->

- **App Router client-nav remount: does the hero cascade replay on every back-button?** — R6 / R11 (P1, adversarial, confidence 0.82)

  Next.js App Router client transitions may remount the route segment, which re-fires the mount cascade. "First page load" was used loosely in R6/R11 to mean "hero mount." If mount semantics are intended, state them; if first-visit-per-session semantics are intended, the implementation needs a sessionStorage guard. This matters most for the home → region → back-button path, which every coordinator traversing the toolkit will hit.

  <!-- dedup-key: section="r6 r11" title="app router clientnav remount does the hero cascade replay on every backbutton" evidence="on first page load the hero performs a light staggered sequence this is a mounttime cascade not scrolltriggered" -->

- **Premise is internally-observed, not evidence-backed** — Problem Frame (P1, product-lens + adversarial, confidence 0.92)

  The doc describes a perceptual gap the team notices, not a problem coordinators/partners/supporters have reported. No cited share-rate number, no drop-off data, no coordinator reactions. For an already-launched editorial site, "do nothing" is low-risk while "ship motion the audience dislikes" is higher-risk (motion forces itself on every visitor). Either anchor the premise with one concrete signal (session-recording observation, 3–5 coordinator reactions, baseline share rate), or explicitly reframe this as a craft/brand investment rather than a user-problem fix.

  <!-- dedup-key: section="problem frame" title="premise is internallyobserved not evidencebacked" evidence="the site looks editorial and composed at rest but it doesnt feel premium in motion sections appear instantly" -->

- **Success criteria don't measure the stated goal** — Success Criteria (P1, product-lens, confidence 0.84)

  Five of seven success criteria are hygiene metrics (CLS, Lighthouse, 60fps, reduced-motion, settled-1.5s). The two outcome-facing ones rely on self-report from a hypothetical visitor the team will likely never ask, plus a single designer's subjective agreement. No post-launch decision rule for "was this worth it?" Either add a behavioral outcome tied to toolkit use (region-page share click-through, session duration, coordinator return rate), or drop the audience-facing criterion and commit explicitly to this as a craft/brand measurement.

  <!-- dedup-key: section="success criteria" title="success criteria dont measure the stated goal" evidence="a firsttime visitor scrolling through either page should describe the motion as nice or simply not notice it at all" -->

- **Chain from "premium feel" → toolkit outcome is unexamined** — Problem Frame (P1, product-lens, confidence 0.78)

  The causal chain being asserted — reveals + parallax → "feels premium" → "trust JFP" → "share more videos regionally" — is plausible in isolation but unvalidated, and the last hop is the one that matters for the product. A coordinator grabbing a QR code for a WhatsApp group cares about finding their region and copying a link; motion sits between them and that action. Name one behavioral outcome this is supposed to move or commit to brand-surface-only measurement.

  <!-- dedup-key: section="problem frame" title="chain from premium feel to toolkit outcome is unexamined" evidence="makes a firsttime visitor regional coordinator partner or supporter feel theyre on a wellproduced brand surface" -->

- **Asymmetric risk with no mid-build checkpoint** — Success Criteria (P1, product-lens, confidence 0.76)

  "Felt but not seen" means success is indistinguishable from "did nothing" for most users while failure (motion that's too present) is loud. Upside ceiling: "nobody mentions it." Downside: "first impression says webby/tryhard." Add a mid-build checkpoint with 3–5 target-audience viewers (hero cascade + one scroll reveal + parallax) before the full rollout. If they say "animated" or "I noticed the background," the work stops and retunes.

  <!-- dedup-key: section="success criteria" title="asymmetric risk with no midbuild checkpoint" evidence="a firsttime visitor scrolling through either page should describe the motion as nice or simply not notice it at all and never as animated bouncy slick" -->

- **Opportunity cost vs. pre-tournament priorities not named** — Dependencies / Assumptions (P1, product-lens, confidence 0.74)

  The World Cup runs June–July 2026. Highest-leverage questions in that window are typically: coordinator acquisition, share flow on the devices it gets used on, language/region coverage, partner co-branding. The doc scopes those out without arguing against them. Defensible only if distribution/share/content are genuinely in good shape. Name the competing priorities and why motion polish wins.

  <!-- dedup-key: section="dependencies assumptions" title="opportunity cost vs pretournament priorities not named" evidence="this applies to the marketingfacing surfaces that a supporter or coordinator will actually read and share" -->

- **Client-component boundary model for reveals is undefined** — Requirements / Dependencies (P1, feasibility, confidence 0.85)

  Every animated element lives inside a server component today (`app/page.tsx`, `app/[id]/page.tsx`, plus `StepCard`, `RegionCard`, `StadiumBg`, `SiteFooter`, `BackCrumb`, `SiteHeader`). Reveal logic, IntersectionObserver, `prefers-reduced-motion` JS, and the R28 ready signal all require a client boundary. Before planning picks an implementation technique, decide: (a) a single `<Reveal>` / `<RevealGroup>` client wrapper around server-rendered children (cheapest, keeps pages static), (b) convert page components to client (heaviest), or (c) pure CSS (constrained by R4). This decision shapes file structure for every other requirement.

  <!-- dedup-key: section="requirements dependencies" title="clientcomponent boundary model for reveals is undefined" evidence="light wrapping of siblings into group containers for staggered reveals is acceptable in planning" -->

- **RegionSharePanel reveal wrapper vs. hydration ordering** — R14 (P2, feasibility + adversarial, confidence 0.86)

  `RegionSharePanel` is `"use client"` with internal state, mounted under `key={region.id}` which forces remount on every region switch. If the reveal wrapper is a server-rendered container, it transitions while the panel hydrates — the panel's initial skeleton may reshape (language picker before/after effects, iframe lazy-load sizing) mid-fade. If the reveal is owned by the client panel itself, it fires after hydration, which can be non-trivially after visual paint on a slow device. Decide where the reveal wrapper lives and what the panel's SSR-visible shape is so the reveal does not visually double up with hydration paint.

  <!-- dedup-key: section="r14" title="regionsharepanel reveal wrapper vs hydration ordering" evidence="the regionsharepanel reveals as a single block the panels inner widgets language picker share link qr do not have individual reveal animations" -->

- **R1–R5 framed as a motion system — heavier than a two-page polish pass needs?** — Requirements / Motion Vocabulary (P2, scope-guardian, confidence 0.72)

  R1–R5 define a reusable vocabulary as if the site were about to extend this to additional pages. For a single polish pass across two pages, the same outcome could be delivered by a prose note plus five targeted CSS transitions. The system framing creates pressure during planning to build an abstracted, configurable reveal primitive rather than write direct code. Revisit whether this structure is worth the carrying cost at current site size.

  <!-- dedup-key: section="requirements motion vocabulary" title="r1r5 framed as a motion system heavier than a twopage polish pass needs" evidence="r1 the site has exactly one entrancereveal pattern used consistently across all animated elements" -->

- **R9 as per-breakpoint algorithm vs. outcome-only restatement** — R9 (P2, scope-guardian, confidence 0.70)

  Three stagger algorithms across three breakpoints is a non-trivial implementation problem relative to the perceptual gain. Current R9 now documents the actual 3+3+1 desktop layout, but the requirement could also be restated as an outcome: "the region grid reveals with a stagger that reads as a coherent left-to-right, top-to-bottom gesture at every viewport size." Decide whether the explicit algorithm (current wording) or the outcome-only framing is the right contract for planning.

  <!-- dedup-key: section="r9" title="r9 as perbreakpoint algorithm vs outcomeonly restatement" evidence="the 7card region grid reveals with a stagger that reads as visual rows" -->

- **Staged rollout (hero cascades → scroll reveals → parallax) as an explicit ship plan** — Rollout (P2, product-lens, confidence 0.68)

  First impressions map almost entirely to the hero, which is the cheapest, lowest-risk, highest-payoff piece. R6 + R11 alone could ship in 1–2 days. R7–R15 add scope and jank surface with steeply diminishing first-impression return. R17–R18 carry the most risk. A phased plan (Phase 1 = P0 + hero cascades; Phase 2 = rest of reveals; Phase 3 = parallax) with explicit go/no-go between phases de-risks several of the other Deferred items here and makes the parallax-is-first-to-cut clause actionable.

  <!-- dedup-key: section="rollout" title="staged rollout hero cascades scroll reveals parallax as an explicit ship plan" evidence="on first page load the hero performs a light staggered sequence" -->

- **AI-slop risk — motion vocabulary has no JFP-specific signature** — Problem Frame / Key Decisions (P2, design-lens, confidence 0.65)

  Fade-up + 60–80ms stagger is the single most common scroll-animation pattern on the web in 2024–2026. After implementation, a motion-literate designer will correctly observe that the treatment reads as a well-executed generic Next.js site, not as a produced brand experience. Add 1–2 brand-specific choreographic details — for example: a slightly longer hold (200ms) before the first hero element moves, referencing the contemplative tone; zero-translate opacity-only entry on the functional step cards; a radial/outward stagger on the region grid referencing the "world" metaphor — to give the vocabulary an identifiable character.

  <!-- dedup-key: section="problem frame key decisions" title="aislop risk motion vocabulary has no jfpspecific signature" evidence="makes a firsttime visitor feel theyre on a wellproduced brand surface from jesus film project not a generic toolkit" -->

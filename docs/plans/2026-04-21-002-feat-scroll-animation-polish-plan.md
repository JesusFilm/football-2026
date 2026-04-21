---
title: "feat: Scroll-Driven Animation Polish"
type: feat
status: active
date: 2026-04-21
origin: docs/brainstorms/2026-04-21-scroll-animation-polish-requirements.md
---

# feat: Scroll-Driven Animation Polish

## Overview

Add a restrained editorial motion layer to `app/page.tsx` and `app/[id]/page.tsx`: hero cascades on first load, entrance reveals on scroll, optional slow parallax on the fixed stadium background. Single vocabulary — opacity fade + small upward translate, `cubic-bezier(0.16, 1, 0.3, 1)`, 400–600ms, 60–80ms intra-group stagger. `prefers-reduced-motion` disables every motion on the site (entrance reveals, parallax, and the existing `animate-bob` scroll cue). All of it sits behind a `.motion-ready` class on `<html>` set by a pre-paint inline script so SSR / no-JS / pre-hydration users always see content.

The plan ships the motion system as thin client wrappers (`<Reveal>`, `<RevealGroup>`) around the existing server components, matching the "client island" pattern already in use for `RegionSharePanel`, `CountryViewsSection`, and `MapCalibrator`. No page components convert to `"use client"`. No animation library is introduced — the vocabulary is small enough that a ~60-line custom primitive is cheaper to maintain than ~40KB of framer-motion / motion, and the `.reveal` state is ultimately a single CSS class swap.

## Problem Frame

The site is editorial at rest but static in motion. Sections pop in, the fixed background doesn't breathe, and the premium-feel gap between this and a comparable Apple / magazine surface lives entirely in the motion layer. See origin `docs/brainstorms/2026-04-21-scroll-animation-polish-requirements.md` for the full frame, the scope boundaries, and the Priority Tiering (P0 / P1 / P2) this plan implements.

The plan carries forward every requirement from that document (R1–R30) plus the three additional rules added below that the flow analysis surfaced as real implementation-level gaps (mid-session reduced-motion toggle, `@media print`, bfcache restore). It does not re-invent product behavior.

## Requirements Trace

- **R1–R5 (motion vocabulary)** — implemented as a single `.reveal` class + CSS transition applied to an inner wrapper, keyed behind `.motion-ready`; ease curve named as `--ease-editorial: cubic-bezier(0.16, 1, 0.3, 1)` in `@theme`. R4 specifically requires a one-shot IntersectionObserver that disconnects after the first threshold crossing, preventing reveal-replay on viewport re-entry — this is the requirement that ruled out native CSS `animation-timeline: view()` (which replays on re-entry).
- **R6 (home hero cascade)** — `<RevealGroup as="hero">` around eyebrow / tagline / headline / subcopy in `app/page.tsx`. Triggered by `document.fonts.ready` ∨ 300ms fallback, inside `requestAnimationFrame` after hydration; sessionStorage-keyed for no-replay on back-nav.
- **R7 (home step cards)** — `<RevealGroup>` around the three `<StepCard>`s in `app/page.tsx`, with R24/R29 above-fold exception handled inside the group.
- **R8 (region-grid heading pair)** — `<RevealGroup>` around the heading + subcopy.
- **R9 (region grid 3+3+1)** — `<RevealGroup mode="rows" rowGroups={[3,3,1]}>` wrapping the 7 `<RegionCard>`s; groups are computed once at first render per R30.
- **R10 (footer)** — `<Reveal>` around `<SiteFooter>` in `app/page.tsx`.
- **R11 (region hero cascade)** — `<RevealGroup as="hero" budgetMs={1000}>` around back-crumb / eyebrow / tagline / headline / subcopy / stats-row in `app/[id]/page.tsx`.
- **R12–R15 (region detail reveals)** — same wrappers applied to step cards, picker heading pair, `<RegionSharePanel>` (single block), and the "Where The Story is Spreading" section group.
- **R17–R18 (parallax)** — optional P2 unit. `<ParallaxBg>` client wrapper around `<StadiumBg>` drives `transform: translate3d(0, var(--parallax-y), 0)` on `.bg-stadium` via a rAF loop with `--parallax-y = min(scrollY * 0.12, 60px)`.
- **R19 (grain static)** — preserved; `.grain` stays on its own fixed element unchanged.
- **R20 (header static + ambient motion honors reduced-motion)** — global `@media (prefers-reduced-motion: reduce)` rule in `app/globals.css` disables `.animate-bob`, `.reveal` transitions, and `--parallax-y` animation.
- **R21 (reduced-motion = zero motion)** — same rule + JS guard in `<Reveal>` so the initial-hidden state never applies when the user's OS preference is reduce.
- **R22 (SSR baseline, `.motion-ready`)** — inline `<script>` as a child of `<html>` (before `<body>`) in `app/layout.tsx` adds `document.documentElement.classList.add("motion-ready")` synchronously before first paint. CSS `opacity: 0; transform: translateY(10px)` lives behind `.motion-ready .reveal { ... }`; no JS / no hydration → content visible.
- **R23 (reveals don't block focus / clicks / SR)** — `.reveal` only affects `opacity` and `transform`, never `visibility` or `pointer-events`.
- **R24 (already-past-threshold at hydration → no animation)** — `<Reveal>` checks `entry.intersectionRatio` on its first observer callback and, if already past 0.15, applies the revealed state without the transition.
- **R25 (focus mid-reveal snaps to revealed)** — `<Reveal>` listens for `focusin` within its subtree and, if any descendant receives focus while the element is mid-reveal, sets the transition duration to `0ms` and applies the revealed state immediately.
- **R26 (reveal transform on inner wrapper)** — `<Reveal>` always renders an inner `<div class="reveal">` around its children; consumers wrap existing components externally so `hover:-translate-y-0.5` and other user-initiated transforms stay on the outer element and compose cleanly.
- **R27 (anchor / scroll-restoration suppresses hero cascade)** — the hero-cascade trigger reads `window.scrollY` inside its rAF; if nonzero at trigger time (restored from back-nav or anchor), the cascade is skipped and hero elements render in their revealed state.
- **R28 (cascade trigger signal)** — `Promise.race([document.fonts.ready, sleep(300)]).then(() => rAF(fireCascade))` inside a `useEffect` gated by a `useRef` (Strict Mode re-entry guard).
- **R29 (short viewport: step cards trail the hero cascade)** — hero `<RevealGroup>` accepts `trailingSpillover` children; on mount, if they're in the initial viewport, they join the cascade as trailing-wave items.
- **R30 (revealed stays revealed across resize)** — stagger groupings (R9 row assignment) are captured in a ref at first render and never recomputed. `.revealed` class, once applied, is never removed.
- **R31 (new — mid-session reduced-motion flip)** — a top-level `matchMedia("(prefers-reduced-motion: reduce)")` listener inside the root layout's client bootstrap snaps all `.reveal:not(.revealed)` elements to the revealed state when the preference flips to `reduce`.
- **R32 (new — `@media print` always reveals)** — `@media print { .reveal { opacity: 1 !important; transform: none !important; animation: none !important; } }` in `app/globals.css`.
- **R33 (new — bfcache restore)** — `pageshow` listener with `event.persisted === true` walks `.reveal` elements and applies the revealed state immediately; no cascade replay.

## Scope Boundaries

All of the origin document's Scope Boundaries carry forward without change. Additionally:

- No conversion of `app/page.tsx` or `app/[id]/page.tsx` to `"use client"`. Page components remain server components; motion enters via client-island wrappers only.
- No animation library (no framer-motion / motion / gsap). The custom `<Reveal>` primitive ships ~60–80 lines of code.
- No CSS `animation-timeline: view()` for content reveals — ruled out during the review (R4 replay-on-reentry conflict). Parallax may still use `animation-timeline: scroll()` if planning judges it cheaper than a rAF loop (see Unit 6 Approach).
- No preloading of `stadium-hero.webp` via `<link rel="preload">` in this plan. Flagged in Risks for follow-up.

### Deferred to Separate Tasks

- **Parallax (P2, R17–R18)** — implemented as Unit 6 behind a ship gate. After Units 1–5 land, measure Lighthouse mobile performance; if adding Unit 6 would push the regression past the ≤3-point budget, the unit is cut (see the origin document's Priority Tiering). Cutting it leaves R1–R15, R20–R30 intact on both pages.
- **Evidence / premise anchoring** — the origin document's Deferred Questions include five product-lens items (premise not evidence-backed; chain to toolkit outcomes; success criteria misaligned; asymmetric risk / mid-build checkpoint; opportunity cost). The user chose to carry these into planning without resolution; they are tracked but not implemented by this plan. If a mid-build checkpoint is wanted, the natural slot is between Unit 4 and Unit 5 — see Operational Notes.
- **`docs/solutions/` conventions seeding** — this is the first motion-layer plan in this repo. Capture the `.motion-ready` gate, the inner-wrapper transform rule, the reduced-motion master-switch contract, and the WCAG 2.4.11 focus-snap pattern to `docs/solutions/` via `/ce-compound` after the work lands. Not a deliverable of this plan.

## Context & Research

### Relevant Code and Patterns

- `app/layout.tsx` — existing inline `<script>` via `dangerouslySetInnerHTML` for JSON-LD in `<body>`. Use the same technique for the `.motion-ready` pre-paint script, placed as a child of `<html>` before `<body>` so it runs before first paint.
- `app/globals.css` — `@theme` block holds all tokens (colors, radii, fonts); add `--ease-editorial` here. Existing `.bg-stadium` (`position: fixed; inset: 0; z-index: -2;`), `.grain` (`position: fixed; inset: 0; z-index: -1;`), `@keyframes bob`, `.animate-bob`, and `:focus-visible` rules all live here. No `@media (prefers-reduced-motion: reduce)` rule exists today — this plan adds the first one.
- `components/region-share-panel.tsx` — exemplar `"use client"` component with `useState` / `useEffect` / click-outside listener. Follow its structural style for `<Reveal>` / `<RevealGroup>` / `<ParallaxBg>`.
- `components/country-views-section.tsx` — additional exemplar `"use client"` component; the `vi.stubGlobal("matchMedia", ...)` pattern used in its test file (`test/country-views-section.test.tsx:163`) is the direct model for reduced-motion testing.
- `components/region-card.tsx` — outer `<Link>` carries `hover:-translate-y-0.5`; inner button-chip has `group-hover:translate-x-0.5 group-hover:-translate-y-0.5`. Multiple user-initiated transforms exist; R26 requires reveal transforms on a separate (outer) wrapper, which is why `<Reveal>` wraps `<RegionCard>` from the outside rather than editing its internals.
- `components/stadium-bg.tsx` — two-line server component (`<div class="bg-stadium"/><div class="grain"/>`). Unit 6 replaces it with a `"use client"` `ParallaxBg` that renders the same two divs and attaches the scroll listener.
- `test/setup.ts` + `vitest.config.mts` — jsdom env, globals on, `@/` path alias resolves in tests. `test/country-views-section.test.tsx` is the model for stubbing browser globals.
- `docs/plans/2026-04-21-001-feat-country-views-map-plan.md` — prior plan in this repo, followed for document style and section shape.

### Institutional Learnings

No `docs/solutions/` directory exists yet. This plan establishes conventions that should be compounded to `docs/solutions/` afterward (see Scope Boundaries > Deferred to Separate Tasks).

### External References

External research was skipped — the implementation vocabulary (IntersectionObserver, `document.fonts.ready`, `requestAnimationFrame`, `matchMedia`, `pageshow`, CSS transitions) is well-documented browser API surface with no team-specific gotchas that external docs would resolve. All decisions are sourced from MDN + the existing repo conventions.

## Key Technical Decisions

- **Client-island wrappers, not page conversions.** `<Reveal>` and `<RevealGroup>` are small `"use client"` components that wrap server-rendered children. The existing pattern (`RegionSharePanel`, `CountryViewsSection`) confirms this is the house style. (Resolves origin doc deferred: client-boundary model.)
- **Custom hook + CSS transitions, not a motion library.** Vocabulary is exactly "opacity fade + short translate" — a library buys nothing except bundle weight. (Resolves origin doc deferred: implementation approach for reveals.)
- **`animation-timeline: view()` ruled out for content reveals** (R4 replay-on-reentry conflict). Still a candidate for R17 parallax. (Resolved in the 2026-04-21 review.)
- **Parallax via rAF + CSS variable on `.bg-stadium`, with bottom over-draw.** `.bg-stadium` becomes `inset: -60px 0 0 0` (or equivalent height extension) so `translateY(-60px)` does not expose page background. rAF loop writes `--parallax-y`; the element reads it via `transform: translate3d(0, var(--parallax-y), 0)`. CSS `animation-timeline: scroll()` is a plausible alternative but introduces a different code path for a single element — the rAF path is consistent with how the rest of the motion layer is wired. (Resolves origin doc deferred: parallax mechanism.)
- **SSR baseline via pre-paint inline `<script>` + `.motion-ready` class gate.** Server renders elements opaque. The script runs synchronously before first paint (it's a child of `<html>`, not `<body>`), setting `.motion-ready` on `<html>`. CSS `.motion-ready .reveal { opacity: 0; transform: translateY(10px); transition: ...; }` applies the initial-hidden state only after the class is present. No-JS users never see it. Follows the existing JSON-LD inline-script convention rather than introducing `next/script`. (Resolves origin doc deferred: SSR-visible baseline.)
- **Hero cascade ready signal: `Promise.race([document.fonts.ready, sleep(300)])` → `requestAnimationFrame` → fire.** Font-aware so the cascade doesn't paint with the fallback font and re-paint with the web font mid-animation; fallback-capped at 300ms so slow fonts don't eat the 1.5s settled-in-viewport budget. (Resolves origin doc deferred: ready signal.)
- **No-replay on client-nav back-button via sessionStorage.** `sessionStorage.getItem("hero-cascade:" + pathname) === "seen"` → skip cascade. This matches the origin's "settle and stay settled" key decision. Full-page reload clears sessionStorage and the cascade plays again. (Resolves origin doc deferred: App Router client-nav remount.)
- **Focus mid-reveal jumps to revealed state via a `focusin` listener on the wrapper** — WCAG 2.4.11. The listener uses `event.target.matches(":focus-visible")` to filter mouse-click acquisitions that shouldn't jump.
- **R9 desktop 3+3+1 stagger is a fixed group assignment captured at first render,** not a resize-responsive computation. The exact inter-row gap is ~160ms (80ms stagger per card × 2 positions of offset + a small settle beat). Locked in this plan rather than deferred again.
- **Reduced-motion is the one-and-only kill switch.** Global CSS media-query rule disables `.animate-bob`, `.reveal` transition, and parallax transform together. `<Reveal>` also reads `matchMedia` on mount and skips observation entirely when `reduce` is set. A top-level listener in the layout handles the mid-session flip (R31).
- **Test strategy: unit-test the wrappers, smoke-test the pages.** `<Reveal>` and `<RevealGroup>` get dedicated component tests with stubbed `IntersectionObserver` + `matchMedia`. Pages get one thin integration test verifying wrappers are in place and reduced-motion renders all content immediately.

## Open Questions

### Resolved During Planning

- **Implementation approach for reveals** — custom `<Reveal>` + `<RevealGroup>` client components using a hand-rolled `useInView`-style hook + CSS transitions. Not a motion library. `animation-timeline: view()` ruled out.
- **Parallax mechanism** — rAF loop writing a CSS variable on `.bg-stadium`, which applies it via `transform: translate3d(0, var(--parallax-y), 0)`. The background element gets bottom over-draw so translate doesn't expose page background.
- **SSR baseline** — inline pre-paint `<script>` in the root layout sets `.motion-ready` on `<html>`; initial-hidden CSS lives behind that class.
- **Ready signal for hero cascade** — `document.fonts.ready` with 300ms fallback, fired inside rAF after hydration.
- **App Router client-nav replay** — suppressed via sessionStorage keyed by pathname; cascade runs once per hard-load per tab.
- **Late-hydration hero out-of-view** — if `window.scrollY` is nonzero at trigger time, cascade is skipped and hero elements render revealed immediately.
- **Reduced-motion mid-session** — snap all in-flight reveals to final state on the media-query `change` event (R31).
- **Print and bfcache** — `@media print` always-reveal rule (R32); `pageshow[persisted]` listener snaps `.reveal` elements to revealed (R33).

### Deferred to Implementation

- **Exact R9 timings (first-row → second-row inter-wave gap, R9 tablet centered 7th card beat timing)** — the spec locks the formula at 80ms per index + 160ms inter-row gap, but the _subjective_ inter-row delay should be tuned during Unit 5 with live eyes on the page and the timings captured as constants in `components/reveal-group.tsx`.
- **`RegionSharePanel` SSR skeleton shape parity** — the panel is SSR'd with a consistent outer shape today; verify during Unit 5 that wrapping it in a `<Reveal>` does not introduce a visible hydration reshape on slow connections.
- **iOS Safari + `position: fixed` + transform + `backdrop-blur-xl` repaint interaction** — Unit 6 verification step; if repaint on iOS Safari is visibly broken when parallax drifts and a `RegionSharePanel` is on screen, the fallback is to gate parallax behind `@supports` or skip it on iOS.
- **Whether `stadium-hero.webp` should be preloaded** — this is a related-but-separable perf question; if Lighthouse's LCP shifts materially with parallax active, add a `<link rel="preload">` as a fast follow. Tracked in Risks.

## Implementation Units

- [ ] **Unit 1: Motion foundation — CSS baseline, `.motion-ready` gate, reduced-motion, print**

**Goal:** Establish the CSS and the pre-paint script that every subsequent unit builds on. No behavioral change yet; after this unit the site renders identically to today for users without JS (opaque content) and identically to today with JS (because no `<Reveal>` wrappers exist yet — the `.reveal` rule has no elements to key onto).

**Requirements:** R1, R2, R19, R20, R21, R22, R32.

**Dependencies:** None.

**Files:**

- Modify: `app/globals.css`
- Modify: `app/layout.tsx`

**Approach:**

- In `app/globals.css`, add inside `@theme`: `--ease-editorial: cubic-bezier(0.16, 1, 0.3, 1);`.
- Add the base reveal rule keyed behind `.motion-ready`:

  ```css
  .motion-ready .reveal {
    opacity: 0;
    transform: translateY(10px);
    transition:
      opacity 500ms var(--ease-editorial),
      transform 500ms var(--ease-editorial);
    will-change: opacity, transform;
  }
  .motion-ready .reveal.revealed {
    opacity: 1;
    transform: none;
  }
  ```

- Add the global reduced-motion block (R20, R21):

  ```css
  @media (prefers-reduced-motion: reduce) {
    .motion-ready .reveal,
    .motion-ready .reveal.revealed {
      opacity: 1;
      transform: none;
      transition: none;
    }
    .animate-bob {
      animation: none;
    }
    /* parallax var is set by JS; zeroing here is belt-and-suspenders */
    .bg-stadium {
      --parallax-y: 0px;
      transform: none;
    }
  }
  ```

- Add the print block (R32):

  ```css
  @media print {
    .reveal {
      opacity: 1 !important;
      transform: none !important;
      animation: none !important;
    }
  }
  ```

- In `app/layout.tsx`, inside `<html>` and immediately before `<body>`, add an inline script child:

  ```tsx
  <script
    dangerouslySetInnerHTML={{
      __html: "document.documentElement.classList.add('motion-ready')",
    }}
  />
  ```

  This follows the existing JSON-LD inline-script pattern already present at the end of `<body>` (convention established in `app/layout.tsx:89-94`). It runs synchronously as part of HTML parsing, before first paint.

**Execution note:** Deploy this unit and verify no visual change with DevTools "Disable JavaScript" on — server-rendered page should be fully visible because `.motion-ready` is never applied and `.reveal` only has an effect when both classes are present.

**Patterns to follow:** The JSON-LD inline `<script>` injection in `app/layout.tsx:89-94`. Do not introduce `next/script` — this repo doesn't use it.

**Test scenarios:**

- Test expectation: none — pure CSS + a one-line script, no behavioral change. Verification is manual smoke testing with JS disabled / enabled.

**Verification:**

- With JS disabled, both pages render fully visible content.
- With JS enabled and no `<Reveal>` wrappers yet, both pages still render fully visible content (the `.reveal` class has nothing to key onto).
- DevTools → Emulate CSS media feature `prefers-reduced-motion: reduce` → `animate-bob` chevron on region page stops animating.
- `window.matchMedia("print")` preview shows all motion tokens neutered.

---

- [ ] **Unit 2: `<Reveal>` client primitive**

**Goal:** The single reusable wrapper that handles IntersectionObserver, initial-hidden class lifecycle, R24 (already-past-threshold skip), R25 (focus snap), R27 (anchor / scroll-restoration suppress for the hero-cascade variant), R33 (bfcache restore), R31 (mid-session reduced-motion flip), Strict Mode double-invoke guard, and reduced-motion bypass.

**Requirements:** R1–R5, R22 (the class-state half), R23, R24, R25, R27 (basics — the hero-specific suppress logic lands in Unit 3), R31, R33.

**Dependencies:** Unit 1.

**Files:**

- Create: `components/reveal.tsx`
- Create: `test/reveal.test.tsx`

**Approach:**

- Component signature:

  ```tsx
  "use client";
  type Props = {
    children: React.ReactNode;
    delay?: number; // ms, used by RevealGroup for stagger
    as?: keyof React.JSX.IntrinsicElements; // default "div"
    threshold?: number; // default 0.15
  };
  export function Reveal({ children, delay = 0, as: Tag = "div", threshold = 0.15 }: Props) { ... }
  ```

- Renders `<Tag className="reveal" ref={ref}>` (the class name is always `"reveal"`; when `revealed` is applied, both classes are present: `"reveal revealed"`).
- On mount, a `useRef` guards against React Strict Mode double-invocation.
- If `matchMedia("(prefers-reduced-motion: reduce)").matches`, set `.revealed` immediately without observing — content appears with no transition, per R21.
- Otherwise, create an `IntersectionObserver` with `threshold: [0, threshold]`. On the first callback:
  - If `entry.intersectionRatio >= threshold`, the element is already past threshold at observer-attach (R24) — set `.revealed` with `transition: none` (temporarily override via inline style or a short-lived `.no-anim` class), then restore after next frame.
  - Otherwise, wait for the normal crossing and apply `.revealed` after the `delay` prop (R4 one-shot: disconnect the observer in the same callback).
- Attach a `focusin` listener (R25). If a descendant is focused while `revealed` is not yet applied and the focus is keyboard-initiated (`event.target.matches(":focus-visible")`), set `.revealed` with `transition: none` and restore on the next frame.
- Subscribe to `matchMedia("(prefers-reduced-motion: reduce)")` `change` events (R31). When the preference flips to `reduce`, snap to revealed (same mechanism as the reduced-motion-on-mount branch).
- Subscribe to `window` `pageshow` events (R33). If `event.persisted === true`, snap to revealed.
- Cleanup in useEffect returns: disconnect the IO, remove the focus listener, unsubscribe media-query and pageshow.

**Execution note:** Implement test-first for the observer branches (already-past-threshold, crosses-threshold, reduced-motion-skip, focus-snap, pageshow-snap, reduced-motion-mid-session) before wiring the component — these are the rules most likely to regress silently.

**Technical design:** _(directional, not implementation specification)_

```
On mount:
  if (prefers-reduced-motion) → setRevealed(no transition); return;

  observer = new IntersectionObserver(([entry]) => {
    if (entry.intersectionRatio >= threshold) {
      if (firstCallback) setRevealed(no transition); // R24
      else              setRevealed(after delay);    // normal path
      observer.disconnect();
    }
  }, { threshold: [0, threshold] });
  observer.observe(el);

  el.addEventListener("focusin", onFocusIn);          // R25
  mq.addEventListener("change", onReducedChange);     // R31
  window.addEventListener("pageshow", onPageshow);    // R33
```

**Patterns to follow:** `components/region-share-panel.tsx` for `"use client"` + `useEffect` cleanup patterns; `test/country-views-section.test.tsx:163` for `vi.stubGlobal("matchMedia", ...)`; add a sibling `vi.stubGlobal("IntersectionObserver", ...)` in the test file (or in `test/setup.ts` — Unit 2 should decide whether this is local or global; local keeps `test/setup.ts` minimal).

**Test scenarios:**

- Happy path: element renders with `.reveal`, then `.revealed` added after observer callback at threshold crossing, observer disconnected afterward.
- Happy path: with `delay={120}`, `.revealed` applies ~120ms after the observer fires.
- Edge case (R24): if the stubbed IO fires with `intersectionRatio >= threshold` synchronously on attach, `.revealed` applies immediately with inline `transition: none` (verifiable via `el.style.transition`) that is cleared on the next frame.
- Edge case (R21): when `matchMedia` returns `matches: true` for `(prefers-reduced-motion: reduce)`, the component mounts with `.revealed` directly and no observer is created.
- Edge case (R31): simulate a `matchMedia` `change` event flipping `matches` to `true` while `.revealed` is not yet applied → element snaps to `.revealed`.
- Edge case (R33): fire a synthetic `pageshow` event with `persisted: true` → element snaps to `.revealed` regardless of prior state.
- Edge case (R25 keyboard focus): focus a descendant with `tabIndex={0}` via keyboard simulation → snap to `.revealed`; focus via mouse click does not snap (requires `:focus-visible`-style gating — acceptable approximation in jsdom is to check `event.target.hasAttribute("data-focus-visible")` or skip the visibility check and accept the mouse-click snap as behaviorally acceptable).
- Edge case (Strict Mode): render with `<React.StrictMode>`; observer is attached exactly once despite double-invocation of the effect.
- Error path: if `IntersectionObserver` is undefined (feature-detect fails), the component falls back to `.revealed` immediately (graceful degradation).
- Integration: verify the component renders children untouched; no wrapper appears if children are already a single element that can carry the class (choice: always render the wrapper for simplicity; test verifies `<div class="reveal">` is emitted).

**Verification:**

- The test file exercises every R24 / R25 / R27 / R31 / R33 branch and passes.
- Manual smoke: add `<Reveal>` around a `<div>Hello</div>` on a test page; confirm opacity transitions on scroll-into-view.

---

- [ ] **Unit 3: `<RevealGroup>` with stagger + hero-mode trigger**

**Goal:** Coordinate stagger across a group of children, in two modes: (a) **scroll-enter** — children enter as a wave when the group's container crosses the threshold; (b) **hero** — children enter immediately after the cascade-trigger signal (`document.fonts.ready` ∨ 300ms fallback → rAF), with the sessionStorage no-replay guard and the non-zero-scroll suppression.

**Requirements:** R3 (stagger), R6, R7, R9 (row assignment), R10, R11, R12, R13, R15, R27 (hero-specific suppress), R28 (ready signal), R29 (spillover trailing wave), R30 (stagger grouping fixed at first render).

**Dependencies:** Unit 2.

**Files:**

- Create: `components/reveal-group.tsx`
- Create: `lib/hero-cascade.ts` (small helper exposing the font-ready + rAF + 300ms fallback as a single promise)
- Create: `test/reveal-group.test.tsx`

**Approach:**

- Component signature:

  ```tsx
  "use client";
  type Mode = "scroll" | "hero";
  type Props = {
    children: React.ReactNode[];
    mode?: Mode;               // default "scroll"
    staggerMs?: number;        // default 70
    budgetMs?: number;         // default 700 for hero; not used for scroll
    rowGroups?: number[];      // e.g. [3, 3, 1] for R9; rows stagger by rowGapMs
    rowGapMs?: number;         // default 160
    sessionKey?: string;       // hero-mode only, used for sessionStorage no-replay key
  };
  export function RevealGroup({ ... }: Props) { ... }
  ```

- Each child is wrapped in a `<Reveal delay={computedDelay}>`. Delays are computed at first render and captured in a ref (R30: no recompute on resize).
  - For `mode="scroll"` without `rowGroups`: child N gets `delay = N * staggerMs`.
  - For `mode="scroll"` with `rowGroups`: rows stagger by `rowGapMs`; within a row, children stagger by `staggerMs`.
  - For `mode="hero"`: children get `delay = N * staggerMs`; the group additionally coordinates the trigger (see below).
- Scroll-mode group: a single "sentinel" IntersectionObserver on the group container triggers the reveal. When the sentinel crosses the threshold, each child's `<Reveal>` is told to reveal after its computed delay. Implementation detail: the group-level observer is primary; the child `<Reveal>` components in this mode skip their own observer (they're told via context or a prop).
- Hero mode:
  - On mount: if `sessionStorage.getItem(sessionKey) === "seen"` → skip cascade; set all children to `.revealed` immediately.
  - Otherwise: `await hero-cascade.ts.ready()` which returns a promise resolving after `Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 300))])` then a `requestAnimationFrame`. After that:
    - Check `window.scrollY`. If nonzero → skip cascade (R27) and set all children to `.revealed` immediately.
    - Otherwise → fire staggered `.revealed` application per child delays.
  - After either path, `sessionStorage.setItem(sessionKey, "seen")`.
  - Strict Mode guard via `useRef`.
- R29 (spillover): hero-mode `RevealGroup` exposes an optional `trailingSpillover?: React.ReactNode` prop. Content passed here is included in the hero cascade IF it's within the initial viewport at mount (measured via `getBoundingClientRect().top < window.innerHeight`); otherwise it's not revealed here and falls through to a subsequent scroll-mode group. This is how home step cards become trailing-wave on short viewports.

**Execution note:** Unit 3 can land behind Unit 2 as a thin composition layer — write the scroll-mode tests first, then hero-mode, then rowGroups.

**Technical design:** _(directional)_

```
RevealGroup mode="scroll" rowGroups={[3,3,1]} staggerMs=70 rowGapMs=160:

  children: [C1 C2 C3 C4 C5 C6 C7]
  delays:    [0  70 140 | 160 230 300 | 320]  ← (row 1) gap (row 2) gap (row 3)

RevealGroup mode="hero" sessionKey="home-hero":

  mount:
    if sessionStorage[sessionKey] === "seen": skipCascade()
    else await ready(); if scrollY !== 0: skipCascade()
    else for i in children: scheduleReveal(i, i * staggerMs)
    sessionStorage[sessionKey] = "seen"
```

**Patterns to follow:** Child-coordination pattern — pass reveal commands via React Context inside the group, or lift observation entirely into the group and pass `revealed` as a prop down to each Reveal. Prefer the latter (simpler, no context needed); the `<Reveal>` from Unit 2 already accepts an externally-controlled revealed state if Unit 2 exposes a controlled-mode prop.

**Test scenarios:**

- Happy path (scroll, flat stagger): group with 4 children; stubbed IO fires threshold crossing; children get `.revealed` at 0, 70, 140, 210ms respectively (verify via `vi.useFakeTimers`).
- Happy path (scroll, rowGroups=[3,3,1]): verify computed delays match the 3+3+1 spec.
- Happy path (hero, fresh session): mount with `sessionStorage` empty, stubbed `document.fonts.ready` resolves in 50ms, verify cascade fires at ~50ms + rAF and children stagger; sessionStorage key set to "seen".
- Happy path (hero, 300ms fallback): stubbed `document.fonts.ready` never resolves; verify cascade fires at ~300ms + rAF.
- Edge case (hero, seen): sessionStorage pre-populated with `sessionKey = "seen"` → cascade skipped; children render `.revealed` immediately.
- Edge case (hero, scroll-restored): `window.scrollY = 500` at trigger time → cascade skipped per R27; children render `.revealed` immediately; sessionStorage key set to "seen".
- Edge case (R30): re-render the group after resize; captured delays ref is not recomputed.
- Edge case (R29 spillover): provide trailingSpillover children with stubbed `getBoundingClientRect().top` values above and below `window.innerHeight`; verify only above-fold spillover items join the cascade.
- Integration: hero-mode group with reduced-motion on → children render `.revealed` immediately with no cascade.

**Verification:**

- All test scenarios pass.
- Manual smoke: render a temporary test page with a hero-mode group of 4 headings; verify the cascade fires once on reload, does not replay on Next.js `<Link>` back-navigation, and skips cleanly when arriving with a scroll anchor.

---

- [ ] **Unit 4: Home page integration (`app/page.tsx`)**

**Goal:** Wrap the home page's content in `<RevealGroup>` / `<Reveal>` to deliver R6–R10. No changes to the underlying `<StepCard>` / `<RegionCard>` internals — all wrapping is external.

**Requirements:** R6, R7, R8, R9, R10.

**Dependencies:** Unit 3.

**Files:**

- Modify: `app/page.tsx`
- Create: `test/page-home-reveal.test.tsx`

**Approach:**

- Hero section: wrap the `<section>` inner content (eyebrow span, tagline p, headline h1, subcopy p) in `<RevealGroup mode="hero" sessionKey="home-hero" staggerMs={80} budgetMs={700}>`, passing the step-cards section as `trailingSpillover` for R29.
- Step cards section: wrap the three `<StepCard>`s in `<RevealGroup mode="scroll" staggerMs={70}>`. This group is skipped by its own observer if the hero group claimed the cards as `trailingSpillover` on a short viewport.
- Select-region heading + subcopy: wrap both in `<RevealGroup mode="scroll" staggerMs={70}>`.
- Region grid: wrap the 7 `<RegionCard>`s in `<RevealGroup mode="scroll" rowGroups={[3,3,1]} staggerMs={70} rowGapMs={160}>`. External wrapping preserves R26 — the reveal transform lives on the `<Reveal>` inner div, not on the outer `<Link>` that carries `hover:-translate-y-0.5`.
- Footer: `<Reveal>` around `<SiteFooter />`.

**Execution note:** Verify in-browser at desktop / iPad-landscape / iPhone-12-landscape viewports that the hero cascade and step-cards group coordinate correctly (R24 / R29). Adjust spillover detection threshold if the step cards "pop" independently on narrow desktop.

**Patterns to follow:** External wrapping via composition (no component edits). The prior plan `docs/plans/2026-04-21-001-feat-country-views-map-plan.md` followed the same "wrap, don't edit" philosophy.

**Test scenarios:**

- Happy path: renders the page, finds 4 hero-group children with `.reveal` class, 3 step cards with `.reveal`, 7 region cards with `.reveal`, and the footer with `.reveal`.
- Integration (R21): with `matchMedia` stubbed to return `(prefers-reduced-motion: reduce) matches: true`, render the page; verify no element has the initial-hidden state (all have `.revealed`) and no observer was attached.
- Integration (R30): snapshot the computed row-group assignments (captured via a test seam on `<RevealGroup>`) and confirm they match [3,3,1] at initial render.
- Edge case: renders with a `window.scrollY = 1000` stub; verify hero cascade is marked as skipped (R27) and all hero children are immediately `.revealed`.

**Verification:**

- Tests pass.
- Manual: hard-reload `/` → hero cascade plays once; click a region card, click Back → cascade does not replay (sessionStorage guard). Scroll down → each subsequent group reveals as expected.

---

- [ ] **Unit 5: Region detail page integration (`app/[id]/page.tsx`)**

**Goal:** Same wrapping pattern on the region detail page. Hero has 6 elements → ~1000ms budget. Includes the existing `animate-bob` scroll cue (now reduced-motion-safe via Unit 1's global CSS rule).

**Requirements:** R11, R12, R13, R14, R15, R20 (animate-bob reduced-motion already handled globally).

**Dependencies:** Unit 3, Unit 4 (for the wrapping pattern).

**Files:**

- Modify: `app/[id]/page.tsx`
- Create: `test/page-region-detail-reveal.test.tsx`

**Approach:**

- Hero section: `<RevealGroup mode="hero" sessionKey={`region-hero:${id}`} staggerMs={80} budgetMs={1000}>` around back-crumb / eyebrow / tagline / headline / subcopy / stats-row. The sessionKey is per-region so navigating `/amer → back → /apac` plays the `/apac` cascade the first time it's visited. Stats row reveals as a single unit (no internal stagger — R11).
- Step cards section: same shape as home (R12).
- "Pick a language" heading + subcopy: `<RevealGroup staggerMs={70}>`.
- `<RegionSharePanel>`: wrapped in a single `<Reveal>` (R14). The panel itself is `"use client"` and mounts under `key={region.id}`; verify at dev-time that the SSR skeleton matches the hydrated shape so reveal + hydration don't paint twice (Deferred to Implementation).
- "Where The Story is Spreading" section (heading + eyebrow + placeholder card): `<RevealGroup staggerMs={70}>` (R15).
- `animate-bob` scroll-cue chevron: left untouched. It's inside a plain `<div>` in the current markup and its reduced-motion disable comes from the global CSS in Unit 1.
- `<CountryViewsSection>` (the existing client component below the share panel — also covered by the prior country-views plan): wrapped externally in a `<Reveal>`. It already has its own loading state and hydration path; the reveal wrapper does not interfere.

**Execution note:** Verify on a region page with the longest country list that the scroll-entry reveals for the country-views section and "Where The Story is Spreading" section don't race each other on a fast scroll-down.

**Patterns to follow:** Same as Unit 4.

**Test scenarios:**

- Happy path: renders the region page for a fixture region (mock `fetchJourneys` + `getRegion` as `region-page-country-views.test.tsx` does today); verify 6 hero children, 3 step cards, heading pair, share panel, and "where the story is spreading" group each get `.reveal`.
- Integration (R14): wrap fires one reveal on the share panel container, not on its inner widgets; verify inner widgets do not have `.reveal` classes.
- Integration (R21): reduced-motion path renders all children with `.revealed`; the `animate-bob` chevron is visibly static (testable via computed style or by checking the CSS rule is applied).
- Edge case (SSR skeleton parity): render the page to static HTML (via `renderToString` or equivalent), then hydrate; assert that the DOM tree shape under the share panel's reveal wrapper is identical before and after hydration modulo state-driven attribute changes (best-effort — verify at least that no element is added or removed).

**Verification:**

- Tests pass.
- Manual: hard-reload `/amer` → region-hero cascade plays; scroll → each subsequent group reveals; reduced-motion OS setting → everything immediate; `animate-bob` chevron stops animating.

---

- [ ] **Unit 6: Parallax background (P2 — optional, separable)**

**Goal:** Apply the slow stadium-background parallax per R17–R18. GPU-accelerated, no jank on mid-range mobile, no clipping against the viewport.

**Requirements:** R17, R18.

**Dependencies:** Unit 1.

**Files:**

- Modify: `components/stadium-bg.tsx` (convert to thin server → client composition, or keep the server wrapper and add a client sibling that owns the scroll loop)
- Create: `components/parallax-bg.tsx` (`"use client"`)
- Modify: `app/globals.css` (extend `.bg-stadium` bottom over-draw)
- Create: `test/parallax-bg.test.tsx`

**Approach:**

- `.bg-stadium` CSS: extend to `inset: -80px 0 0 0;` (top-biased over-draw — the background translates _upward_ so the extra 80px is at the top of the element, above the viewport). Exact value = max parallax offset (60px per R17) + a small buffer. Alternative: `height: calc(100vh + 80px); top: -80px;`. Either works; pick whichever reads cleaner against the existing `inset: 0` shorthand.
- `components/parallax-bg.tsx`: a `"use client"` component rendered alongside `.bg-stadium`. On mount, attaches a single `scroll` listener (or rAF loop via `onScroll` inside the component is simpler — the rAF schedules the write on the next frame, not every scroll event). Writes `--parallax-y` on the `.bg-stadium` element: `el.style.setProperty("--parallax-y", ${-Math.min(window.scrollY * 0.12, 60)}px)`.
- `.bg-stadium` reads the variable: `transform: translate3d(0, var(--parallax-y, 0px), 0); will-change: transform;`.
- Reduced-motion: the component's mount effect checks `matchMedia("(prefers-reduced-motion: reduce)").matches` → if true, do not attach the scroll listener; the CSS media rule in Unit 1 already zeroes the variable.
- Strict Mode guard via `useRef` on the listener attach.
- Cleanup: remove scroll listener on unmount.
- iOS Safari check (Deferred to Implementation): test on iOS with a `RegionSharePanel` scrolled under the parallax; if `backdrop-blur-xl` visibly glitches as the background moves, gate the parallax behind `@supports` or `window.matchMedia("(hover: hover)")` (roughly desktop-only), or cut parallax and keep the rest of the unit's work.

**Execution note:** Measure Lighthouse mobile performance before enabling this unit (baseline with Units 1–5 landed). If the drop is already ≥2 points from Unit 5, this unit is at risk of blowing the ≤3-point budget per the origin doc's Success Criteria — ship gate applies.

**Technical design:** _(directional)_

```
ParallaxBg (mount):
  if (prefers-reduced-motion) return;

  el = document.querySelector(".bg-stadium");
  let rAF: number | null = null;

  onScroll = () => {
    if (rAF !== null) return;
    rAF = requestAnimationFrame(() => {
      el.style.setProperty("--parallax-y", `${-Math.min(window.scrollY * 0.12, 60)}px`);
      rAF = null;
    });
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll(); // paint once at mount
  return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(rAF); };
```

**Patterns to follow:** `"use client"` hygiene from `components/region-share-panel.tsx`; scroll-listener cleanup pattern from any React cleanup example; DOM-writing via CSS variable follows the well-established "JS writes the variable, CSS applies it" pattern.

**Test scenarios:**

- Happy path: stub `window.scrollY`, dispatch a scroll event, fake-advance rAF; verify `--parallax-y` on a stubbed `.bg-stadium` element equals `-Math.min(scrollY * 0.12, 60)px`.
- Edge case (clamp): scrollY = 10000 → parallax-y clamps to `-60px`.
- Edge case (reduced-motion): stubbed `matchMedia` returns `reduce: true` → no scroll listener is attached; `--parallax-y` stays at initial.
- Edge case (cleanup): unmount the component → scroll listener removed (verify via `vi.spyOn(window, "removeEventListener")`).
- Edge case (Strict Mode): double-mount → exactly one scroll listener attached (verified by spy).
- Integration: render the component into a test tree, dispatch two scroll events inside a single rAF frame; verify only one `setProperty` call (batching works).

**Verification:**

- Tests pass.
- Manual: on a desktop browser, scroll the home page from top to footer; background drifts upward at ~12% of scroll speed, never exceeding ~60px offset, never exposing the page background at either edge.
- Lighthouse mobile performance on both pages stays ≤3 points below the pre-change baseline. If it does not, cut this unit and keep R17–R18 deferred.

---

## System-Wide Impact

- **Interaction graph:** Every server component rendered on `app/page.tsx` or `app/[id]/page.tsx` may now be nested inside a `<Reveal>` or `<RevealGroup>`. No component internals change, but every visual section becomes "wrapped." Existing client components (`RegionSharePanel`, `CountryViewsSection`) are wrapped externally and hydrate as usual.
- **Error propagation:** `<Reveal>` has no error states — if `IntersectionObserver` is missing, the fallback is "immediate reveal," which is correct behavior. `<RevealGroup>` in hero mode swallows any error from `document.fonts.ready` (unexpected rejection) by falling through to the 300ms timer. Parallax `<ParallaxBg>` has no error states; a failed `setProperty` is a silent noop.
- **State lifecycle risks:** The hero-cascade sessionStorage key is scoped per pathname (`hero-cascade:/`, `hero-cascade:/amer`, ...). If the user logs out / clears storage / opens a private window, the cascade replays — this is expected behavior. No cross-session state is persisted.
- **API surface parity:** No API changes. Wrappers are pure client-side additions.
- **Integration coverage:** Real-world integration concerns addressed by tests: SSR skeleton shape after adding `<Reveal>` wrappers (Unit 5), IntersectionObserver + Strict Mode double-invoke (Unit 2), reduced-motion on mount and mid-session (Units 2, 3), bfcache restore (Unit 2), anchor-link arrival / scroll-restoration (Units 2, 3).
- **Unchanged invariants:** Every existing interactive control — region card hover, language picker open/close, copy-button state, QR rendering, country-views map, back-crumb navigation — keeps its current behavior exactly. The `animate-bob` scroll cue keeps its current behavior _except_ now honors reduced-motion. No dead code is removed; no component is edited internally.

## Risks & Dependencies

| Risk                                                                                                                                                                                 | Mitigation                                                                                                                                                                                                                                                   |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `animate-bob` previously had no reduced-motion guard; adding one is a behavior change for the narrow set of users who have `prefers-reduced-motion: reduce` and visit a region page. | This is the intended behavior per R20 / R21. Call it out in the PR description so reviewers see it and can flag if it breaks an internal expectation.                                                                                                        |
| React Strict Mode double-invocation in dev silently breaks the cascade-fire-once guard if the ref is forgotten.                                                                      | Every mount-effect in `<Reveal>` and `<RevealGroup>` guards with `useRef`. Tests cover this explicitly (re-render the component inside `<StrictMode>`).                                                                                                      |
| Parallax `.bg-stadium` over-draw may interact with the existing `.bg-stadium::after` grid-lines texture (`masked to a central ellipse`).                                             | Extend the mask-image positioning to account for the 80px over-draw at the top edge; verify manually that the grid-lines center stays aligned with the viewport center. If the mask visibly drifts, recalibrate in Unit 6.                                   |
| iOS Safari `position: fixed` + `transform` + `backdrop-blur-xl` interaction.                                                                                                         | Flagged as Deferred to Implementation. Unit 6 includes an iOS verification step; if broken, gate parallax or cut.                                                                                                                                            |
| Cold-font-load on slow 3G: fallback at 300ms may still paint the cascade with a fallback font and then swap.                                                                         | Accepted tradeoff — the alternative (unbounded wait on `document.fonts.ready`) blows the 1.5s settled-in-viewport budget. The 300ms fallback is named in the requirements and the perceived outcome is acceptable on modern networks.                        |
| `stadium-hero.webp` is not preloaded. If LCP shifts materially, this becomes the thing to fix.                                                                                       | Tracked as a Deferred to Implementation fast follow. If Lighthouse LCP regresses in Unit 6 verification, add `<link rel="preload" as="image" href="/stadium-hero.webp" imagesrcset={...}>` in `app/layout.tsx` before shipping parallax.                     |
| Hero-cascade sessionStorage key collides with another feature's key.                                                                                                                 | The keys are explicit and namespaced: `hero-cascade:/`, `hero-cascade:/amer`, etc. No other code in the repo uses `sessionStorage`; verified via repo scan.                                                                                                  |
| `RegionSharePanel` SSR skeleton may reshape visibly on hydration under the reveal wrapper.                                                                                           | Unit 5 includes an SSR-skeleton-parity smoke test and a manual verification step. If the reshape is visible, the mitigation is to set a fixed-height wrapper around the panel or to snap the reveal to "revealed" as soon as the panel's client effects run. |

## Documentation / Operational Notes

- **Rollout:** single merge. No feature flag. The `.motion-ready` CSS class gate is a clean "either the whole motion layer runs or none of it does" switch — a rollback is a single revert of Units 1–5, or cutting Unit 6 independently without affecting the rest.
- **Monitoring:** no new telemetry. The stated success criteria (no CLS, ≤3-point Lighthouse drop, 60fps mobile scroll) are verified manually during Unit 4 / Unit 5 / Unit 6 execution, not instrumented.
- **PR guidance:** the PR description should call out the `animate-bob` reduced-motion change explicitly (see Risks), include before/after screenshots or a screen recording of both pages on desktop and mobile, and link back to the origin brainstorm for the tiering context.
- **Docs follow-up:** after merge, run `/ce-compound` to seed `docs/solutions/` with the patterns established here (`.motion-ready` gate, inner-wrapper transform rule, reduced-motion master-switch contract, hero-cascade sessionStorage convention, WCAG 2.4.11 focus-snap pattern). This is the first motion-layer plan in the repo; future motion work will benefit from finding these decisions documented.
- **Mid-build checkpoint (optional):** the origin document's product-lens deferred items flagged asymmetric risk and no mid-build audience checkpoint. The natural slot is between Unit 4 and Unit 5 — deploy Units 1–4 to a preview URL, show it to 3–5 regional coordinators (or internal proxies), collect reactions; if they describe the motion as "animated" or "slick," retune before proceeding. Not required to ship.

## Sources & References

- **Origin document:** `docs/brainstorms/2026-04-21-scroll-animation-polish-requirements.md` (includes the 16-item `## Deferred / Open Questions` section for reference)
- Related code: `app/layout.tsx`, `app/page.tsx`, `app/[id]/page.tsx`, `app/globals.css`, `components/region-card.tsx`, `components/region-share-panel.tsx`, `components/stadium-bg.tsx`, `components/country-views-section.tsx`
- Prior plan followed for document style: `docs/plans/2026-04-21-001-feat-country-views-map-plan.md`
- Conventions authority: `AGENTS.md`
- Test infrastructure: `vitest.config.mts`, `test/setup.ts`, `test/country-views-section.test.tsx:163` (stubbing pattern for `matchMedia`)

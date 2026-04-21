"use client";

import { useEffect, useRef, useState } from "react";

/* eslint-disable react-hooks/set-state-in-effect -- the synchronous
 * setState calls in the IntersectionObserver-undefined fallback path
 * intentionally complete on mount; deferring via setTimeout/rAF would
 * cause a visible FOUC on very old browsers or in test environments
 * that don't ship IntersectionObserver.
 */

const REVEAL_THRESHOLD = 0.15;

type Props = {
  children: React.ReactNode;
  className?: string;
  /**
   * Stagger delay in ms. Applied as a setTimeout before flipping to
   * `.revealed` when the element crosses the viewport threshold.
   * Ignored when the element is already past threshold at attach
   * (R24 snap) and when `revealed` is driven externally with `instant`.
   */
  delay?: number;
  /**
   * Controlled mode. When defined, Reveal does not attach its own
   * IntersectionObserver — the consumer (typically `<RevealGroup>`)
   * owns the trigger and the class follows this prop. When undefined,
   * Reveal self-observes and reveals once on first viewport entry.
   */
  revealed?: boolean;
  /**
   * When true and the element transitions to revealed, snap to the
   * revealed state with no animation. Used by R24 (already past
   * threshold at hydration) and R27 (scroll-restoration / anchor
   * arrivals) paths driven by the parent group.
   */
  instant?: boolean;
};

/**
 * One element of the site's entrance-reveal vocabulary: opacity fade
 * + ~10px upward translate, 500ms expo-out. The `.reveal` class is
 * keyed behind `.motion-ready` (set by a pre-paint script in the root
 * layout) so SSR / no-JS paints content fully visible.
 *
 * Two modes:
 *  - Uncontrolled (default) — self-observes via IntersectionObserver,
 *    reveals once on first viewport entry (R4). Jumps to revealed on
 *    keyboard focus acquisition mid-reveal (R25 / WCAG 2.4.11). Snaps
 *    to revealed on bfcache restore (R33).
 *  - Controlled (`revealed` prop defined) — a parent owns the trigger
 *    and this component just follows the prop. `<RevealGroup>` uses
 *    this for hero cascades and scroll-mode wave reveals.
 *
 * Reduced-motion is handled by CSS alone (see `app/globals.css`). The
 * @media rule snaps `.reveal` to revealed state on preference change
 * via cascade re-evaluation; no per-instance matchMedia listener is
 * needed for the mid-session flip.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  revealed: controlledRevealed,
  instant = false,
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [internalRevealed, setInternalRevealed] = useState(false);
  const [instantReveal, setInstantReveal] = useState(false);

  const isControlled = controlledRevealed !== undefined;
  const effectiveRevealed = isControlled
    ? controlledRevealed
    : internalRevealed;

  // Controlled mode: when the prop flips to revealed with `instant`,
  // snap without animation.
  useEffect(() => {
    if (!isControlled) return;
    if (controlledRevealed && instant) setInstantReveal(true);
  }, [isControlled, controlledRevealed, instant]);

  // Uncontrolled mode: IntersectionObserver + focus + pageshow.
  useEffect(() => {
    if (isControlled) return;
    const el = ref.current;
    if (!el) return;

    // jsdom and very old browsers don't ship IntersectionObserver.
    // Graceful fallback: reveal immediately, no animation.
    if (typeof IntersectionObserver === "undefined") {
      setInstantReveal(true);
      setInternalRevealed(true);
      return;
    }

    let cancelled = false;
    let pendingTimeout: ReturnType<typeof setTimeout> | null = null;
    let isFirstCallback = true;

    const reveal = (withInstant: boolean) => {
      if (cancelled) return;
      if (withInstant) setInstantReveal(true);
      setInternalRevealed(true);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (cancelled) return;
        const wasFirstCallback = isFirstCallback;
        isFirstCallback = false;
        if (entry.intersectionRatio < REVEAL_THRESHOLD) return;

        if (wasFirstCallback) {
          // R24: element was already past threshold when the observer
          // attached (tall viewport, restored scroll, anchor link).
          // Snap to revealed with no animation.
          reveal(true);
        } else if (delay > 0) {
          pendingTimeout = setTimeout(() => reveal(false), delay);
        } else {
          reveal(false);
        }
        observer.disconnect();
      },
      { threshold: [0, REVEAL_THRESHOLD] },
    );

    observer.observe(el);

    // R25: keyboard focus acquisition on a mid-reveal element snaps
    // it to revealed so the focus ring sits on visible content
    // (WCAG 2.4.11). Mouse-click focus (no `:focus-visible`) doesn't
    // trigger the snap.
    const onFocusIn = (event: FocusEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target?.matches?.(":focus-visible")) return;
      reveal(true);
      observer.disconnect();
    };

    // R33: bfcache restore. Any `.reveal` elements restored from the
    // back-forward cache snap to revealed immediately — no cascade
    // replay, no animation.
    const onPageshow = (event: PageTransitionEvent) => {
      if (!event.persisted) return;
      reveal(true);
      observer.disconnect();
    };

    el.addEventListener("focusin", onFocusIn);
    window.addEventListener("pageshow", onPageshow);

    return () => {
      cancelled = true;
      if (pendingTimeout !== null) clearTimeout(pendingTimeout);
      observer.disconnect();
      el.removeEventListener("focusin", onFocusIn);
      window.removeEventListener("pageshow", onPageshow);
    };
  }, [isControlled, delay]);

  // R25/R24/R33: after a snap (instantReveal true with inline
  // `transition: none`), restore the default transition on the next
  // frame so subsequent property changes (e.g., region card hover
  // transform) animate normally. Without this clear, a focus-snapped
  // card would lose its hover transition for the rest of the session.
  useEffect(() => {
    if (!instantReveal) return;
    const raf = requestAnimationFrame(() => setInstantReveal(false));
    return () => cancelAnimationFrame(raf);
  }, [instantReveal]);

  const classes = ["reveal"];
  if (effectiveRevealed) classes.push("revealed");
  if (className) classes.push(className);

  return (
    <div
      ref={ref}
      className={classes.join(" ")}
      style={instantReveal ? { transition: "none" } : undefined}
    >
      {children}
    </div>
  );
}

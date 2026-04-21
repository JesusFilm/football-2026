"use client";

import { Children, isValidElement, useEffect, useRef, useState } from "react";

import { Reveal } from "@/components/reveal";

/* eslint-disable react-hooks/set-state-in-effect -- the synchronous
 * setState calls in the IntersectionObserver-undefined fallback and in
 * the sessionStorage-already-seen fast path intentionally complete on
 * mount; deferring them via setTimeout/rAF would cause a visible FOUC.
 */

type Mode = "scroll" | "hero";

type Props = {
  children: React.ReactNode;
  /**
   * `"scroll"` — a single sentinel IntersectionObserver on the group
   * container triggers the staggered cascade of children when it
   * crosses the viewport threshold (R7–R10, R12–R15).
   *
   * `"hero"` — mount-time cascade gated on `document.fonts.ready` with
   * a 300ms fallback and a sessionStorage no-replay guard (R6, R11,
   * R27, R28). Requires `sessionKey` to be set.
   */
  mode?: Mode;
  /**
   * Passed through to the group container div. Use for grid/flex
   * layout classes so the group IS the grid container and child
   * Reveal wrappers become the grid items.
   */
  className?: string;
  /**
   * Applied to every child's wrapping `<Reveal>` div. Use when the
   * group is a grid/flex container and each child's wrapper needs
   * layout classes (e.g., `lg:col-span-2 lg:last:col-start-3`).
   */
  itemClassName?: string;
  /** Per-child stagger within a row (or flat stagger when no rowGroups). */
  staggerMs?: number;
  /**
   * Per-row delays for R9's 3+3+1 desktop / 2+2+2+1 tablet / flat
   * mobile stagger. Lengths must equal the number of children at the
   * breakpoint they describe. Locked at first render per R30 — resize
   * does not recompute.
   */
  rowGroups?: number[];
  /**
   * Row-start to row-start stride when `rowGroups` is set. E.g., 160ms
   * means row 2 begins 160ms after row 1 begins (not after row 1 ends).
   */
  rowGapMs?: number;
  /**
   * Hero-mode only — unique key for the sessionStorage no-replay guard.
   * Use per-page / per-route values (`home-hero`, `region-hero:${id}`)
   * so navigating between routes re-plays the cascade for each route
   * the first time the user visits it.
   */
  sessionKey?: string;
};

const OBSERVER_THRESHOLD = 0.15;
const FONT_FALLBACK_MS = 300;

/**
 * Compute per-child delays. Without `rowGroups`, children get a flat
 * `i * staggerMs`. With `rowGroups`, row N starts at `N * rowGapMs`
 * and children within row N stagger by `staggerMs`.
 */
function computeDelays(
  count: number,
  staggerMs: number,
  rowGroups: number[] | undefined,
  rowGapMs: number,
): number[] {
  const delays = new Array<number>(count);
  if (!rowGroups || rowGroups.length === 0) {
    for (let i = 0; i < count; i++) delays[i] = i * staggerMs;
    return delays;
  }
  let rowIdx = 0;
  let consumed = 0;
  for (const rowSize of rowGroups) {
    for (let col = 0; col < rowSize && consumed < count; col++) {
      delays[consumed] = rowIdx * rowGapMs + col * staggerMs;
      consumed++;
    }
    rowIdx++;
  }
  // Any children past the rowGroups total fall into a trailing row.
  let trailingCol = 0;
  while (consumed < count) {
    delays[consumed] = rowIdx * rowGapMs + trailingCol * staggerMs;
    consumed++;
    trailingCol++;
  }
  return delays;
}

/**
 * Coordinates a wave of `<Reveal>` children. Each child is wrapped in
 * a controlled `<Reveal>` whose `revealed` prop is driven by the group
 * — children do not self-observe.
 *
 * Note on R29 (short-viewport trailing-wave for step cards): this
 * implementation does not add step-cards as a trailing wave of the
 * hero cascade. Instead, above-fold scroll-mode groups rely on R24
 * (first-callback snap) in `<Reveal>`, so their children appear with
 * no animation when already in view at hydration. This is a deliberate
 * trim — the P1 "trailing wave" refinement requires cross-group
 * coordination (hero group must know about step-cards scroll group),
 * and the simpler R24 path ships cleanly now.
 */
export function RevealGroup({
  children,
  mode = "scroll",
  className,
  itemClassName,
  staggerMs = 70,
  rowGroups,
  rowGapMs = 160,
  sessionKey,
}: Props) {
  const items = Children.toArray(children).filter(
    isValidElement,
  ) as React.ReactElement[];
  const count = items.length;

  // R30: delays locked at first render via useState's lazy initializer;
  // prop changes to staggerMs / rowGroups / rowGapMs do not recompute.
  const [delays] = useState<number[]>(() =>
    computeDelays(count, staggerMs, rowGroups, rowGapMs),
  );

  const [revealedFlags, setRevealedFlags] = useState<boolean[]>(() =>
    new Array(count).fill(false),
  );
  const [instantFlags, setInstantFlags] = useState<boolean[]>(() =>
    new Array(count).fill(false),
  );

  const containerRef = useRef<HTMLDivElement | null>(null);

  // Scroll-mode: single sentinel observer on the group container.
  useEffect(() => {
    if (mode !== "scroll") return;
    const el = containerRef.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      setInstantFlags(new Array(count).fill(true));
      setRevealedFlags(new Array(count).fill(true));
      return;
    }

    let cancelled = false;
    const pendingTimeouts: ReturnType<typeof setTimeout>[] = [];

    const cascadeReveal = () => {
      if (cancelled) return;
      delays.forEach((d, i) => {
        const t = setTimeout(() => {
          if (cancelled) return;
          setRevealedFlags((prev) => {
            if (prev[i]) return prev;
            const next = prev.slice();
            next[i] = true;
            return next;
          });
        }, d);
        pendingTimeouts.push(t);
      });
    };

    // Scroll-mode always animates on threshold crossing. Unlike individual
    // <Reveal> elements (which snap instantly when already past threshold
    // at mount, since they're usually small), a RevealGroup container
    // spans multiple children and is often partially visible at hydration
    // with most content still below the fold. Snapping everything instantly
    // would cheat the user out of the visible cascade.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio < OBSERVER_THRESHOLD) return;
        cascadeReveal();
        observer.disconnect();
      },
      { threshold: [0, OBSERVER_THRESHOLD] },
    );

    observer.observe(el);

    return () => {
      cancelled = true;
      pendingTimeouts.forEach(clearTimeout);
      observer.disconnect();
    };
  }, [mode, count, delays]);

  // Hero-mode: fonts.ready + 300ms fallback + rAF + sessionStorage guard.
  useEffect(() => {
    if (mode !== "hero") return;
    if (!sessionKey) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("<RevealGroup mode='hero'> requires a sessionKey prop.");
      }
      return;
    }

    let cancelled = false;
    const pendingTimeouts: ReturnType<typeof setTimeout>[] = [];

    const cascadeReveal = (useInstant: boolean) => {
      if (cancelled) return;
      if (useInstant) {
        setInstantFlags(new Array(count).fill(true));
        setRevealedFlags(new Array(count).fill(true));
        return;
      }
      delays.forEach((d, i) => {
        const t = setTimeout(() => {
          if (cancelled) return;
          setRevealedFlags((prev) => {
            if (prev[i]) return prev;
            const next = prev.slice();
            next[i] = true;
            return next;
          });
        }, d);
        pendingTimeouts.push(t);
      });
    };

    const storageKey = `hero-cascade:${sessionKey}`;

    // Already seen this session — skip cascade animation.
    try {
      if (
        typeof sessionStorage !== "undefined" &&
        sessionStorage.getItem(storageKey) === "seen"
      ) {
        cascadeReveal(true);
        return;
      }
    } catch {
      // sessionStorage unavailable (private mode, tracking protection);
      // fall through and play the cascade.
    }

    const fontsReady: Promise<unknown> =
      typeof document !== "undefined" && "fonts" in document
        ? (document as Document & { fonts: { ready: Promise<unknown> } }).fonts
            .ready
        : Promise.resolve();

    const fallback = new Promise<void>((resolve) => {
      const t = setTimeout(resolve, FONT_FALLBACK_MS);
      pendingTimeouts.push(t);
    });

    const rafPromise = () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve());
      });

    (async () => {
      await Promise.race([fontsReady, fallback]);
      if (cancelled) return;
      await rafPromise();
      if (cancelled) return;

      // R27: arrived via anchor / restored scroll — hero is off the
      // top of the viewport (or user has already scrolled). Snap
      // without animation and still mark the key as seen so future
      // back-navigations behave consistently.
      const scrollY = typeof window !== "undefined" ? window.scrollY : 0;
      cascadeReveal(scrollY > 0);

      try {
        if (typeof sessionStorage !== "undefined") {
          sessionStorage.setItem(storageKey, "seen");
        }
      } catch {
        // ignore
      }
    })();

    return () => {
      cancelled = true;
      pendingTimeouts.forEach(clearTimeout);
    };
  }, [mode, sessionKey, count, delays]);

  // R33: bfcache restore — any un-revealed children snap immediately.
  useEffect(() => {
    const onPageshow = (event: PageTransitionEvent) => {
      if (!event.persisted) return;
      setInstantFlags(new Array(count).fill(true));
      setRevealedFlags(new Array(count).fill(true));
    };
    window.addEventListener("pageshow", onPageshow);
    return () => window.removeEventListener("pageshow", onPageshow);
  }, [count]);

  return (
    <div ref={containerRef} className={className}>
      {items.map((child, i) => (
        <Reveal
          key={child.key ?? i}
          className={itemClassName}
          revealed={revealedFlags[i]}
          instant={instantFlags[i]}
        >
          {child}
        </Reveal>
      ))}
    </div>
  );
}

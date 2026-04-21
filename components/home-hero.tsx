"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

const EASE = [0.16, 1, 0.3, 1] as const;
const FONT_FALLBACK_MS = 300;

export function HomeHero() {
  const prefersReducedMotion = useReducedMotion();
  const [ready, setReady] = useState(false);
  const [instant, setInstant] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion) {
      const frame = requestAnimationFrame(() => {
        setInstant(true);
        setReady(true);
      });
      return () => cancelAnimationFrame(frame);
    }

    let cancelled = false;
    let fallbackTimeout: number | undefined;
    const fallback = new Promise<void>((resolve) => {
      fallbackTimeout = window.setTimeout(resolve, FONT_FALLBACK_MS);
    });
    const fontsReady =
      "fonts" in document
        ? (document as Document & { fonts: { ready: Promise<unknown> } }).fonts
            .ready
        : Promise.resolve();

    (async () => {
      await Promise.race([fontsReady, fallback]);
      if (cancelled) return;
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => resolve()),
      );
      if (cancelled) return;
      setInstant(window.scrollY > 0);
      setReady(true);
    })();

    return () => {
      cancelled = true;
      if (fallbackTimeout !== undefined) {
        window.clearTimeout(fallbackTimeout);
      }
    };
  }, [prefersReducedMotion]);

  const reveal = (delayMs: number) => ({
    className: "reveal",
    initial: false,
    animate: ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 },
    transition: {
      duration: instant ? 0 : 0.5,
      delay: instant ? 0 : delayMs / 1000,
      ease: EASE,
    },
  });

  return (
    <section className="px-0 pt-16 pb-12 text-center">
      <motion.div {...reveal(0)}>
        <span className="inline-block font-mono text-[11px] font-semibold tracking-[0.18em] text-accent uppercase">
          World Cup 2026 · Toolkit
        </span>
      </motion.div>
      <motion.div {...reveal(80)}>
        <p className="mx-0 my-[14px] mb-1.5 font-serif text-[clamp(18px,1.6vw,22px)] font-medium tracking-[-0.01em] text-fg-dim italic">
          One story. Every language.
        </p>
      </motion.div>
      <motion.div {...reveal(160)}>
        <h1 className="mx-0 my-1.5 mb-5 font-display text-[clamp(42px,6vw,72px)] leading-[1.05] font-extrabold tracking-[-0.02em] text-fg">
          Activate Your Region
        </h1>
      </motion.div>
      <motion.div {...reveal(240)}>
        <p className="mx-auto max-w-[600px] text-base leading-[1.6] text-fg-dim">
          The FIFA World Cup 2026 is here. Turn the world&apos;s most-watched
          sporting event into a moment that matters. Jesus Film Project has
          created ready-to-use interactive World Cup videos to share with anyone
          across your region.
        </p>
      </motion.div>
    </section>
  );
}

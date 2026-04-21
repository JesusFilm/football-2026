"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

import { BackCrumb } from "@/components/back-crumb";
import type { Region } from "@/lib/regions";

const EASE = [0.16, 1, 0.3, 1] as const;
const FONT_FALLBACK_MS = 300;

type Props = {
  countryCountLabel: string;
  journeyCount: number;
  region: Region;
};

export function RegionHero({ countryCountLabel, journeyCount, region }: Props) {
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
      if (fallbackTimeout !== undefined) window.clearTimeout(fallbackTimeout);
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
    <section className="px-0 pt-12 pb-9 text-center">
      <motion.div {...reveal(0)}>
        <div className="mb-6 flex justify-center">
          <BackCrumb href="/" label="All regions" />
        </div>
      </motion.div>
      <motion.div {...reveal(80)}>
        <span className="inline-block font-mono text-[11px] font-semibold tracking-[0.18em] text-accent uppercase">
          World Cup 2026 · {region.displayCode}
        </span>
      </motion.div>
      <motion.div {...reveal(160)}>
        <p className="mx-0 my-2.5 mb-1 font-serif text-[clamp(16px,1.4vw,20px)] font-medium text-fg-dim italic">
          One story. Every language.
        </p>
      </motion.div>
      <motion.div {...reveal(240)}>
        <h1 className="mx-auto my-1.5 mb-5 max-w-[820px] font-display text-[clamp(36px,5vw,56px)] leading-[1.05] font-extrabold tracking-[-0.02em]">
          Activate {region.name}
        </h1>
      </motion.div>
      <motion.div {...reveal(320)}>
        <p className="mx-auto max-w-[600px] text-base leading-[1.6] text-fg-dim">
          {region.blurb} Jesus Film Project has created ready-to-use interactive
          World Cup videos to share with anyone across your region.
        </p>
      </motion.div>
      <motion.div {...reveal(400)}>
        <div className="mt-[22px] flex flex-col items-center justify-center gap-3 font-mono text-[11px] tracking-[0.12em] text-fg-mute uppercase sm:flex-row sm:gap-[18px]">
          <div
            className="flex gap-1 text-[22px]"
            style={{ filter: "saturate(1.1)" }}
          >
            {region.flags.map((flag) => (
              <span key={flag}>{flag}</span>
            ))}
          </div>
          <span className="hidden h-1.5 w-1.5 rounded-full bg-line-strong sm:block" />
          <div className="flex items-center justify-center gap-[18px]">
            <div>
              <strong className="mr-1.5 font-display text-[18px] font-bold tracking-[-0.01em] text-fg not-italic">
                {countryCountLabel}
              </strong>
              countries
            </div>
            <span className="h-1.5 w-1.5 rounded-full bg-line-strong" />
            <div>
              <strong className="mr-1.5 font-display text-[18px] font-bold tracking-[-0.01em] text-fg not-italic">
                {journeyCount}
              </strong>
              languages
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

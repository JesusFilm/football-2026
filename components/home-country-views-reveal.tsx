"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

const EASE = [0.16, 1, 0.3, 1] as const;
const CONTENT_DELAY_MS = 260;

type Props = {
  interactive: ReactNode;
  summary: ReactNode;
};

export function HomeCountryViewsReveal({ interactive, summary }: Props) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="border-t border-line py-[60px]">
      <motion.div
        className="reveal mb-7 text-center"
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ amount: 0.15, once: true, margin: "0px 0px -10% 0px" }}
        transition={{
          duration: prefersReducedMotion ? 0 : 0.5,
          ease: EASE,
        }}
      >
        <span className="inline-block font-mono text-[11px] font-semibold tracking-[0.18em] text-accent uppercase">
          Global views
        </span>
        <h2 className="mt-2 mb-0 font-display text-[32px] font-bold tracking-[-0.01em]">
          Where The Story is Spreading
        </h2>
      </motion.div>

      <motion.div
        className="reveal"
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ amount: 0.15, once: true, margin: "0px 0px -10% 0px" }}
        transition={{
          duration: prefersReducedMotion ? 0 : 0.55,
          delay: prefersReducedMotion ? 0 : CONTENT_DELAY_MS / 1000,
          ease: EASE,
        }}
      >
        {summary}
        {interactive}
      </motion.div>
    </section>
  );
}

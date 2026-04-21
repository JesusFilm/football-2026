"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useRef } from "react";

const EASE = [0.16, 1, 0.3, 1] as const;

export function RegionShareHeading() {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, {
    amount: 0.15,
    once: true,
    margin: "0px 0px -10% 0px",
  });
  const prefersReducedMotion = useReducedMotion();
  const visible = Boolean(inView || prefersReducedMotion);

  return (
    <div ref={ref} className="mx-auto mb-8 max-w-[620px] text-center">
      <motion.div
        className="reveal"
        initial={false}
        animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
        transition={{
          duration: prefersReducedMotion ? 0 : 0.5,
          ease: EASE,
        }}
      >
        <h2 className="mx-0 mt-0 mb-2.5 font-display text-[32px] font-bold tracking-[-0.01em]">
          Pick a language. Pass it on.
        </h2>
      </motion.div>
      <motion.div
        className="reveal"
        initial={false}
        animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
        transition={{
          duration: prefersReducedMotion ? 0 : 0.5,
          delay: prefersReducedMotion ? 0 : 0.07,
          ease: EASE,
        }}
      >
        <p className="text-[15px] leading-[1.6] text-fg-dim">
          Pick the language that matches your audience, then paste the link
          anywhere you already message people.
        </p>
      </motion.div>
    </div>
  );
}

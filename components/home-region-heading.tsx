"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useRef } from "react";

const EASE = [0.16, 1, 0.3, 1] as const;
const TOP_OF_PAGE_DELAY_MS = 2050;

export function HomeRegionHeading() {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, {
    amount: 0.15,
    once: true,
    margin: "0px 0px -10% 0px",
  });
  const prefersReducedMotion = useReducedMotion();
  const visible = Boolean(inView || prefersReducedMotion);
  const startDelay =
    typeof window !== "undefined" && window.scrollY === 0
      ? TOP_OF_PAGE_DELAY_MS
      : 0;

  return (
    <div ref={ref}>
      <motion.div
        className="reveal"
        initial={false}
        animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
        transition={{
          duration: prefersReducedMotion ? 0 : 0.5,
          delay: prefersReducedMotion ? 0 : startDelay / 1000,
          ease: EASE,
        }}
      >
        <h2 className="mb-2 text-center font-display text-[28px] font-bold tracking-[-0.01em]">
          Select Your Region
        </h2>
      </motion.div>
      <motion.div
        className="reveal"
        initial={false}
        animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
        transition={{
          duration: prefersReducedMotion ? 0 : 0.5,
          delay: prefersReducedMotion ? 0 : (startDelay + 90) / 1000,
          ease: EASE,
        }}
      >
        <p className="mb-8 text-center text-sm text-fg-dim">
          Seven regions. Pick the one you&apos;re activating.
        </p>
      </motion.div>
    </div>
  );
}

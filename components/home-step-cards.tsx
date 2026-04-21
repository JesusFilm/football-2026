"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { ChartNoAxesCombined, Languages, Share2 } from "lucide-react";
import { useRef } from "react";

import { StepCard } from "@/components/step-card";

const EASE = [0.16, 1, 0.3, 1] as const;
const START_DELAY_MS = 880;
const STAGGER_MS = 150;
const DURATION_MS = 700;

const steps = [
  {
    icon: Languages,
    num: "01 / CHOOSE",
    title: "Pick a language",
    body: "Find videos in your audience's local language — over 70 options.",
  },
  {
    icon: Share2,
    num: "02 / SHARE",
    title: "Send it",
    body: "Share the QR code or link anywhere — SMS, social, print, in person.",
  },
  {
    icon: ChartNoAxesCombined,
    num: "03 / TRACK",
    title: "See the impact",
    body: "Watch views and shares as the story spreads across your region.",
  },
] as const;

export function HomeStepCards() {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, {
    amount: 0.15,
    once: true,
    margin: "0px 0px -10% 0px",
  });
  const prefersReducedMotion = useReducedMotion();
  const visible = Boolean(inView || prefersReducedMotion);
  const startDelay =
    typeof window !== "undefined" && window.scrollY === 0 ? START_DELAY_MS : 0;

  return (
    <div
      ref={ref}
      className="mx-auto mt-12 mb-20 grid max-w-[820px] grid-cols-1 gap-3.5 md:grid-cols-3"
    >
      {steps.map((step, index) => (
        <motion.div
          key={step.num}
          className="reveal"
          initial={false}
          animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          transition={{
            duration: prefersReducedMotion ? 0 : DURATION_MS / 1000,
            delay: prefersReducedMotion
              ? 0
              : (startDelay + index * STAGGER_MS) / 1000,
            ease: EASE,
          }}
        >
          <StepCard {...step} />
        </motion.div>
      ))}
    </div>
  );
}

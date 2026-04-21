"use client";

import { ArrowDown, ArrowRight } from "lucide-react";
import { ChartNoAxesCombined, Languages, Share2 } from "lucide-react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { Fragment, useRef } from "react";

import { StepCard } from "@/components/step-card";

const EASE = [0.16, 1, 0.3, 1] as const;
const START_DELAY_MS = 880;
const STAGGER_MS = 150;
const DURATION_MS = 700;

export function RegionStepCards() {
  const t = useTranslations("Steps");
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
  const steps = [
    {
      icon: Languages,
      num: t("chooseNum"),
      title: t("chooseTitle"),
      body: t("chooseBody"),
    },
    {
      icon: Share2,
      num: t("shareNum"),
      title: t("shareTitle"),
      body: t("shareBody"),
    },
    {
      icon: ChartNoAxesCombined,
      num: t("trackNum"),
      title: t("trackTitle"),
      body: t("trackBody"),
    },
  ] as const;

  return (
    <div
      ref={ref}
      className="mx-auto mt-12 mb-20 grid max-w-[820px] grid-cols-1 items-start gap-2 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:gap-5"
    >
      {steps.map((step, index) => (
        <Fragment key={step.num}>
          <motion.div
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
          {index < steps.length - 1 && (
            <StepArrow
              index={index}
              prefersReducedMotion={Boolean(prefersReducedMotion)}
              startDelay={startDelay}
              visible={visible}
            />
          )}
        </Fragment>
      ))}
    </div>
  );
}

function StepArrow({
  index,
  prefersReducedMotion,
  startDelay,
  visible,
}: {
  index: number;
  prefersReducedMotion: boolean;
  startDelay: number;
  visible: boolean;
}) {
  return (
    <motion.div
      className="flex items-center justify-center text-accent/70 md:mt-10"
      aria-hidden
      initial={false}
      animate={visible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.85 }}
      transition={{
        duration: prefersReducedMotion ? 0 : 0.45,
        delay: prefersReducedMotion
          ? 0
          : (startDelay + index * STAGGER_MS + STAGGER_MS / 2) / 1000,
        ease: EASE,
      }}
    >
      <ArrowDown className="md:hidden" size={22} strokeWidth={1.8} />
      <ArrowRight
        className="rtl-mirror hidden md:block"
        size={24}
        strokeWidth={1.8}
      />
    </motion.div>
  );
}

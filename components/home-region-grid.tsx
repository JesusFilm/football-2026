"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useRef } from "react";

import { RegionCard } from "@/components/region-card";
import type { Region } from "@/lib/regions";

const EASE = [0.16, 1, 0.3, 1] as const;

type Props = {
  regions: Region[];
};

export function HomeRegionGrid({ regions }: Props) {
  return (
    <div className="mb-20 grid grid-cols-1 gap-3.5 md:grid-cols-2 lg:grid-cols-6">
      {regions.map((region, index) => (
        <MotionRegionCard key={region.id} index={index} region={region} />
      ))}
    </div>
  );
}

function MotionRegionCard({
  index,
  region,
}: {
  index: number;
  region: Region;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, {
    amount: 0.2,
    once: true,
    margin: "0px 0px -10% 0px",
  });
  const prefersReducedMotion = useReducedMotion();
  const visible = Boolean(inView || prefersReducedMotion);

  return (
    <motion.div
      ref={ref}
      className="reveal lg:col-span-2 lg:last:col-start-3"
      initial={false}
      animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
      transition={{
        duration: prefersReducedMotion ? 0 : 0.5,
        delay: prefersReducedMotion ? 0 : computeDesktopDelay(index) / 1000,
        ease: EASE,
      }}
    >
      <RegionCard region={region} />
    </motion.div>
  );
}

function computeDesktopDelay(index: number) {
  if (index < 3) return index * 70;
  if (index < 6) return 160 + (index - 3) * 70;
  return 320;
}

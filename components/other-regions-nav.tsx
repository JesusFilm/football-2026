"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

import { RegionFlags } from "@/components/region-flags";
import { Link } from "@/i18n/navigation";
import type { Region } from "@/lib/regions";

const EASE = [0.16, 1, 0.3, 1] as const;
const ROW_STAGGER_MS = 70;

type Props = {
  currentRegionId: string;
  regions: Region[];
};

export function OtherRegionsNav({ currentRegionId, regions }: Props) {
  const t = useTranslations("Region");
  const ref = useRef<HTMLElement | null>(null);
  const inView = useInView(ref, {
    amount: 0.15,
    once: true,
    margin: "0px 0px -10% 0px",
  });
  const prefersReducedMotion = useReducedMotion();
  const visible = Boolean(inView || prefersReducedMotion);
  const otherRegions = regions.filter(
    (region) => region.id !== currentRegionId,
  );
  const columnCount = useResponsiveColumnCount();

  return (
    <nav ref={ref} aria-labelledby="other-regions-heading" className="pb-10">
      <motion.h2
        id="other-regions-heading"
        className="reveal mb-4 text-center font-display text-[24px] font-bold tracking-[-0.01em]"
        initial={false}
        animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
        transition={{
          duration: prefersReducedMotion ? 0 : 0.5,
          ease: EASE,
        }}
      >
        {t("otherRegionsHeading")}
      </motion.h2>
      <div className="mx-auto grid max-w-[1040px] grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {otherRegions.map((region, index) => (
          <OtherRegionCard
            key={region.id}
            columnCount={columnCount}
            index={index}
            region={region}
          />
        ))}
      </div>
    </nav>
  );
}

function OtherRegionCard({
  columnCount,
  index,
  region,
}: {
  columnCount: number;
  index: number;
  region: Region;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, {
    amount: 0.35,
    once: true,
    margin: "0px 0px -8% 0px",
  });
  const prefersReducedMotion = useReducedMotion();
  const visible = Boolean(inView || prefersReducedMotion);

  return (
    <motion.div
      ref={ref}
      className="reveal flex"
      initial={false}
      animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
      whileHover={prefersReducedMotion ? undefined : { y: -3 }}
      transition={{
        duration: prefersReducedMotion ? 0 : 0.5,
        delay: prefersReducedMotion
          ? 0
          : ((index % columnCount) * ROW_STAGGER_MS) / 1000,
        ease: EASE,
      }}
    >
      <Link
        href={`/${region.id}`}
        className="group relative isolate flex min-h-[178px] w-full flex-col overflow-hidden rounded-[var(--radius-lg)] border border-line bg-[rgb(20_16_12_/_0.52)] px-5 pt-5 pb-4.5 text-fg no-underline backdrop-blur-md transition-[border-color,background-color,box-shadow] duration-300 ease-out hover:border-[rgb(230_57_70_/_0.42)] hover:bg-[rgb(24_19_14_/_0.68)] hover:shadow-[0_18px_46px_rgba(0,0,0,0.24)] focus-visible:border-accent"
      >
        <span className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(180px_circle_at_85%_0%,rgba(230,57,70,0.12),transparent_60%)] opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100 group-focus-visible:opacity-100" />
        <span className="absolute top-4 end-4 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-[rgb(255_255_255_/_0.04)] text-fg-mute transition-[background-color,color,transform] duration-300 ease-out group-hover:translate-x-px group-hover:-translate-y-px group-hover:bg-[rgb(230_57_70_/_0.88)] group-hover:text-white group-focus-visible:bg-[rgb(230_57_70_/_0.88)] group-focus-visible:text-white rtl:group-hover:-translate-x-px">
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            className="rtl-mirror"
            aria-hidden="true"
          >
            <path d="M3 11L11 3M5 3h6v6" />
          </svg>
        </span>
        <span className="relative z-10 mb-3 pe-10 font-mono text-[10px] tracking-[0.16em] text-accent uppercase">
          {region.displayCode}
        </span>
        <span className="relative z-10 mb-2 pe-9 text-[17px] leading-[1.25] font-semibold tracking-[-0.01em]">
          {region.name}
        </span>
        <span className="relative z-10 mb-5 line-clamp-2 text-[12px] leading-[1.5] text-fg-dim">
          {region.blurb}
        </span>
        <span className="relative z-10 mt-auto flex items-center gap-1.5">
          <RegionFlags flagCodes={region.flagCodes} />
        </span>
      </Link>
    </motion.div>
  );
}

function useResponsiveColumnCount() {
  const [columnCount, setColumnCount] = useState(1);

  useEffect(() => {
    const updateColumnCount = () => {
      if (window.matchMedia("(min-width: 1024px)").matches) {
        setColumnCount(3);
        return;
      }

      if (window.matchMedia("(min-width: 640px)").matches) {
        setColumnCount(2);
        return;
      }

      setColumnCount(1);
    };

    updateColumnCount();
    window.addEventListener("resize", updateColumnCount);

    return () => window.removeEventListener("resize", updateColumnCount);
  }, []);

  return columnCount;
}

"use client";

import dynamic from "next/dynamic";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

import { CountryViewsSummary } from "@/components/country-views-summary";
import type { CountryView } from "@/lib/country-views";
import type { Region } from "@/lib/regions";

type Props = {
  regions: Region[];
  countries: CountryView[];
};

const EASE = [0.16, 1, 0.3, 1] as const;
const CONTENT_DELAY_MS = 260;

const HomeCountryViewsInteractive = dynamic(
  () =>
    import("@/components/home-country-views-interactive").then(
      (mod) => mod.HomeCountryViewsInteractive,
    ),
  {
    ssr: false,
    loading: () => <MapSkeleton />,
  },
);

export function HomeCountryViewsSection({ regions, countries }: Props) {
  const ref = useRef<HTMLElement | null>(null);
  const [inView, setInView] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const visible = Boolean(inView || prefersReducedMotion);
  const contentDelay =
    typeof window !== "undefined" && window.scrollY === 0
      ? CONTENT_DELAY_MS
      : 0;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      const frame = requestAnimationFrame(() => setInView(true));
      return () => cancelAnimationFrame(frame);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.15 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="border-t border-line py-[60px]">
      <motion.div
        className="reveal mb-7 text-center"
        initial={false}
        animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
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
        initial={false}
        animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
        transition={{
          duration: prefersReducedMotion ? 0 : 0.55,
          delay: prefersReducedMotion ? 0 : contentDelay / 1000,
          ease: EASE,
        }}
      >
        <CountryViewsSummary
          countries={countries}
          heading="Top countries by views"
          listLabel="Global country views ranking"
          limit={10}
        />
        {visible ? (
          <HomeCountryViewsInteractive
            regions={regions}
            countries={countries}
          />
        ) : (
          <MapSkeleton />
        )}
      </motion.div>
    </section>
  );
}

function MapSkeleton() {
  return (
    <div className="rounded-none border-0 bg-transparent p-0 backdrop-blur-none md:rounded-[var(--radius-lg)] md:border md:border-line md:bg-[rgb(12_10_8_/_0.65)] md:p-7 md:backdrop-blur-md">
      <div className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.8fr)] lg:items-stretch lg:gap-7">
        <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-3">
          {["Top country", "Total views", "Countries"].map((label) => (
            <div
              key={label}
              className="min-w-0 rounded-[var(--radius-md)] border border-line bg-[rgb(12_10_8_/_0.42)] px-4 py-[13px] backdrop-blur-md"
            >
              <div className="mb-2 h-3 w-20 rounded-sm bg-[rgb(255_255_255_/_0.08)]" />
              <div className="h-8 rounded-sm bg-[rgb(255_255_255_/_0.06)]" />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:h-full lg:w-full lg:grid-rows-2">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="h-[34px] rounded-[var(--radius-md)] border border-line-strong bg-[rgb(12_10_8_/_0.42)] py-2 backdrop-blur-md lg:h-full"
              data-testid="skeleton-filter"
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-7 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.8fr)]">
        <div className="h-[280px] rounded-[var(--radius-md)] border border-line bg-[rgb(12_10_8_/_0.42)] backdrop-blur-md md:h-[440px]" />
        <div>
          {Array.from({ length: 10 }).map((_, index) => (
            <div
              key={index}
              className="mb-1.5 h-10 rounded-[var(--radius-md)] border border-line bg-[rgb(12_10_8_/_0.42)] backdrop-blur-md md:h-[38.6px]"
              data-testid="skeleton-country-row"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

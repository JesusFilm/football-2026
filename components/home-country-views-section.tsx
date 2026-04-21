"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

import type { CountryView } from "@/lib/country-views";
import type { Region } from "@/lib/regions";

type Props = {
  regions: Region[];
  countries: CountryView[];
};

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
  const rootRef = useRef<HTMLElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || ready) return;
    if (typeof IntersectionObserver === "undefined") {
      const timeoutId = window.setTimeout(() => setReady(true), 0);
      return () => window.clearTimeout(timeoutId);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setReady(true);
          observer.disconnect();
        }
      },
      { rootMargin: "600px 0px" },
    );

    observer.observe(root);
    return () => observer.disconnect();
  }, [ready]);

  return (
    <section ref={rootRef} className="border-t border-line py-[60px]">
      <div className="mb-7 text-center">
        <span className="inline-block font-mono text-[11px] font-semibold tracking-[0.18em] text-accent uppercase">
          Global views
        </span>
        <h2 className="mt-2 mb-0 font-display text-[32px] font-bold tracking-[-0.01em]">
          Where The Story is Spreading
        </h2>
      </div>

      {ready ? (
        <HomeCountryViewsInteractive regions={regions} countries={countries} />
      ) : (
        <MapSkeleton />
      )}
    </section>
  );
}

function MapSkeleton() {
  return (
    <div className="rounded-[var(--radius-lg)] border border-line bg-[rgb(12_10_8_/_0.65)] p-5 backdrop-blur-md md:p-7">
      <div className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.8fr)] lg:items-stretch lg:gap-7">
        <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-3">
          {["Top country", "Total views", "Countries"].map((label) => (
            <div
              key={label}
              className="min-w-0 rounded-[var(--radius-md)] border border-line bg-[rgb(255_255_255_/_0.04)] px-4 py-[13px]"
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
              className="rounded-[var(--radius-md)] border border-line-strong bg-[rgb(255_255_255_/_0.04)] py-2 lg:h-full"
              data-testid="skeleton-filter"
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-7 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.8fr)]">
        <div className="h-[280px] rounded-[var(--radius-md)] border border-line bg-[rgb(255_255_255_/_0.035)] md:h-[440px]" />
        <div>
          {Array.from({ length: 10 }).map((_, index) => (
            <div
              key={index}
              className="mb-1.5 h-10 rounded-[var(--radius-md)] border border-line bg-[rgb(255_255_255_/_0.035)] md:h-[38.6px]"
              data-testid="skeleton-country-row"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

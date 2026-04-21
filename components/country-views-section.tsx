"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

import type { CountryView } from "@/lib/country-views";
import { REGIONS, type JsonbinRegionCode } from "@/lib/regions";

type Props = {
  regionName: string;
  regionCode: JsonbinRegionCode;
  countries: CountryView[];
  unavailable?: boolean;
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

export function CountryViewsSection({
  regionName,
  regionCode,
  countries,
  unavailable = false,
}: Props) {
  const rootRef = useRef<HTMLElement>(null);
  const [ready, setReady] = useState(false);
  const regionCountries = countries.filter(
    (country) => country.regionCode === regionCode,
  );

  useEffect(() => {
    const root = rootRef.current;
    if (!root || ready || unavailable || regionCountries.length === 0) return;
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
  }, [ready, regionCountries.length, unavailable]);

  return (
    <section ref={rootRef} className="border-t border-line py-[60px] pb-20">
      <div className="mb-7 text-center">
        <span className="inline-block font-mono text-[11px] font-semibold tracking-[0.18em] text-accent uppercase">
          World Cup 2026
        </span>
        <h2
          id="country-views-heading"
          className="mt-2 mb-0 font-display text-[32px] font-bold tracking-[-0.01em]"
        >
          Where The Story is Spreading
        </h2>
      </div>

      <div
        className="rounded-[var(--radius-lg)] border border-line bg-[rgb(12_10_8_/_0.65)] p-5 backdrop-blur-md md:p-7"
        aria-labelledby="country-views-heading"
      >
        {unavailable ? (
          <SectionState
            label="Views unavailable"
            body="Country view data could not be loaded right now."
          />
        ) : regionCountries.length === 0 ? (
          <SectionState
            label="No country views yet"
            body={`No country-level views are available for ${regionName} yet.`}
          />
        ) : ready ? (
          <HomeCountryViewsInteractive
            regions={REGIONS}
            initialSelection={regionCode}
            countries={countries}
          />
        ) : (
          <MapSkeleton />
        )}
      </div>
    </section>
  );
}

function SectionState({ label, body }: { label: string; body: string }) {
  return (
    <div className="p-8 text-center text-fg-dim">
      <p className="font-mono text-[11px] tracking-[0.16em] text-fg-mute uppercase">
        {label}
      </p>
      <p className="mx-auto mt-3 max-w-md text-sm">{body}</p>
    </div>
  );
}

function MapSkeleton() {
  return (
    <div>
      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {["Total views", "Countries", "Top country"].map((label) => (
          <div
            key={label}
            className="min-w-0 rounded-[var(--radius-md)] border border-line bg-[rgb(255_255_255_/_0.04)] px-4 py-3"
          >
            <div className="mb-2 h-3 w-20 rounded-sm bg-[rgb(255_255_255_/_0.08)]" />
            <div className="h-7 rounded-sm bg-[rgb(255_255_255_/_0.06)]" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-7 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.8fr)]">
        <div className="h-[280px] rounded-[var(--radius-md)] border border-line bg-[rgb(255_255_255_/_0.035)] md:h-[440px]" />
        <div>
          {Array.from({ length: 10 }).map((_, index) => (
            <div
              key={index}
              className="mb-1.5 h-10 rounded-[var(--radius-md)] border border-line bg-[rgb(255_255_255_/_0.035)] md:h-[38.6px]"
              data-testid="region-skeleton-country-row"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

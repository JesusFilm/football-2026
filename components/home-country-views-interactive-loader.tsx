"use client";

import { useEffect, useRef, useState } from "react";

import { MapSkeleton } from "@/components/map-skeleton";
import type { CountryView } from "@/lib/country-views";
import type { Region } from "@/lib/regions";

type HomeCountryViewsInteractiveComponent =
  typeof import("@/components/home-country-views-interactive").HomeCountryViewsInteractive;

type Props = {
  regions: Region[];
  countries: CountryView[];
};

export function HomeCountryViewsInteractiveLoader({
  regions,
  countries,
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [Interactive, setInteractive] =
    useState<HomeCountryViewsInteractiveComponent | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    let cancelled = false;
    const load = async () => {
      const mod = await import("@/components/home-country-views-interactive");
      if (!cancelled) setInteractive(() => mod.HomeCountryViewsInteractive);
    };

    if (typeof IntersectionObserver === "undefined") {
      void load();
      return () => {
        cancelled = true;
      };
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          observer.disconnect();
          void load();
        }
      },
      { rootMargin: "320px 0px", threshold: 0 },
    );

    observer.observe(element);
    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={ref}>
      {Interactive ? (
        <Interactive regions={regions} countries={countries} />
      ) : (
        <MapSkeleton />
      )}
    </div>
  );
}

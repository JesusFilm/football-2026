import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CountryViewsSection } from "@/components/country-views-section";
import { RegionSharePanel } from "@/components/region-share-panel";
import { RegionHero } from "@/components/region-hero";
import { RegionShareHeading } from "@/components/region-share-heading";
import { RegionStepCards } from "@/components/region-step-cards";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { StadiumBg } from "@/components/stadium-bg";
import {
  fetchCountryViews,
  filterCountryViewsByRegion,
} from "@/lib/country-views";
import { fetchJourneys } from "@/lib/journeys";
import { getRegion, REGIONS } from "@/lib/regions";

export async function generateStaticParams() {
  return REGIONS.map((r) => ({ id: r.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const region = getRegion(id);
  if (!region) {
    return { title: "Region" };
  }
  const title = `Activate ${region.name}`;
  const description = `${region.blurb} Share ready-to-use World Cup 2026 videos in your audience's heart language.`;
  const canonical = `/${region.id}`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      url: canonical,
      title,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

type Props = {
  params: Promise<{ id: string }>;
};

export default async function RegionPage({ params }: Props) {
  const { id } = await params;
  const region = getRegion(id);
  if (!region) notFound();

  const [journeys, countryViewsResult] = await Promise.all([
    fetchJourneys(region.teamId),
    fetchCountryViews(),
  ]);
  const countryViews =
    countryViewsResult.status === "available"
      ? filterCountryViewsByRegion(countryViewsResult.countries, region.code)
      : [];
  const allCountryViews =
    countryViewsResult.status === "available"
      ? countryViewsResult.countries
      : [];
  const countryCountLabel =
    countryViewsResult.status === "available"
      ? String(countryViews.length)
      : "-";

  return (
    <>
      <StadiumBg />
      <SiteHeader />

      <main className="mx-auto max-w-[1200px] px-5 sm:px-10">
        <RegionHero
          countryCountLabel={countryCountLabel}
          journeyCount={journeys.length}
          region={region}
        />

        <RegionStepCards />

        <RegionShareHeading />

        <RegionSharePanel
          key={region.id}
          regionCode={region.displayCode}
          journeys={journeys}
        />

        <div className="py-5 pb-10 text-center text-fg-mute">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            className="inline-block animate-bob"
          >
            <path d="M7 10l5 5 5-5M7 4l5 5 5-5" />
          </svg>
        </div>

        <CountryViewsSection
          regionName={region.name}
          regionCode={region.code}
          countries={allCountryViews}
          unavailable={countryViewsResult.status === "unavailable"}
        />
      </main>

      <SiteFooter />
    </>
  );
}

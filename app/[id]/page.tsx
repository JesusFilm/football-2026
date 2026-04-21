import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CountryViewsSection } from "@/components/country-views-section";
import { OtherRegionsNav } from "@/components/other-regions-nav";
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
import { getRegionById, REGIONS } from "@/lib/regions";
import { sharedOpenGraph, sharedTwitter, SITE_URL } from "@/lib/site";

export async function generateStaticParams() {
  return REGIONS.map((r) => ({ id: r.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const region = getRegionById(id);
  if (!region) {
    return { title: "Region" };
  }
  const title = `Activate ${region.name}`;
  const description = region.seoDescription;
  const canonical = `/${region.id}`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      ...sharedOpenGraph,
      url: canonical,
      title,
      description,
    },
    twitter: {
      ...sharedTwitter,
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
  const region = getRegionById(id);
  if (!region) notFound();

  const [journeysResult, countryViewsResult] = await Promise.allSettled([
    fetchJourneys(region.teamId),
    fetchCountryViews(),
  ]);
  const journeys =
    journeysResult.status === "fulfilled" ? journeysResult.value : [];
  const resolvedCountryViewsResult =
    countryViewsResult.status === "fulfilled"
      ? countryViewsResult.value
      : { status: "unavailable" as const, countries: [] };
  const countryViews =
    resolvedCountryViewsResult.status === "available"
      ? filterCountryViewsByRegion(
          resolvedCountryViewsResult.countries,
          region.code,
        )
      : [];
  const allCountryViews =
    resolvedCountryViewsResult.status === "available"
      ? resolvedCountryViewsResult.countries
      : [];
  const countryCountLabel =
    resolvedCountryViewsResult.status === "available"
      ? String(countryViews.length)
      : "-";
  const pageSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${SITE_URL}/${region.id}#webpage`,
        url: `${SITE_URL}/${region.id}`,
        name: `Activate ${region.name}`,
        description: region.seoDescription,
        isPartOf: {
          "@id": `${SITE_URL}/#website`,
        },
        breadcrumb: {
          "@id": `${SITE_URL}/${region.id}#breadcrumb`,
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${SITE_URL}/${region.id}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "All regions",
            item: SITE_URL,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: region.name,
            item: `${SITE_URL}/${region.id}`,
          },
        ],
      },
    ],
  };

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
          unavailable={resolvedCountryViewsResult.status === "unavailable"}
        />

        <OtherRegionsNav currentRegionId={region.id} regions={REGIONS} />
      </main>

      <SiteFooter />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(pageSchema),
        }}
      />
    </>
  );
}

import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { CountryViewsSection } from "@/components/country-views-section";
import { OtherRegionsNav } from "@/components/other-regions-nav";
import { RegionSharePanel } from "@/components/region-share-panel";
import { RegionHero } from "@/components/region-hero";
import { RegionStepCards } from "@/components/region-step-cards";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { StadiumBg } from "@/components/stadium-bg";
import {
  fetchCountryViews,
  filterCountryViewsByRegion,
} from "@/lib/country-views";
import { getLocaleOption, type Locale } from "@/i18n/routing";
import { fetchJourneys } from "@/lib/journeys";
import {
  getLocalizedRegion,
  getLocalizedRegions,
} from "@/lib/localized-regions";
import { REGIONS } from "@/lib/regions";
import { getLocalePath, getLocalizedAlternates } from "@/lib/url-utils";
import { sharedOpenGraph, sharedTwitter, SITE_URL } from "@/lib/site";

export async function generateStaticParams() {
  return REGIONS.map((r) => ({ id: r.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; id: string }>;
}): Promise<Metadata> {
  const { locale, id } = await params;
  const region = await getLocalizedRegion(locale, id);
  if (!region) {
    const t = await getTranslations({ locale, namespace: "Metadata" });
    return { title: t("fallbackRegionTitle") };
  }
  const t = await getTranslations({ locale, namespace: "Metadata" });
  const option = getLocaleOption(locale);
  const title = t("regionTitle", { regionName: region.name });
  const description = region.seoDescription;
  const canonical = getLocalePath(locale, `/${region.id}`);
  return {
    title,
    description,
    alternates: {
      canonical,
      languages: getLocalizedAlternates(`/${region.id}`),
    },
    openGraph: {
      ...sharedOpenGraph(locale, t("socialAlt"), t("siteName")),
      locale: option.openGraphLocale,
      url: canonical,
      title,
      description,
    },
    twitter: {
      ...sharedTwitter(locale),
      title,
      description,
    },
  };
}

type Props = {
  params: Promise<{ locale: Locale; id: string }>;
};

export const dynamic = "force-dynamic";

export default async function RegionPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const [region, regions, metadataT] = await Promise.all([
    getLocalizedRegion(locale, id),
    getLocalizedRegions(locale),
    getTranslations({ locale, namespace: "Metadata" }),
  ]);
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
        "@id": `${SITE_URL}${getLocalePath(locale, `/${region.id}`)}#webpage`,
        url: `${SITE_URL}${getLocalePath(locale, `/${region.id}`)}`,
        name: metadataT("regionTitle", { regionName: region.name }),
        description: region.seoDescription,
        isPartOf: {
          "@id": `${SITE_URL}/#website`,
        },
        breadcrumb: {
          "@id": `${SITE_URL}${getLocalePath(locale, `/${region.id}`)}#breadcrumb`,
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${SITE_URL}${getLocalePath(locale, `/${region.id}`)}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: metadataT("breadcrumbAllRegions"),
            item: `${SITE_URL}${getLocalePath(locale)}`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: region.name,
            item: `${SITE_URL}${getLocalePath(locale, `/${region.id}`)}`,
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

        <OtherRegionsNav currentRegionId={region.id} regions={regions} />
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

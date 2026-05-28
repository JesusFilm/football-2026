import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { HomeCountryViewsSection } from "@/components/home-country-views-section";
import { HomeHero } from "@/components/home-hero";
import { HomeLaunchEvent } from "@/components/home-launch-event";
import { HomeLaunchVideo } from "@/components/home-launch-video";
import { HomeJourneyCollection } from "@/components/home-journey-collection";
import { HomeRegionGrid } from "@/components/home-region-grid";
import { HomeRegionHeading } from "@/components/home-region-heading";
import { HomeVideoCollection } from "@/components/home-video-collection";
import { SectionChevron } from "@/components/section-chevron";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { StadiumBg } from "@/components/stadium-bg";
import type { Locale } from "@/i18n/routing";
import {
  fetchAllCountryViews,
  fetchAllCountryViewsFromJsonBin,
} from "@/lib/country-views";
import { getLocalizedRegions } from "@/lib/localized-regions";
import type { Region } from "@/lib/regions";
import { SITE_URL } from "@/lib/site";

type Props = {
  params: Promise<{ locale: Locale }>;
};

export const dynamic = "force-dynamic";

export default async function Home({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [regions, metadataT] = await Promise.all([
    getLocalizedRegions(locale),
    getTranslations({ locale, namespace: "Metadata" }),
  ]);
  const pageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${SITE_URL}${locale === "en" ? "" : `/${locale}`}#webpage`,
    url: `${SITE_URL}${locale === "en" ? "" : `/${locale}`}`,
    name: metadataT("homeSchemaName"),
    description: metadataT("defaultDescription"),
    isPartOf: {
      "@id": `${SITE_URL}/#website`,
    },
  };

  return (
    <>
      <StadiumBg />
      <SiteHeader />
      <main className="mx-auto max-w-[1200px] px-5 sm:px-10">
        <HomeHero />
        <HomeRegionHeading />
        <HomeRegionGrid regions={regions} />
        <HomeLaunchEvent />
        <HomeLaunchVideo />
        <HomeVideoCollection />
        <HomeJourneyCollection />

        <Suspense>
          <HomeCountryViewsStream regions={regions} />
        </Suspense>
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

async function HomeCountryViewsStream({ regions }: { regions: Region[] }) {
  const [jsonbinResult, plausibleResult] = await Promise.allSettled([
    fetchAllCountryViewsFromJsonBin(),
    fetchAllCountryViews(),
  ]);
  const jsonbinCountries =
    jsonbinResult.status === "fulfilled" &&
    jsonbinResult.value.status === "available"
      ? jsonbinResult.value.countries
      : [];
  const plausibleCountries =
    plausibleResult.status === "fulfilled" &&
    plausibleResult.value.status === "available"
      ? plausibleResult.value.countries
      : [];

  if (jsonbinCountries.length === 0 && plausibleCountries.length === 0)
    return null;

  return (
    <>
      <SectionChevron />
      <HomeCountryViewsSection
        regions={regions}
        jsonbinCountries={jsonbinCountries}
        plausibleCountries={plausibleCountries}
      />
    </>
  );
}

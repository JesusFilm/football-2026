import { getTranslations, setRequestLocale } from "next-intl/server";

import { HomeCountryViewsSection } from "@/components/home-country-views-section";
import { HomeHero } from "@/components/home-hero";
import { HomeRegionGrid } from "@/components/home-region-grid";
import { HomeRegionHeading } from "@/components/home-region-heading";
import { HomeStepCards } from "@/components/home-step-cards";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { StadiumBg } from "@/components/stadium-bg";
import type { Locale } from "@/i18n/routing";
import { fetchCountryViews } from "@/lib/country-views";
import { getLocalizedRegions } from "@/lib/localized-regions";
import { SITE_URL } from "@/lib/site";

type Props = {
  params: Promise<{ locale: Locale }>;
};

export default async function Home({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [countryViews, regions, metadataT] = await Promise.all([
    fetchCountryViews(),
    getLocalizedRegions(locale),
    getTranslations({ locale, namespace: "Metadata" }),
  ]);
  const countries =
    countryViews.status === "available" ? countryViews.countries : [];
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
        <HomeStepCards />
        <HomeRegionHeading />
        <HomeRegionGrid regions={regions} />

        {countryViews.status === "available" && (
          <HomeCountryViewsSection regions={regions} countries={countries} />
        )}
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

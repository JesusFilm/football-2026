import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { HomeJourneyCollection } from "@/components/home-journey-collection";
import { HomeTeamTidyUpSection } from "@/components/home-teamtidyup-section";
import { HomeVideoCollection } from "@/components/home-video-collection";
import { HomeWatchPartySection } from "@/components/home-watchparty-section";
import { HomeYouVersionCollection } from "@/components/home-youversion-collection";
import { ResourceCategorySection } from "@/components/resource-category";
import { ResourcesHero } from "@/components/resources-hero";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { StadiumBg } from "@/components/stadium-bg";
import { getLocaleOption, type Locale } from "@/i18n/routing";
import { RESOURCE_CATEGORIES_IN_ORDER } from "@/lib/resources";
import { sharedOpenGraph, sharedTwitter, SITE_URL } from "@/lib/site";
import { getLocalePath, getLocalizedAlternates } from "@/lib/url-utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  const option = getLocaleOption(locale);
  const title = t("resourcesTitle");
  const description = t("resourcesDescription");
  const canonical = getLocalePath(locale, "/resources");
  return {
    title,
    description,
    alternates: {
      canonical,
      languages: getLocalizedAlternates("/resources"),
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
  params: Promise<{ locale: Locale }>;
};

export default async function ResourcesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const metadataT = await getTranslations({ locale, namespace: "Metadata" });

  const pageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${SITE_URL}${getLocalePath(locale, "/resources")}#webpage`,
    url: `${SITE_URL}${getLocalePath(locale, "/resources")}`,
    name: metadataT("resourcesSchemaName"),
    description: metadataT("resourcesDescription"),
    isPartOf: {
      "@id": `${SITE_URL}/#website`,
    },
  };

  return (
    <>
      <StadiumBg />
      <SiteHeader />

      <main className="mx-auto max-w-[1200px] px-5 sm:px-10">
        <ResourcesHero />
        <HomeTeamTidyUpSection />

        <HomeVideoCollection />
        <HomeJourneyCollection />
        <HomeYouVersionCollection />
        <HomeWatchPartySection />

        {RESOURCE_CATEGORIES_IN_ORDER.map((category) => (
          <ResourceCategorySection key={category} category={category} />
        ))}
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

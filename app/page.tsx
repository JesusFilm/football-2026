import { HomeCountryViewsSection } from "@/components/home-country-views-section";
import { HomeHero } from "@/components/home-hero";
import { HomeRegionGrid } from "@/components/home-region-grid";
import { HomeRegionHeading } from "@/components/home-region-heading";
import { HomeStepCards } from "@/components/home-step-cards";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { StadiumBg } from "@/components/stadium-bg";
import { fetchCountryViews } from "@/lib/country-views";
import { REGIONS } from "@/lib/regions";

export default async function Home() {
  const countryViews = await fetchCountryViews();
  const countries =
    countryViews.status === "available" ? countryViews.countries : [];

  return (
    <>
      <StadiumBg />
      <SiteHeader />
      <main className="mx-auto max-w-[1200px] px-5 sm:px-10">
        <HomeHero />
        <HomeStepCards />
        <HomeRegionHeading />
        <HomeRegionGrid regions={REGIONS} />

        {countryViews.status === "available" && (
          <HomeCountryViewsSection regions={REGIONS} countries={countries} />
        )}
      </main>
      <SiteFooter />
    </>
  );
}

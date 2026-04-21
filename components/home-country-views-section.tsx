import { HomeCountryViewsReveal } from "@/components/home-country-views-reveal";
import { HomeCountryViewsInteractiveLoader } from "@/components/home-country-views-interactive-loader";
import { CountryViewsSummary } from "@/components/country-views-summary";
import type { CountryView } from "@/lib/country-views";
import type { Region } from "@/lib/regions";

type Props = {
  regions: Region[];
  countries: CountryView[];
};

export function HomeCountryViewsSection({ regions, countries }: Props) {
  return (
    <HomeCountryViewsReveal
      summary={
        <CountryViewsSummary
          countries={countries}
          heading="Top countries by views"
          listLabel="Global country views ranking"
          limit={10}
        />
      }
      interactive={
        <HomeCountryViewsInteractiveLoader
          regions={regions}
          countries={countries}
        />
      }
    />
  );
}

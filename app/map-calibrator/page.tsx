import { MapCalibrator } from "@/components/map-calibrator";
import {
  fetchCountryViews,
  filterCountryViewsByRegion,
} from "@/lib/country-views";
import { REGIONS } from "@/lib/regions";

export const metadata = {
  title: "Map Calibrator",
};

export default async function MapCalibratorPage() {
  const countryViews = await fetchCountryViews();
  const countries =
    countryViews.status === "available" ? countryViews.countries : [];

  const regionCountries = REGIONS.flatMap((region) =>
    filterCountryViewsByRegion(countries, region.code),
  );

  return <MapCalibrator regions={REGIONS} countries={regionCountries} />;
}

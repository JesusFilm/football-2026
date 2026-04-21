import {
  regions as worldMapRegions,
  type DataItem,
  type ISOCode,
} from "react-svg-worldmap";

import type { CountryView } from "@/lib/country-views";

export const supportedCountryCodes = new Set(
  worldMapRegions.map((region) => region.code.toUpperCase()),
);

export function formatViews(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

export function viewIntensity(value: number, maxValue: number): number {
  if (value <= 0 || maxValue <= 0) return 0;
  return Math.log1p(value) / Math.log1p(maxValue);
}

export function countryFill(value: number, maxValue: number) {
  const intensity = viewIntensity(value, maxValue);
  if (intensity === 0) return "rgba(245, 241, 232, 0.1)";

  const opacity = 0.24 + intensity * 0.76;
  return `rgba(230, 57, 70, ${opacity.toFixed(2)})`;
}

export function toMapData(countries: CountryView[]): DataItem<number>[] {
  return countries
    .filter(
      (country) =>
        country.countryCode && supportedCountryCodes.has(country.countryCode),
    )
    .map((country) => ({
      country: country.countryCode!.toLowerCase() as ISOCode,
      value: country.journeyViews,
    }));
}

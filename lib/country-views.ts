import { unstable_cache } from "next/cache";

import type { JsonbinRegionCode } from "@/lib/regions";
import { resolveCountryCodeFromName } from "@/lib/country-display";

const JSONBIN_COUNTRY_VIEWS_URL =
  "https://api.jsonbin.io/v3/b/69d452a936566621a8867f6b?meta=false";

const REAL_LIST_ONLY_COUNTRIES = new Set(["Kosovo"]);
const NON_COUNTRY_NAMES = new Set(["Error", "Unknown"]);

type RawCountryViewsResponse = {
  data?: unknown;
};

type RawCountryViewsRow = {
  "prod_geo[country_name]"?: unknown;
  "prod_geo[cru_global_region]"?: unknown;
  "prod_geo[iso3_2]"?: unknown;
  "[JourneyViews]"?: unknown;
};

export type CountryView = {
  countryName: string;
  sourceCountryName?: string;
  regionCode: string;
  countryCode?: string;
  journeyViews: number;
};

export type CountryViewsResult =
  | {
      status: "available";
      countries: CountryView[];
    }
  | {
      status: "unavailable";
      countries: [];
    };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function normalizeViews(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.max(0, Math.trunc(value));
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return Math.max(0, Math.trunc(parsed));
  }
  return 0;
}

function normalizeCountryCode(value: unknown): string | undefined {
  const code = normalizeString(value)?.toUpperCase();
  return code && /^[A-Z]{2}$/.test(code) ? code : undefined;
}

export function normalizeCountryViewsRows(rows: unknown): CountryView[] {
  if (!Array.isArray(rows)) return [];

  return rows
    .map((row): CountryView | null => {
      if (!isRecord(row)) return null;
      const raw = row as RawCountryViewsRow;
      const countryName = normalizeString(raw["prod_geo[country_name]"]);
      const regionCode = normalizeString(raw["prod_geo[cru_global_region]"]);

      if (!countryName || !regionCode) return null;
      if (NON_COUNTRY_NAMES.has(countryName)) return null;

      const countryCode =
        normalizeCountryCode(raw["prod_geo[iso3_2]"]) ??
        resolveCountryCodeFromName(countryName);
      if (!countryCode && !REAL_LIST_ONLY_COUNTRIES.has(countryName)) {
        return null;
      }

      return {
        countryName,
        sourceCountryName: countryName,
        regionCode,
        countryCode,
        journeyViews: normalizeViews(raw["[JourneyViews]"]),
      };
    })
    .filter((row): row is CountryView => row !== null)
    .sort(
      (a, b) =>
        b.journeyViews - a.journeyViews ||
        a.countryName.localeCompare(b.countryName),
    );
}

export function filterCountryViewsByRegion(
  countries: CountryView[],
  regionCode: JsonbinRegionCode,
): CountryView[] {
  return countries.filter((country) => country.regionCode === regionCode);
}

async function fetchFreshCountryViews(): Promise<CountryView[]> {
  const res = await fetch(JSONBIN_COUNTRY_VIEWS_URL, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`JSONBin country views request failed: ${res.status}`);
  }

  const json = (await res.json()) as RawCountryViewsResponse;
  if (!Array.isArray(json.data)) {
    throw new Error("JSONBin country views response is missing data rows");
  }

  return normalizeCountryViewsRows(json.data);
}

const getCachedCountryViews = unstable_cache(
  fetchFreshCountryViews,
  ["country-views"],
  {
    revalidate: 3600,
    tags: ["country-views"],
  },
);

export async function fetchCountryViews(): Promise<CountryViewsResult> {
  try {
    const countries = await getCachedCountryViews();
    return { status: "available", countries };
  } catch {
    return { status: "unavailable", countries: [] };
  }
}

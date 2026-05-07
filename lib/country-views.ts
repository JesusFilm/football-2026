import { unstable_cache } from "next/cache";

import { REGIONS, type JsonbinRegionCode } from "@/lib/regions";

const GRAPHQL_ENDPOINT =
  process.env.GRAPHQL_ENDPOINT ?? "https://api-gateway.central.jesusfilm.org";
const PLAUSIBLE_URL = process.env.PLAUSIBLE_URL ?? "https://plausible.io";

const CAMPAIGN_DATE_RANGE = "2024-01-01,2026-12-31";

const JOURNEY_IDS_QUERY = /* GraphQL */ `
  query GetJourneyIds($teamId: String!) {
    journeys(where: { teamId: $teamId, template: false }) {
      id
    }
  }
`;

export type CountryView = {
  countryName: string;
  regionCode: string;
  countryCode: string;
  journeyViews: number;
};

export type CountryViewsResult =
  | { status: "available"; countries: CountryView[] }
  | { status: "unavailable"; countries: [] };

async function fetchJourneyIds(teamId: string): Promise<string[]> {
  const res = await fetch(GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: JOURNEY_IDS_QUERY,
      variables: { teamId },
    }),
    next: { revalidate: 3600, tags: [`journey-ids:${teamId}`] },
  });
  if (!res.ok) throw new Error(`Journey IDs request failed: ${res.status}`);
  const json = (await res.json()) as {
    data?: { journeys: { id: string }[] };
    errors?: { message: string }[];
  };
  if (json.errors?.length) {
    throw new Error(
      `Journey IDs query errors: ${json.errors.map((e) => e.message).join("; ")}`,
    );
  }
  return (json.data?.journeys ?? []).map((j) => j.id);
}

async function fetchJourneyCountryBreakdown(
  journeyId: string,
): Promise<Array<{ countryCode: string; visitors: number }>> {
  const apiKey = process.env.PLAUSIBLE_API_KEY;
  if (!apiKey) throw new Error("PLAUSIBLE_API_KEY is not set");

  const url = new URL(`${PLAUSIBLE_URL}/api/v1/stats/breakdown`);
  url.searchParams.set("site_id", `api-journeys-journey-${journeyId}`);
  url.searchParams.set("property", "visit:country");
  url.searchParams.set("period", "custom");
  url.searchParams.set("date", CAMPAIGN_DATE_RANGE);
  url.searchParams.set("metrics", "pageviews");
  url.searchParams.set("limit", "1000");

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${apiKey}` },
    next: { revalidate: 3600, tags: [`plausible-country:${journeyId}`] },
  });
  if (!res.ok) return [];

  const json = (await res.json()) as {
    results?: Array<{ country: string; pageviews: number }>;
  };
  return (json.results ?? [])
    .filter((r) => /^[A-Z]{2}$/.test(r.country ?? ""))
    .map((r) => ({ countryCode: r.country, views: r.pageviews }));
}

function mergeCountryBreakdowns(
  breakdowns: Array<Array<{ countryCode: string; views: number }>>,
): Array<{ countryCode: string; views: number }> {
  const merged = new Map<string, number>();
  for (const breakdown of breakdowns) {
    for (const { countryCode, views } of breakdown) {
      merged.set(countryCode, (merged.get(countryCode) ?? 0) + views);
    }
  }
  return Array.from(merged.entries())
    .map(([countryCode, views]) => ({ countryCode, views }))
    .sort((a, b) => b.views - a.views);
}

async function fetchFreshCountryViews(
  teamId: string,
  regionCode: JsonbinRegionCode,
): Promise<CountryView[]> {
  const journeyIds = await fetchJourneyIds(teamId);
  if (journeyIds.length === 0) return [];

  const breakdowns = await Promise.all(
    journeyIds.map(fetchJourneyCountryBreakdown),
  );
  const merged = mergeCountryBreakdowns(breakdowns);

  const displayNames = new Intl.DisplayNames(["en"], { type: "region" });
  return merged.map(({ countryCode, views }) => ({
    countryCode,
    countryName: displayNames.of(countryCode) ?? countryCode,
    regionCode,
    journeyViews: views,
  }));
}

const getCachedCountryViews = unstable_cache(
  fetchFreshCountryViews,
  ["country-views"],
  { revalidate: 3600, tags: ["country-views"] },
);

export async function fetchCountryViews(
  teamId: string,
  regionCode: JsonbinRegionCode,
): Promise<CountryViewsResult> {
  try {
    const countries = await getCachedCountryViews(teamId, regionCode);
    return { status: "available", countries };
  } catch {
    return { status: "unavailable", countries: [] };
  }
}

export async function fetchAllCountryViews(): Promise<CountryViewsResult> {
  const results = await Promise.allSettled(
    REGIONS.map((region) => getCachedCountryViews(region.teamId, region.code)),
  );
  const countries = results
    .filter(
      (r): r is PromiseFulfilledResult<CountryView[]> =>
        r.status === "fulfilled",
    )
    .flatMap((r) => r.value)
    .sort((a, b) => b.journeyViews - a.journeyViews);

  return countries.length > 0
    ? { status: "available", countries }
    : { status: "unavailable", countries: [] };
}

export function filterCountryViewsByRegion(
  countries: CountryView[],
  regionCode: JsonbinRegionCode,
): CountryView[] {
  return countries.filter((country) => country.regionCode === regionCode);
}

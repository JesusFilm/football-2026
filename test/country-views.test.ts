import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({
  unstable_cache: <T extends (...args: never[]) => Promise<unknown>>(cb: T) =>
    cb,
}));

import {
  fetchCountryViews,
  filterCountryViewsByRegion,
} from "@/lib/country-views";

type FetchMock = ReturnType<typeof vi.fn>;

function mockFetch(
  ...responses: { body: unknown; status?: number }[]
): FetchMock {
  const fn = vi.fn();
  for (const { body, status = 200 } of responses) {
    fn.mockResolvedValueOnce(
      new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json" },
      }),
    );
  }
  vi.stubGlobal("fetch", fn);
  return fn;
}

const JOURNEY_IDS_RESPONSE = (ids: string[]) => ({
  data: { journeys: ids.map((id) => ({ id })) },
});

const PLAUSIBLE_RESPONSE = (
  results: { country: string; pageviews: number }[],
) => ({ results });

describe("filterCountryViewsByRegion", () => {
  it("filters countries by region code", () => {
    const countries = [
      {
        countryName: "United States",
        regionCode: "NAmOceania",
        countryCode: "US",
        journeyViews: 170768,
      },
      {
        countryName: "Mexico",
        regionCode: "LAC",
        countryCode: "MX",
        journeyViews: 24029,
      },
    ];

    expect(
      filterCountryViewsByRegion(countries, "NAmOceania").map(
        (c) => c.countryName,
      ),
    ).toEqual(["United States"]);
    expect(
      filterCountryViewsByRegion(countries, "LAC").map((c) => c.countryName),
    ).toEqual(["Mexico"]);
  });
});

describe("fetchCountryViews", () => {
  const TEAM_ID = "team-abc";

  beforeEach(() => {
    vi.unstubAllGlobals();
    process.env.PLAUSIBLE_API_KEY = "test-key";
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.PLAUSIBLE_API_KEY;
  });

  it("fetches journey IDs then aggregates Plausible country breakdown", async () => {
    mockFetch(
      { body: JOURNEY_IDS_RESPONSE(["journey-1", "journey-2"]) },
      {
        body: PLAUSIBLE_RESPONSE([
          { country: "US", pageviews: 10 },
          { country: "CA", pageviews: 4 },
        ]),
      },
      {
        body: PLAUSIBLE_RESPONSE([
          { country: "US", pageviews: 5 },
          { country: "NZ", pageviews: 12 },
        ]),
      },
    );

    const result = await fetchCountryViews(TEAM_ID, "NAmOceania");

    expect(result.status).toBe("available");
    if (result.status !== "available") return;
    expect(result.countries).toEqual([
      expect.objectContaining({
        countryCode: "US",
        journeyViews: 15,
        regionCode: "NAmOceania",
      }),
      expect.objectContaining({
        countryCode: "NZ",
        journeyViews: 12,
        regionCode: "NAmOceania",
      }),
      expect.objectContaining({
        countryCode: "CA",
        journeyViews: 4,
        regionCode: "NAmOceania",
      }),
    ]);
  });

  it("returns available with empty list when team has no journeys", async () => {
    mockFetch({ body: JOURNEY_IDS_RESPONSE([]) });

    const result = await fetchCountryViews(TEAM_ID, "Africa");

    expect(result).toEqual({ status: "available", countries: [] });
  });

  it("sets countryName from Intl.DisplayNames", async () => {
    mockFetch(
      { body: JOURNEY_IDS_RESPONSE(["journey-1"]) },
      { body: PLAUSIBLE_RESPONSE([{ country: "JP", pageviews: 500 }]) },
    );

    const result = await fetchCountryViews(TEAM_ID, "East Asia");

    expect(result.status).toBe("available");
    if (result.status !== "available") return;
    expect(result.countries[0]?.countryName).toBe("Japan");
  });

  it("skips Plausible results with invalid country codes", async () => {
    mockFetch(
      { body: JOURNEY_IDS_RESPONSE(["journey-1"]) },
      {
        body: PLAUSIBLE_RESPONSE([
          { country: "US", pageviews: 10 },
          { country: "Unknown", pageviews: 5 },
        ]),
      },
    );

    const result = await fetchCountryViews(TEAM_ID, "NAmOceania");

    expect(result.status).toBe("available");
    if (result.status !== "available") return;
    expect(result.countries).toHaveLength(1);
    expect(result.countries[0]?.countryCode).toBe("US");
  });

  it("returns unavailable when journey IDs request fails", async () => {
    mockFetch({ body: { message: "bad" }, status: 500 });

    const result = await fetchCountryViews(TEAM_ID, "Europe");

    expect(result).toEqual({ status: "unavailable", countries: [] });
  });

  it("returns unavailable when PLAUSIBLE_API_KEY is not set", async () => {
    delete process.env.PLAUSIBLE_API_KEY;
    mockFetch({ body: JOURNEY_IDS_RESPONSE(["journey-1"]) });

    const result = await fetchCountryViews(TEAM_ID, "Europe");

    expect(result).toEqual({ status: "unavailable", countries: [] });
  });

  it("returns unavailable on network error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));

    const result = await fetchCountryViews(TEAM_ID, "LAC");

    expect(result).toEqual({ status: "unavailable", countries: [] });
  });

  it("skips failed Plausible calls and returns data from successful ones", async () => {
    mockFetch(
      { body: JOURNEY_IDS_RESPONSE(["journey-1", "journey-2"]) },
      { body: { error: "not found" }, status: 404 },
      { body: PLAUSIBLE_RESPONSE([{ country: "BR", pageviews: 20 }]) },
    );

    const result = await fetchCountryViews(TEAM_ID, "LAC");

    expect(result.status).toBe("available");
    if (result.status !== "available") return;
    expect(result.countries).toHaveLength(1);
    expect(result.countries[0]?.countryCode).toBe("BR");
  });
});

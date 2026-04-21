import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  fetchCountryViews,
  filterCountryViewsByRegion,
  normalizeCountryViewsRows,
} from "@/lib/country-views";

type FetchMock = ReturnType<typeof vi.fn>;

function mockFetchResponse(body: unknown, status = 200): FetchMock {
  const res = new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
  const fn = vi.fn().mockResolvedValue(res);
  vi.stubGlobal("fetch", fn);
  return fn;
}

describe("normalizeCountryViewsRows", () => {
  it("normalizes valid JSONBin rows and sorts by journey views", () => {
    const countries = normalizeCountryViewsRows([
      {
        "prod_geo[country_name]": "Canada",
        "prod_geo[cru_global_region]": "NAmOceania",
        "prod_geo[iso3_2]": "ca",
        "[JourneyViews]": "10",
      },
      {
        "prod_geo[country_name]": "United States",
        "prod_geo[cru_global_region]": "NAmOceania",
        "prod_geo[iso3_2]": "US",
        "[JourneyViews]": 170768,
      },
    ]);

    expect(countries).toEqual([
      {
        countryName: "United States",
        regionCode: "NAmOceania",
        countryCode: "US",
        journeyViews: 170768,
      },
      {
        countryName: "Canada",
        regionCode: "NAmOceania",
        countryCode: "CA",
        journeyViews: 10,
      },
    ]);
  });

  it("filters aggregate rows and non-country artifacts", () => {
    const countries = normalizeCountryViewsRows([
      { "[JourneyViews]": 199209 },
      {
        "prod_geo[country_name]": "Error",
        "prod_geo[cru_global_region]": "Other/Unknown",
        "[JourneyViews]": 0,
      },
      {
        "prod_geo[country_name]": "Unknown",
        "prod_geo[cru_global_region]": "Other/Unknown",
        "[JourneyViews]": 0,
      },
      {
        "prod_geo[country_name]": "Mexico",
        "prod_geo[cru_global_region]": "LAC",
        "prod_geo[iso3_2]": "MX",
        "[JourneyViews]": 24029,
      },
    ]);

    expect(countries).toHaveLength(1);
    expect(countries[0]?.countryName).toBe("Mexico");
  });

  it("keeps real list-only countries without a map code", () => {
    const countries = normalizeCountryViewsRows([
      {
        "prod_geo[country_name]": "Kosovo",
        "prod_geo[cru_global_region]": "Europe",
        "[JourneyViews]": 0,
      },
      {
        "prod_geo[country_name]": "Antarctica",
        "prod_geo[cru_global_region]": "Other/Unknown",
        "[JourneyViews]": 0,
      },
    ]);

    expect(countries).toEqual([
      {
        countryName: "Kosovo",
        regionCode: "Europe",
        journeyViews: 0,
      },
    ]);
  });
});

describe("filterCountryViewsByRegion", () => {
  it("uses JSONBin region labels for membership", () => {
    const countries = normalizeCountryViewsRows([
      {
        "prod_geo[country_name]": "United States",
        "prod_geo[cru_global_region]": "NAmOceania",
        "prod_geo[iso3_2]": "US",
        "[JourneyViews]": 170768,
      },
      {
        "prod_geo[country_name]": "Mexico",
        "prod_geo[cru_global_region]": "LAC",
        "prod_geo[iso3_2]": "MX",
        "[JourneyViews]": 24029,
      },
    ]);

    expect(
      filterCountryViewsByRegion(countries, "NAmOceania").map(
        (country) => country.countryName,
      ),
    ).toEqual(["United States"]);
    expect(
      filterCountryViewsByRegion(countries, "LAC").map(
        (country) => country.countryName,
      ),
    ).toEqual(["Mexico"]);
  });
});

describe("fetchCountryViews", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("fetches and normalizes country views", async () => {
    const fetchMock = mockFetchResponse({
      data: [
        {
          "prod_geo[country_name]": "Japan",
          "prod_geo[cru_global_region]": "East Asia",
          "prod_geo[iso3_2]": "JP",
          "[JourneyViews]": 4639,
        },
      ],
    });

    await expect(fetchCountryViews()).resolves.toEqual({
      status: "available",
      countries: [
        {
          countryName: "Japan",
          regionCode: "East Asia",
          countryCode: "JP",
          journeyViews: 4639,
        },
      ],
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.jsonbin.io/v3/b/69d452a936566621a8867f6b?meta=false",
      {
        next: {
          revalidate: 3600,
          tags: ["country-views"],
        },
      },
    );
  });

  it("returns unavailable for non-OK responses", async () => {
    mockFetchResponse({ message: "bad" }, 500);

    await expect(fetchCountryViews()).resolves.toEqual({
      status: "unavailable",
      countries: [],
    });
  });

  it("returns unavailable for malformed responses", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));

    await expect(fetchCountryViews()).resolves.toEqual({
      status: "unavailable",
      countries: [],
    });
  });
});

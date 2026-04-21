import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import RegionPage from "@/app/[id]/page";
import { fetchCountryViews } from "@/lib/country-views";
import type { CountryView } from "@/lib/country-views";
import { fetchJourneys } from "@/lib/journeys";

vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("not found");
  },
}));

vi.mock("@/components/stadium-bg", () => ({
  StadiumBg: () => <div data-testid="stadium-bg" />,
}));

vi.mock("@/components/site-header", () => ({
  SiteHeader: () => <header data-testid="site-header" />,
}));

vi.mock("@/components/site-footer", () => ({
  SiteFooter: () => <footer data-testid="site-footer" />,
}));

vi.mock("@/components/region-share-panel", () => ({
  RegionSharePanel: ({
    regionCode,
    journeys,
  }: {
    regionCode: string;
    journeys: unknown[];
  }) => (
    <div data-testid="share-panel">
      {regionCode}:{journeys.length}
    </div>
  ),
}));

vi.mock("@/components/country-views-section", () => ({
  CountryViewsSection: ({
    regionName,
    regionCode,
    countries,
    unavailable,
  }: {
    regionName: string;
    regionCode: string;
    countries: CountryView[];
    unavailable?: boolean;
  }) => (
    <section data-testid="country-views-section">
      {regionName}:{regionCode}:
      {countries.map((country) => country.countryName).join(",")}:
      {String(Boolean(unavailable))}
    </section>
  ),
}));

vi.mock("@/components/other-regions-nav", () => ({
  OtherRegionsNav: () => <nav data-testid="other-regions-nav" />,
}));

vi.mock("@/lib/journeys", () => ({
  fetchJourneys: vi.fn(async () => [
    {
      slug: "where-you-belong",
      language: { id: "529", english: "English" },
    },
  ]),
}));

vi.mock("@/lib/country-views", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/country-views")>();

  return {
    ...actual,
    fetchCountryViews: vi.fn(async () => ({
      status: "available",
      countries: [
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
      ],
    })),
  };
});

describe("RegionPage country views integration", () => {
  beforeEach(() => {
    class MockIntersectionObserver {
      observe = vi.fn(() => {
        this.callback([{ isIntersecting: true }]);
      });
      disconnect = vi.fn();
      unobserve = vi.fn();

      constructor(
        private callback: (entries: { isIntersecting: boolean }[]) => void,
      ) {}
    }

    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.mocked(fetchCountryViews).mockClear();
    vi.mocked(fetchJourneys).mockClear();
  });

  it("passes all country views to the shared map while counting the active region", async () => {
    const ui = await RegionPage({ params: Promise.resolve({ id: "nao" }) });
    render(ui);

    expect(screen.getByTestId("share-panel")).toHaveTextContent("NAO:1");
    expect(screen.getAllByText("1").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByTestId("country-views-section")).toHaveTextContent(
      "North America & Oceania:NAmOceania:United States,Mexico:false",
    );
  });

  it("keeps the region page renderable when journeys fail", async () => {
    vi.mocked(fetchJourneys).mockRejectedValueOnce(new Error("journeys down"));

    const ui = await RegionPage({ params: Promise.resolve({ id: "nao" }) });
    render(ui);

    expect(screen.getByTestId("share-panel")).toHaveTextContent("NAO:0");
    expect(screen.getByTestId("country-views-section")).toHaveTextContent(
      "North America & Oceania:NAmOceania:United States,Mexico:false",
    );
  });

  it("keeps the region page renderable when country views fail", async () => {
    vi.mocked(fetchCountryViews).mockRejectedValueOnce(
      new Error("country views down"),
    );

    const ui = await RegionPage({ params: Promise.resolve({ id: "nao" }) });
    render(ui);

    expect(screen.getByTestId("share-panel")).toHaveTextContent("NAO:1");
    expect(screen.getByTestId("country-views-section")).toHaveTextContent(
      "North America & Oceania:NAmOceania::true",
    );
  });

  it("rejects non-canonical region aliases", async () => {
    await expect(
      RegionPage({ params: Promise.resolve({ id: "NAO" }) }),
    ).rejects.toThrow("not found");
  });
});

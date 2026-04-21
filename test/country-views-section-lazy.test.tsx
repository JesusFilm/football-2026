import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CountryViewsSection } from "@/components/country-views-section";

vi.mock("next/dynamic", () => ({
  default:
    () =>
    ({
      countries: loadedCountries,
      initialSelection,
    }: {
      countries: unknown[];
      initialSelection: string;
    }) => (
      <div data-testid="region-interactive-map">
        {initialSelection}:{loadedCountries.length}
      </div>
    ),
}));

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

describe("CountryViewsSection lazy loading", () => {
  let intersect: (isIntersecting: boolean) => void;

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("loads the interactive region map after the section enters the viewport", () => {
    class MockIntersectionObserver {
      observe = vi.fn();
      disconnect = vi.fn();

      constructor(
        private callback: (entries: { isIntersecting: boolean }[]) => void,
      ) {
        intersect = (isIntersecting: boolean) => {
          this.callback([{ isIntersecting }]);
        };
      }
    }

    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);

    render(
      <CountryViewsSection
        regionName="North America & Oceania"
        regionCode="NAmOceania"
        countries={countries}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Where The Story is Spreading" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId("region-interactive-map"),
    ).not.toBeInTheDocument();
    expect(screen.getAllByTestId("region-skeleton-country-row")).toHaveLength(
      10,
    );

    act(() => {
      intersect(true);
    });

    expect(screen.getByTestId("region-interactive-map")).toHaveTextContent(
      "NAmOceania:2",
    );
  });

  it("renders empty and unavailable states without loading the map", () => {
    const { rerender } = render(
      <CountryViewsSection
        regionName="East Asia"
        regionCode="East Asia"
        countries={[]}
      />,
    );

    expect(screen.getByText("No country views yet")).toBeInTheDocument();
    expect(
      screen.getByText(
        "No country-level views are available for East Asia yet.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId("region-interactive-map"),
    ).not.toBeInTheDocument();

    rerender(
      <CountryViewsSection
        regionName="East Asia"
        regionCode="East Asia"
        countries={[]}
        unavailable
      />,
    );

    expect(screen.getByText("Views unavailable")).toBeInTheDocument();
    expect(
      screen.getByText("Country view data could not be loaded right now."),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId("region-interactive-map"),
    ).not.toBeInTheDocument();
  });
});

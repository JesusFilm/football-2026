import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { HomeCountryViewsSection } from "@/components/home-country-views-section";
import { REGIONS } from "@/lib/regions";

vi.mock("next/dynamic", () => ({
  default: () => () => <div data-testid="interactive-map" />,
}));

const countries = [
  {
    countryName: "United States",
    regionCode: "NAmOceania",
    countryCode: "US",
    journeyViews: 170768,
  },
];

describe("HomeCountryViewsSection", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders the lightweight shell before the map is near the viewport", () => {
    class MockIntersectionObserver {
      observe = vi.fn();
      disconnect = vi.fn();
    }

    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);

    render(<HomeCountryViewsSection regions={REGIONS} countries={countries} />);

    expect(
      screen.getByRole("heading", { name: "Where The Story is Spreading" }),
    ).toBeInTheDocument();
    expect(screen.queryByTestId("interactive-map")).not.toBeInTheDocument();
    expect(screen.getAllByTestId("skeleton-filter")).toHaveLength(8);
    expect(screen.getAllByTestId("skeleton-country-row")).toHaveLength(10);
  });

  it("loads the interactive map when the section intersects", () => {
    class MockIntersectionObserver {
      observe = vi.fn(() => {
        this.callback([{ isIntersecting: true }]);
      });
      disconnect = vi.fn();

      constructor(
        private callback: (entries: { isIntersecting: boolean }[]) => void,
      ) {}
    }

    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);

    render(<HomeCountryViewsSection regions={REGIONS} countries={countries} />);

    expect(screen.getByTestId("interactive-map")).toBeInTheDocument();
  });
});

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

  it("loads the interactive map without a viewport gate", () => {
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

    expect(
      screen.getByRole("heading", { name: "Where The Story is Spreading" }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("interactive-map")).toBeInTheDocument();
  });
});

import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { HomeCountryViewsSection } from "@/components/home-country-views-section";
import { REGIONS } from "@/lib/regions";

vi.mock("@/components/home-country-views-interactive", () => ({
  HomeCountryViewsInteractive: () => <div data-testid="interactive-map" />,
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
  let intersect: (isIntersecting: boolean) => void;

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("loads the interactive map after the section enters the viewport", async () => {
    class MockIntersectionObserver {
      observe = vi.fn();
      unobserve = vi.fn();
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

    render(<HomeCountryViewsSection regions={REGIONS} countries={countries} />);

    expect(
      screen.getByRole("heading", { name: "Where The Story is Spreading" }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("United States").length).toBeGreaterThan(0);
    expect(screen.getAllByText("170,768").length).toBeGreaterThan(0);
    expect(screen.queryByTestId("interactive-map")).not.toBeInTheDocument();
    expect(screen.getAllByTestId("skeleton-country-row")).toHaveLength(10);

    await act(async () => {
      intersect(true);
    });

    expect(await screen.findByTestId("interactive-map")).toBeInTheDocument();
  });
});

import { act, fireEvent, render, screen } from "@testing-library/react";
import type { CSSProperties } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { HomeCountryViewsInteractive } from "@/components/home-country-views-interactive";
import { REGIONS } from "@/lib/regions";

const reducedMotion = vi.hoisted(() => ({ value: false }));

vi.mock("motion/react", () => ({
  useReducedMotion: () => reducedMotion.value,
}));

vi.mock("react-svg-worldmap", () => ({
  default: ({
    data,
    title,
    styleFunction,
  }: {
    data: { country: string; value: number }[];
    title: string;
    styleFunction: (context: {
      countryCode: string;
      countryName: string;
      countryValue?: number;
    }) => CSSProperties;
  }) => (
    <div data-testid="world-map" aria-label={title}>
      {JSON.stringify(data)}
      {data.map((country) => (
        <span
          key={country.country}
          data-testid={`map-country-${country.country}`}
          data-style={JSON.stringify(
            styleFunction({
              countryCode: country.country,
              countryName: country.country,
              countryValue: country.value,
            }),
          )}
        />
      ))}
    </div>
  ),
  regions: [
    { code: "US", name: "United States" },
    { code: "MX", name: "Mexico" },
  ],
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
  ...Array.from({ length: 10 }, (_, index) => ({
    countryName: `LAC extra country ${index + 1}`,
    regionCode: "LAC",
    journeyViews: index + 1,
  })),
  ...Array.from({ length: 9 }, (_, index) => ({
    countryName: `Extra country ${index + 1}`,
    regionCode: "NAmOceania",
    journeyViews: index + 1,
  })),
];

describe("HomeCountryViewsInteractive", () => {
  afterEach(() => {
    reducedMotion.value = false;
    vi.useRealTimers();
  });

  it("starts with all countries and can filter to a region", () => {
    vi.useFakeTimers();

    render(
      <HomeCountryViewsInteractive regions={REGIONS} countries={countries} />,
    );

    expect(screen.getByTestId("world-map")).toHaveTextContent('"country":"us"');
    expect(screen.getByTestId("world-map")).toHaveTextContent('"country":"mx"');
    expect(screen.queryByText("Mapped")).not.toBeInTheDocument();
    expect(screen.getByText("Top country")).toBeInTheDocument();
    expect(screen.getByText("LAC extra country 8")).toBeInTheDocument();
    expect(screen.queryByText("LAC extra country 9")).not.toBeInTheDocument();
    expect(screen.queryByText("Extra country 1")).not.toBeInTheDocument();
    expect(
      screen
        .getAllByText("United States")
        .some((element) => element.classList.contains("metric-value-enter")),
    ).toBe(true);
    expect(screen.getByText("194,897")).toHaveStyle({
      animationDelay: "90ms",
    });
    expect(screen.getByText("21")).toHaveStyle({
      animationDelay: "180ms",
    });
    expect(screen.getByText("LAC extra country 8").parentElement).toHaveClass(
      "country-row-enter",
    );

    fireEvent.click(screen.getByRole("button", { name: "LAC" }));

    expect(screen.getByTestId("world-map")).not.toHaveTextContent(
      '"country":"us"',
    );
    expect(screen.getByTestId("world-map")).toHaveTextContent('"country":"mx"');

    act(() => {
      vi.advanceTimersByTime(0);
    });

    expect(
      screen
        .queryAllByText("United States")
        .some((element) =>
          element.parentElement?.classList.contains("country-row-exit"),
        ),
    ).toBe(true);
    expect(screen.getByText("LAC extra country 9").parentElement).toHaveClass(
      "country-row-enter",
    );

    act(() => {
      vi.advanceTimersByTime(1150);
    });

    expect(screen.getByText("LAC extra country 9")).toBeInTheDocument();
    expect(screen.queryByText("LAC extra country 10")).not.toBeInTheDocument();
  });

  it("automatically advances through region selections", () => {
    vi.useFakeTimers();

    render(
      <HomeCountryViewsInteractive regions={REGIONS} countries={countries} />,
    );

    expect(screen.getByTestId("world-map")).toHaveTextContent('"country":"mx"');
    expect(screen.getByTestId("auto-advance-progress")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(6000);
    });

    expect(screen.getByTestId("world-map")).not.toHaveTextContent(
      '"country":"mx"',
    );

    act(() => {
      vi.advanceTimersByTime(1150);
    });

    expect(screen.getByText("AFR")).toBeInTheDocument();
    expect(screen.getAllByText("0").length).toBeGreaterThanOrEqual(2);
  });

  it("stops auto-advance when a region is manually selected", () => {
    vi.useFakeTimers();

    render(
      <HomeCountryViewsInteractive regions={REGIONS} countries={countries} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "LAC" }));

    expect(
      screen.queryByTestId("auto-advance-progress"),
    ).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(12000);
    });

    expect(screen.getByTestId("world-map")).toHaveTextContent('"country":"mx"');
    expect(screen.queryByText("LAC extra country 10")).not.toBeInTheDocument();
  });

  it("can start with a region selected", () => {
    render(
      <HomeCountryViewsInteractive
        regions={REGIONS}
        countries={countries}
        initialSelection="LAC"
      />,
    );

    expect(screen.getByRole("button", { name: "LAC" })).toHaveClass(
      "border-accent",
    );
    expect(screen.getByTestId("world-map")).toHaveTextContent('"country":"mx"');
    expect(screen.getByText("LAC extra country 9")).toBeInTheDocument();
    expect(screen.queryByText("Extra country 1")).not.toBeInTheDocument();
  });

  it("can render the full country list for region pages", () => {
    render(
      <HomeCountryViewsInteractive
        regions={REGIONS}
        countries={countries}
        initialSelection="LAC"
        countryListLimit={null}
      />,
    );

    expect(screen.getByText("LAC extra country 10")).toBeInTheDocument();
  });

  it("disables auto-advance and outgoing layers for reduced-motion users", () => {
    reducedMotion.value = true;
    vi.useFakeTimers();

    render(
      <HomeCountryViewsInteractive regions={REGIONS} countries={countries} />,
    );

    expect(
      screen.queryByTestId("auto-advance-progress"),
    ).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(6000);
    });

    expect(screen.getByTestId("world-map")).toHaveTextContent('"country":"mx"');

    fireEvent.click(screen.getByRole("button", { name: "LAC" }));

    expect(
      screen
        .queryAllByText("United States")
        .some((element) =>
          element.parentElement?.classList.contains("country-row-exit"),
        ),
    ).toBe(false);
    expect(screen.getByText("LAC extra country 9")).toBeInTheDocument();
  });
});

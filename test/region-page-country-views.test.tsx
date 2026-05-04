import { screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import RegionPage from "@/app/[locale]/[id]/page";
import { fetchCountryViews } from "@/lib/country-views";
import type { CountryView } from "@/lib/country-views";
import { fetchJourneys } from "@/lib/journeys";
import { renderWithIntl } from "@/test/intl-test-utils";

vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("not found");
  },
}));

vi.mock("next-intl/server", () => {
  const mockMessages = {
    Metadata: {
      breadcrumbAllRegions: "All regions",
      fallbackRegionTitle: "Region",
      regionTitle: "Activate {regionName}",
    },
    Regions: {
      nao: {
        name: "North America & Oceania",
        blurb: "United States, Canada, Australia, New Zealand & the Pacific.",
        seoDescription:
          "World Cup 2026 outreach tools for North America & Oceania: share local-language videos, QR codes, and regional view data.",
        flags: {
          us: "United States",
          ca: "Canada",
          au: "Australia",
          nz: "New Zealand",
          fj: "Fiji",
        },
      },
      africa: {
        name: "Africa",
        blurb:
          "Across Africa's activation region. Hundreds of languages. One game.",
        seoDescription:
          "World Cup 2026 outreach tools for Africa: share videos in local languages and track country-level views.",
        flags: {
          ng: "Nigeria",
          za: "South Africa",
          ke: "Kenya",
          gh: "Ghana",
          et: "Ethiopia",
        },
      },
      "east-asia": {
        name: "East Asia",
        blurb: "China, Japan, Korea, Mongolia — the heart of the Pacific rim.",
        seoDescription:
          "Activate East Asia for World Cup 2026 with regional Jesus Film Project videos, QR codes, share links, and view tracking.",
        flags: {
          cn: "China",
          jp: "Japan",
          kr: "Korea",
          mn: "Mongolia",
          tw: "Taiwan",
        },
      },
      europe: {
        name: "Europe",
        blurb: "The continent where the modern game was written.",
        seoDescription:
          "Activate Europe during World Cup 2026 with Jesus Film Project videos, QR codes, share links, and regional view data.",
        flags: {
          gb: "United Kingdom",
          fr: "France",
          de: "Germany",
          es: "Spain",
          it: "Italy",
        },
      },
      lac: {
        name: "Latin America & Caribbean",
        blurb:
          "From Tijuana to Tierra del Fuego — a continent unified by football.",
        seoDescription:
          "World Cup 2026 outreach tools for Latin America & Caribbean: share regional videos, QR codes, and local-language journeys.",
        flags: {
          br: "Brazil",
          ar: "Argentina",
          co: "Colombia",
          mx: "Mexico",
          cl: "Chile",
        },
      },
      namestan: {
        name: "North Africa, Middle East & Central Asia",
        blurb: "Morocco to Kazakhstan — across three continents.",
        seoDescription:
          "Activate North Africa, the Middle East & Central Asia with World Cup 2026 videos, QR codes, and local-language sharing tools.",
        flags: {
          ma: "Morocco",
          eg: "Egypt",
          sa: "Saudi Arabia",
          ir: "Iran",
          kz: "Kazakhstan",
        },
      },
      sesa: {
        name: "Southeast & South Asia",
        blurb:
          "From Mumbai to Manila — home to a quarter of the world's people.",
        seoDescription:
          "World Cup 2026 outreach tools for Southeast & South Asia: share local-language videos across a high-reach region.",
        flags: {
          in: "India",
          id: "Indonesia",
          ph: "Philippines",
          vn: "Vietnam",
          th: "Thailand",
        },
      },
    },
  };

  const readMessage = (namespace: string, key: string) =>
    key.split(".").reduce<unknown>(
      (current, part) => {
        if (typeof current !== "object" || current === null) return undefined;
        return (current as Record<string, unknown>)[part];
      },
      (mockMessages as Record<string, unknown>)[namespace],
    );

  const interpolate = (
    message: string,
    values?: Record<string, string | number>,
  ) =>
    Object.entries(values ?? {}).reduce(
      (result, [key, value]) =>
        result
          .replaceAll(`{${key}}`, String(value))
          .replaceAll(
            `{${key}, plural, one {country} other {countries}}`,
            Number(value) === 1 ? "country" : "countries",
          )
          .replaceAll(
            `{${key}, plural, one {language} other {languages}}`,
            Number(value) === 1 ? "language" : "languages",
          ),
      message,
    );

  return {
    getTranslations: vi.fn(
      async (
        input:
          | string
          | {
              locale?: string;
              namespace?: string;
            },
      ) => {
        const namespace = typeof input === "string" ? input : input.namespace;

        return (key: string, values?: Record<string, string | number>) => {
          const message =
            namespace === undefined ? undefined : readMessage(namespace, key);

          return typeof message === "string"
            ? interpolate(message, values)
            : key;
        };
      },
    ),
    setRequestLocale: vi.fn(),
  };
});

vi.mock("@/i18n/navigation", () => ({
  Link: ({
    children,
    href,
    ...props
  }: {
    children: ReactNode;
    href: string;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
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
    const ui = await RegionPage({
      params: Promise.resolve({ locale: "en", id: "nao" }),
    });
    renderWithIntl(ui);

    expect(
      screen.getByRole("heading", {
        name: "Share the Gospel during the World Cup",
      }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("share-panel")).toHaveTextContent("NAO:1");
    expect(screen.getByTestId("country-views-section")).toHaveTextContent(
      "North America & Oceania:NAmOceania:United States,Mexico:false",
    );
  });

  it("keeps the region page renderable when journeys fail", async () => {
    vi.mocked(fetchJourneys).mockRejectedValueOnce(new Error("journeys down"));

    const ui = await RegionPage({
      params: Promise.resolve({ locale: "en", id: "nao" }),
    });
    renderWithIntl(ui);

    expect(screen.getByTestId("share-panel")).toHaveTextContent("NAO:0");
    expect(screen.getByTestId("country-views-section")).toHaveTextContent(
      "North America & Oceania:NAmOceania:United States,Mexico:false",
    );
  });

  it("keeps the region page renderable when country views fail", async () => {
    vi.mocked(fetchCountryViews).mockRejectedValueOnce(
      new Error("country views down"),
    );

    const ui = await RegionPage({
      params: Promise.resolve({ locale: "en", id: "nao" }),
    });
    renderWithIntl(ui);

    expect(screen.getByTestId("share-panel")).toHaveTextContent("NAO:1");
    expect(screen.getByTestId("country-views-section")).toHaveTextContent(
      "North America & Oceania:NAmOceania::true",
    );
  });

  it("rejects non-canonical region aliases", async () => {
    await expect(
      RegionPage({ params: Promise.resolve({ locale: "en", id: "NAO" }) }),
    ).rejects.toThrow("not found");
  });
});

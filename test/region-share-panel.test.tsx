import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  defaultJourney,
  getJourneyLanguageLabel,
  RegionSharePanel,
  sortJourneysForLocale,
} from "@/components/region-share-panel";
import type { Journey } from "@/lib/journeys";
import { renderWithIntl } from "@/test/intl-test-utils";

/* eslint-disable @next/next/no-img-element */
vi.mock("next/image", () => ({
  default: ({
    alt,
    src,
    ...props
  }: {
    alt: string;
    src: string;
    width: number;
    height: number;
    className?: string;
  }) => <img alt={alt} src={src} {...props} />,
}));

const journeys: Journey[] = [
  {
    slug: "where-you-belong-swahili",
    language: {
      id: "123",
      bcp47: "sw-TZ",
      english: "Swahili, Tanzania",
      native: "Kiswahili",
    },
  },
];

function stubClipboard(writeText = vi.fn().mockResolvedValue(undefined)) {
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText },
    configurable: true,
  });
  return writeText;
}

describe("RegionSharePanel", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("copies the selected journey link only after clipboard succeeds", async () => {
    const writeText = stubClipboard();

    renderWithIntl(<RegionSharePanel regionCode="NAO" journeys={journeys} />);

    fireEvent.click(screen.getByRole("button", { name: "Copy link" }));

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith(
        "https://your.nextstep.is/where-you-belong-swahili",
      );
    });
    expect(screen.getByRole("button", { name: "Copy link" })).toHaveClass(
      "bg-green",
    );
  });

  it("shows journey language names from BCP 47 codes with native subtitles", () => {
    renderWithIntl(<RegionSharePanel regionCode="NAO" journeys={journeys} />);

    expect(screen.getByText("Swahili (Tanzania)")).toBeInTheDocument();
    expect(screen.getByText("Kiswahili")).toBeInTheDocument();
    expect(screen.queryByText("Swahili, Tanzania")).not.toBeInTheDocument();
  });

  it("defaults to the active locale journey when that language is available", () => {
    const localizedJourneys: Journey[] = [
      {
        slug: "where-you-belong-english",
        language: {
          id: "529",
          bcp47: "en",
          english: "English",
        },
      },
      {
        slug: "where-you-belong-spanish",
        language: {
          id: "21028",
          bcp47: "es-419",
          english: "Spanish, Latin America",
          native: "Español",
        },
      },
    ];

    renderWithIntl(
      <RegionSharePanel regionCode="LAC" journeys={localizedJourneys} />,
      { locale: "es" },
    );

    expect(screen.getByText("español latinoamericano")).toBeInTheDocument();
    expect(screen.getByText("Español")).toBeInTheDocument();
  });

  it("falls back to English as the default journey when the active locale is unavailable", () => {
    const localizedJourneys: Journey[] = [
      {
        slug: "where-you-belong-swahili",
        language: {
          id: "123",
          bcp47: "sw-TZ",
          english: "Swahili, Tanzania",
        },
      },
      {
        slug: "where-you-belong-english",
        language: {
          id: "529",
          bcp47: "en",
          english: "English",
        },
      },
    ];

    expect(defaultJourney(localizedJourneys, "fr")?.slug).toBe(
      "where-you-belong-english",
    );
  });

  it("keeps the locale-default journey first, then sorts the rest alphabetically", () => {
    const localizedJourneys: Journey[] = [
      {
        slug: "where-you-belong-zulu",
        language: {
          id: "zul",
          bcp47: "zu",
          english: "Zulu",
        },
      },
      {
        slug: "where-you-belong-english",
        language: {
          id: "529",
          bcp47: "en",
          english: "English",
        },
      },
      {
        slug: "where-you-belong-arabic",
        language: {
          id: "arb",
          bcp47: "ar",
          english: "Arabic",
        },
      },
      {
        slug: "where-you-belong-french",
        language: {
          id: "496",
          bcp47: "fr",
          english: "French",
        },
      },
    ];

    expect(
      sortJourneysForLocale(localizedJourneys, "fr").map(
        (journey) => journey.slug,
      ),
    ).toEqual([
      "where-you-belong-french",
      "where-you-belong-english",
      "where-you-belong-arabic",
      "where-you-belong-zulu",
    ]);
  });

  it("shows which language is currently selected in the dropdown list", () => {
    const localizedJourneys: Journey[] = [
      {
        slug: "where-you-belong-english",
        language: {
          id: "529",
          bcp47: "en",
          english: "English",
        },
      },
      {
        slug: "where-you-belong-spanish",
        language: {
          id: "21028",
          bcp47: "es-419",
          english: "Spanish, Latin America",
          native: "Español",
        },
      },
    ];

    renderWithIntl(
      <RegionSharePanel regionCode="LAC" journeys={localizedJourneys} />,
      { locale: "en" },
    );

    fireEvent.click(screen.getByRole("button", { name: "English" }));
    expect(
      screen
        .getAllByRole("button", { name: /english/i })
        .find((element) => element.getAttribute("aria-pressed") === "true"),
    ).toBeTruthy();

    fireEvent.click(
      screen.getByRole("button", { name: /latin american spanish/i }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: /latin american spanish/i }),
    );

    expect(
      screen
        .getAllByRole("button", { name: /latin american spanish/i })
        .find((element) => element.getAttribute("aria-pressed") === "true"),
    ).toBeTruthy();
  });

  it("falls back to the English journey language label without a BCP 47 code", () => {
    expect(
      getJourneyLanguageLabel(
        {
          id: "legacy",
          english: "Legacy Language",
          native: "Primary Language",
        },
        "es",
      ),
    ).toBe("Legacy Language");
  });

  it("does not load the external video iframe until preview enters the viewport", () => {
    let intersect: ((isIntersecting: boolean) => void) | undefined;
    class MockIntersectionObserver {
      observe = vi.fn();
      disconnect = vi.fn();
      unobserve = vi.fn();

      constructor(callback: (entries: { isIntersecting: boolean }[]) => void) {
        intersect = (isIntersecting: boolean) => callback([{ isIntersecting }]);
      }
    }

    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);

    renderWithIntl(<RegionSharePanel regionCode="NAO" journeys={journeys} />);

    expect(screen.queryByTitle("NAO preview")).not.toBeInTheDocument();

    act(() => {
      intersect?.(true);
    });

    expect(screen.getByTitle("NAO preview")).toHaveAttribute(
      "src",
      "https://your.nextstep.is/embed/where-you-belong-swahili?expand=false",
    );
  });

  it("keeps the video preview physically anchored for RTL layouts", () => {
    let intersect: ((isIntersecting: boolean) => void) | undefined;
    class MockIntersectionObserver {
      observe = vi.fn();
      disconnect = vi.fn();
      unobserve = vi.fn();

      constructor(callback: (entries: { isIntersecting: boolean }[]) => void) {
        intersect = (isIntersecting: boolean) => callback([{ isIntersecting }]);
      }
    }

    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);

    renderWithIntl(<RegionSharePanel regionCode="NAO" journeys={journeys} />);

    act(() => {
      intersect?.(true);
    });

    const iframe = screen.getByTitle("NAO preview");
    expect(iframe.parentElement).toHaveAttribute("dir", "ltr");
    expect(iframe).toHaveClass("top-0", "left-0");
    expect(iframe).not.toHaveClass("inset-0");
  });

  it("marks copy as an error when clipboard fails", async () => {
    stubClipboard(vi.fn().mockRejectedValue(new Error("blocked")));

    renderWithIntl(<RegionSharePanel regionCode="NAO" journeys={journeys} />);

    fireEvent.click(screen.getByRole("button", { name: "Copy link" }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Copy link" })).toHaveClass(
        "bg-accent",
      );
    });
  });

  it("renders the screenshot copy around the share flow", () => {
    renderWithIntl(<RegionSharePanel regionCode="NAO" journeys={journeys} />);

    expect(screen.getByText("Here's how it works:")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Pick a language your friend, family member, or neighbor understands.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Watch what they'll experience below before you send it.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Share this link below with them."),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Want to see how people around the world are responding to faith this season? Explore the map below.",
      ),
    ).toBeInTheDocument();
  });
});

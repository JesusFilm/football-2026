import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { RegionSharePanel } from "@/components/region-share-panel";
import type { Journey } from "@/lib/journeys";

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

    render(<RegionSharePanel regionCode="NAO" journeys={journeys} />);

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

  it("does not load the external video iframe until preview is requested", () => {
    render(<RegionSharePanel regionCode="NAO" journeys={journeys} />);

    expect(screen.queryByTitle("NAO preview")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Preview NAO video" }));

    expect(screen.getByTitle("NAO preview")).toHaveAttribute(
      "src",
      "https://your.nextstep.is/embed/where-you-belong-swahili?expand=false",
    );
  });

  it("marks copy as an error when clipboard fails", async () => {
    stubClipboard(vi.fn().mockRejectedValue(new Error("blocked")));

    render(<RegionSharePanel regionCode="NAO" journeys={journeys} />);

    fireEvent.click(screen.getByRole("button", { name: "Copy link" }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Copy link" })).toHaveClass(
        "bg-accent",
      );
    });
  });

  it("falls back to clipboard when native share fails", async () => {
    const writeText = stubClipboard();
    const share = vi.fn().mockRejectedValue(new Error("share unavailable"));
    Object.defineProperty(navigator, "share", {
      value: share,
      configurable: true,
    });

    render(<RegionSharePanel regionCode="NAO" journeys={journeys} />);

    fireEvent.click(screen.getByRole("button", { name: "Share" }));

    await waitFor(() => {
      expect(share).toHaveBeenCalled();
      expect(writeText).toHaveBeenCalledWith(
        "https://your.nextstep.is/where-you-belong-swahili",
      );
      expect(
        screen.getByRole("button", { name: "Copied" }),
      ).toBeInTheDocument();
    });
  });

  it("downloads the QR image with region and language in the filename", async () => {
    stubClipboard();
    vi.stubGlobal(
      "Image",
      class {
        onload: (() => void) | null = null;

        set src(_value: string) {
          queueMicrotask(() => this.onload?.());
        }
      },
    );
    Object.defineProperty(URL, "createObjectURL", {
      value: vi.fn(() => "blob:qr"),
      configurable: true,
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      value: vi.fn(),
      configurable: true,
    });
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
      drawImage: vi.fn(),
    } as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation(
      function toBlob(callback) {
        callback(new Blob(["png"], { type: "image/png" }));
      },
    );
    let downloadedName = "";
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(
      function click(this: HTMLAnchorElement) {
        downloadedName = this.download;
      },
    );

    render(<RegionSharePanel regionCode="NAO" journeys={journeys} />);

    fireEvent.click(screen.getByRole("button", { name: "Download PNG" }));

    await waitFor(() => {
      expect(downloadedName).toBe("world-cup-2026-nao-swahili-tanzania-qr.png");
      expect(
        screen.getByRole("button", { name: "Downloaded" }),
      ).toBeInTheDocument();
    });
  });
});

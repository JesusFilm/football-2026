import { describe, expect, it } from "vitest";

import { renderQrSvg } from "@/lib/qr";

describe("renderQrSvg", () => {
  it("renders a real QR-shaped SVG for the encoded URL", () => {
    const svg = renderQrSvg("https://your.nextstep.is/example", 128);

    expect(svg).toContain('viewBox="0 0 128 128"');
    expect(svg).toContain('width="128"');
    expect(svg).toContain('height="128"');
    expect(svg.match(/<rect /g)?.length).toBeGreaterThan(100);
  });

  it("changes the encoded modules when the URL changes", () => {
    expect(renderQrSvg("https://your.nextstep.is/a", 128)).not.toBe(
      renderQrSvg("https://your.nextstep.is/b", 128),
    );
  });
});

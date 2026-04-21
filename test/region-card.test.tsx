import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { RegionCard } from "@/components/region-card";
import { REGIONS } from "@/lib/regions";

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

describe("RegionCard", () => {
  it("marks its directional arrow for RTL mirroring", () => {
    render(<RegionCard region={REGIONS[0]} />);

    const link = screen.getByRole("link", { name: /africa/i });
    const arrow = link.querySelector("svg");

    expect(arrow).toHaveClass("rtl-mirror");
  });
});

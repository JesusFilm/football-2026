import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { StatusCard } from "@/components/status-card";

describe("StatusCard", () => {
  it("renders the title and body copy", () => {
    render(<StatusCard title="Vitest">Runs focused tests</StatusCard>);

    expect(screen.getByText("Vitest")).toBeInTheDocument();
    expect(screen.getByText("Runs focused tests")).toBeInTheDocument();
  });
});

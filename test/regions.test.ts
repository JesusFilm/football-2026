import { describe, expect, it } from "vitest";

import { getRegion, JSONBIN_REGION_CODES, REGIONS } from "@/lib/regions";

describe("REGIONS", () => {
  it("uses JSONBin region labels as canonical region codes", () => {
    const allowedCodes = new Set<string>(JSONBIN_REGION_CODES);

    expect(REGIONS).toHaveLength(7);
    expect(REGIONS.every((region) => allowedCodes.has(region.code))).toBe(true);
  });

  it("does not expose Other/Unknown as an activation region", () => {
    expect(REGIONS.map((region) => region.code)).not.toContain("Other/Unknown");
  });

  it("keeps stable route ids while updating country-view taxonomy", () => {
    expect(getRegion("nao")).toMatchObject({
      id: "nao",
      code: "NAmOceania",
      displayCode: "NAO",
    });
    expect(getRegion("lac")).toMatchObject({
      id: "lac",
      code: "LAC",
      displayCode: "LAC",
    });
  });
});

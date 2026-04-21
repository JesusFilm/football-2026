import { describe, expect, it } from "vitest";

import {
  getRegion,
  getRegionById,
  JSONBIN_REGION_CODES,
  REGIONS,
} from "@/lib/regions";

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
    expect(getRegionById("nao")).toMatchObject({
      id: "nao",
      code: "NAmOceania",
      displayCode: "NAO",
    });
    expect(getRegionById("lac")).toMatchObject({
      id: "lac",
      code: "LAC",
      displayCode: "LAC",
    });
  });

  it("only treats exact route ids as canonical region page ids", () => {
    expect(getRegionById("NAO")).toBeUndefined();
    expect(getRegionById("Europe")).toBeUndefined();
    expect(getRegionById("sub-saharan-africa")).toBeUndefined();
  });

  it("keeps region alias lookup available outside canonical page routing", () => {
    expect(getRegion("NAmOceania")).toMatchObject({
      id: "nao",
      code: "NAmOceania",
    });
    expect(getRegion("NAO")).toMatchObject({
      id: "nao",
      displayCode: "NAO",
    });
    expect(getRegion("East%20Asia")).toMatchObject({
      id: "east-asia",
      code: "East Asia",
    });
    expect(getRegion("EUR")).toMatchObject({
      id: "europe",
      displayCode: "EUR",
    });
  });
});

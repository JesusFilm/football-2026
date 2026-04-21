import { describe, expect, it } from "vitest";

import {
  getCountryDisplayName,
  resolveCountryCodeFromName,
} from "@/lib/country-display";

describe("country display helpers", () => {
  it("resolves known JSONBin country names to country codes", () => {
    expect(resolveCountryCodeFromName("United States")).toBe("US");
    expect(resolveCountryCodeFromName("United States of America")).toBe("US");
    expect(resolveCountryCodeFromName("Kosovo")).toBe("XK");
  });

  it("formats country names in the active locale when a code is available", () => {
    expect(
      getCountryDisplayName("es", {
        countryName: "United States",
        countryCode: "US",
      }),
    ).toBe("Estados Unidos");
    expect(
      getCountryDisplayName("fr", {
        countryName: "Brazil",
        countryCode: "BR",
      }),
    ).toBe("Brésil");
    expect(
      getCountryDisplayName("pt-BR", {
        countryName: "Germany",
        countryCode: "DE",
      }),
    ).toBe("Alemanha");
  });

  it("falls back to the source name when no country code is available", () => {
    expect(
      getCountryDisplayName("es", {
        countryName: "Imaginary Country",
        sourceCountryName: "Imaginary Country",
      }),
    ).toBe("Imaginary Country");
  });
});

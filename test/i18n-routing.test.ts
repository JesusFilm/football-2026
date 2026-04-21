import { describe, expect, it } from "vitest";

import {
  defaultLocale,
  getLocaleDirection,
  getPathnameForLocale,
  isLocale,
  locales,
} from "@/i18n/routing";
import { REGIONS } from "@/lib/regions";

describe("i18n routing", () => {
  it("keeps English as the unprefixed default locale", () => {
    expect(defaultLocale).toBe("en");
    expect(getPathnameForLocale("en", "/africa")).toBe("/africa");
    expect(getPathnameForLocale("es", "/africa")).toBe("/es/africa");
    expect(getPathnameForLocale("pt-BR", "/")).toBe("/pt-BR");
  });

  it("treats Arabic and Urdu as RTL locales", () => {
    expect(getLocaleDirection("ar")).toBe("rtl");
    expect(getLocaleDirection("ur")).toBe("rtl");
    expect(getLocaleDirection("en")).toBe("ltr");
  });

  it("classifies locale segments before region aliases", () => {
    expect(isLocale("id")).toBe(true);
    const localeSet = new Set<string>(locales);
    expect(REGIONS.some((region) => localeSet.has(region.id))).toBe(false);
  });
});

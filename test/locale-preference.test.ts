import { describe, expect, it } from "vitest";

import {
  getLocaleFromAcceptLanguage,
  getLocaleFromCookieValue,
  getPreferredLocale,
  localeCookieName,
} from "@/i18n/locale-preference";

describe("locale preference", () => {
  it("reads supported locale values from cookies", () => {
    expect(getLocaleFromCookieValue("pt-BR")).toBe("pt-BR");
    expect(getLocaleFromCookieValue("zh-Hans")).toBe("zh-Hans");
    expect(getLocaleFromCookieValue("nope")).toBeUndefined();
  });

  it("matches Accept-Language headers to configured locales", () => {
    expect(getLocaleFromAcceptLanguage("pt;q=0.9,en;q=0.8")).toBe("pt-BR");
    expect(getLocaleFromAcceptLanguage("zh-CN,es;q=0.8")).toBe("zh-Hans");
    expect(getLocaleFromAcceptLanguage("fr-CA,es;q=0.8")).toBe("fr");
  });

  it("lets the cookie override browser language", () => {
    expect(
      getPreferredLocale({
        acceptLanguage: "es;q=1",
        cookie: "de",
      }),
    ).toBe("de");
  });

  it("uses the next-intl cookie name", () => {
    expect(localeCookieName).toBe("NEXT_LOCALE");
  });
});

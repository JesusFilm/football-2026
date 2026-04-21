import { describe, expect, it } from "vitest";

import { locales } from "@/i18n/routing";
import enMessages from "@/messages/en.json";

function collectKeyPaths(value: unknown, prefix = ""): string[] {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return [prefix];
  }

  return Object.entries(value).flatMap(([key, nested]) =>
    collectKeyPaths(nested, prefix ? `${prefix}.${key}` : key),
  );
}

describe("message catalogs", () => {
  it("keeps every configured locale structurally aligned with English", async () => {
    const englishKeys = collectKeyPaths(enMessages).sort();

    for (const locale of locales) {
      const messages = (await import(`@/messages/${locale}.json`)).default;

      expect(collectKeyPaths(messages).sort(), locale).toEqual(englishKeys);
    }
  });
});

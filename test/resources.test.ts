import { describe, expect, it } from "vitest";

import enMessages from "@/messages/en.json";
import {
  RESOURCE_CATEGORIES_IN_ORDER,
  RESOURCES,
  getResourceById,
  resourcesByCategory,
} from "@/lib/resources";

describe("RESOURCES catalog", () => {
  it("contains at least one resource per category", () => {
    for (const category of RESOURCE_CATEGORIES_IN_ORDER) {
      expect(resourcesByCategory(category).length).toBeGreaterThan(0);
    }
  });

  it("has no duplicate resource ids", () => {
    const ids = RESOURCES.map((r) => r.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("uses valid kebab-case ids", () => {
    for (const r of RESOURCES) {
      expect(r.id).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    }
  });

  it("uses https URLs", () => {
    for (const r of RESOURCES) {
      expect(r.url).toMatch(/^https:\/\//);
    }
  });

  it("getResourceById round-trips for every resource", () => {
    for (const r of RESOURCES) {
      expect(getResourceById(r.id)?.id).toBe(r.id);
    }
  });

  it("every resource has a matching i18n title + blurb in en.json", () => {
    const items = (
      enMessages as unknown as {
        Resources: {
          items: Record<string, { title: string; blurb: string }>;
        };
      }
    ).Resources.items;

    for (const r of RESOURCES) {
      expect(items[r.id], `missing Resources.items.${r.id}`).toBeDefined();
      expect(items[r.id].title.length).toBeGreaterThan(0);
      expect(items[r.id].blurb.length).toBeGreaterThan(0);
    }
  });
});

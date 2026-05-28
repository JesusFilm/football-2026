import { describe, expect, it } from "vitest";

import en from "@/messages/en.json";
import {
  COLLECTION_URL,
  formatDuration,
  SOCCER_VIDEOS,
} from "@/lib/soccer-videos";

describe("SOCCER_VIDEOS catalog", () => {
  it("contains exactly 12 entries (matches the JFP collection)", () => {
    expect(SOCCER_VIDEOS).toHaveLength(12);
  });

  it("has no duplicate ids", () => {
    const ids = SOCCER_VIDEOS.map((v) => v.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every watchUrl is a jesusfilm.org watch URL", () => {
    for (const v of SOCCER_VIDEOS) {
      expect(v.watchUrl).toMatch(
        /^https:\/\/www\.jesusfilm\.org\/watch\/[a-z0-9-]+\.html\/english\.html$/,
      );
    }
  });

  it("every thumbnailUrl is an https image URL", () => {
    for (const v of SOCCER_VIDEOS) {
      expect(v.thumbnailUrl).toMatch(/^https:\/\/.+/);
    }
  });

  it("every durationSeconds is a positive integer", () => {
    for (const v of SOCCER_VIDEOS) {
      expect(Number.isInteger(v.durationSeconds)).toBe(true);
      expect(v.durationSeconds).toBeGreaterThan(0);
    }
  });

  it("COLLECTION_URL points at the upstream JFP collection page", () => {
    expect(COLLECTION_URL).toBe(
      "https://www.jesusfilm.org/watch/soccer_event_collection.html/english.html",
    );
  });
});

describe("HomeVideoCollection i18n", () => {
  it("every SoccerVideo.id has a title and blurb in en.json", () => {
    const items = (
      en as unknown as {
        HomeVideoCollection: {
          items: Record<string, { title: string; blurb: string }>;
        };
      }
    ).HomeVideoCollection.items;
    for (const v of SOCCER_VIDEOS) {
      expect(items[v.id]).toBeDefined();
      expect(items[v.id].title).toBeTruthy();
      expect(items[v.id].blurb).toBeTruthy();
    }
  });
});

describe("formatDuration", () => {
  it("formats sub-minute as M:SS", () => {
    expect(formatDuration(51)).toBe("0:51");
    expect(formatDuration(5)).toBe("0:05");
  });

  it("formats minutes:seconds correctly", () => {
    expect(formatDuration(90)).toBe("1:30");
    expect(formatDuration(450)).toBe("7:30");
  });

  it("formats hour-plus runtimes as H:MM:SS", () => {
    expect(formatDuration(3661)).toBe("1:01:01");
  });

  it("clamps negative input to zero", () => {
    expect(formatDuration(-5)).toBe("0:00");
  });
});

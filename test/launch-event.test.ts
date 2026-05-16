import { describe, expect, it } from "vitest";

import { LAUNCH_EVENT } from "@/lib/launch-event";

describe("LAUNCH_EVENT", () => {
  it("uses the expected Zoom staff registration domain", () => {
    expect(LAUNCH_EVENT.registrationUrl).toMatch(
      /^https:\/\/staffweb\.zoom\.us\/meeting\/register\//,
    );
  });

  it("has a Zoom meeting ID with the documented three-block format", () => {
    expect(LAUNCH_EVENT.meetingId).toMatch(/^\d{3} \d{4} \d{4}$/);
  });

  it("uses a valid ISO 8601 UTC datetime in 2026", () => {
    const d = new Date(LAUNCH_EVENT.dateIso);
    expect(Number.isNaN(d.getTime())).toBe(false);
    expect(d.getUTCFullYear()).toBe(2026);
  });

  it("has a non-zero duration in minutes", () => {
    expect(LAUNCH_EVENT.durationMinutes).toBeGreaterThan(0);
  });
});

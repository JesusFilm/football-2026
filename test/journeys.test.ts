import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { fetchJourneys } from "@/lib/journeys";

type FetchMock = ReturnType<typeof vi.fn>;

function mockFetchResponse(body: unknown): FetchMock {
  const res = new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
  const fn = vi.fn().mockResolvedValue(res);
  vi.stubGlobal("fetch", fn);
  return fn;
}

describe("fetchJourneys", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("extracts the English display name and distinct native name", async () => {
    mockFetchResponse({
      data: {
        journeys: [
          {
            slug: "where-you-belong-africa-french",
            language: {
              id: "496",
              name: [
                {
                  value: "Français",
                  primary: true,
                  language: { id: "496" },
                },
                {
                  value: "French",
                  primary: false,
                  language: { id: "529" },
                },
              ],
            },
          },
        ],
      },
    });

    const journeys = await fetchJourneys("team-id");
    expect(journeys).toHaveLength(1);
    expect(journeys[0]).toEqual({
      slug: "where-you-belong-africa-french",
      language: {
        id: "496",
        english: "French",
        native: "Français",
      },
    });
  });

  it("collapses native name when it matches the English name", async () => {
    mockFetchResponse({
      data: {
        journeys: [
          {
            slug: "where-you-belong-nao-template",
            language: {
              id: "529",
              name: [
                {
                  value: "English",
                  primary: true,
                  language: { id: "529" },
                },
              ],
            },
          },
        ],
      },
    });

    const [journey] = await fetchJourneys("team-id");
    expect(journey.language.english).toBe("English");
    expect(journey.language.native).toBeUndefined();
  });

  it("throws when the GraphQL response contains errors", async () => {
    mockFetchResponse({ errors: [{ message: "bad team" }] });
    await expect(fetchJourneys("bad")).rejects.toThrow(/bad team/);
  });
});

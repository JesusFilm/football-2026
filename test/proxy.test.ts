import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import { proxy } from "@/proxy";

function request(path: string) {
  return new NextRequest(`https://football2026.nextstep.is${path}`);
}

describe("proxy canonical region redirects", () => {
  it("redirects region aliases to canonical ids while preserving query strings", () => {
    const response = proxy(request("/NAmOceania?utm_source=test"));

    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe(
      "https://football2026.nextstep.is/nao?utm_source=test",
    );
  });

  it("leaves canonical region ids alone", () => {
    const response = proxy(request("/nao"));

    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  });
});

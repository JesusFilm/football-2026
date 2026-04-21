import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import { proxy } from "@/proxy";

type NextRequestInit = ConstructorParameters<typeof NextRequest>[1];

function request(path: string, init?: NextRequestInit) {
  return new NextRequest(`https://football2026.nextstep.is${path}`, init);
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
    expect(response.headers.get("x-middleware-rewrite")).toBe(
      "https://football2026.nextstep.is/en/nao",
    );
  });

  it("rewrites unprefixed English home through the internal default locale", () => {
    const response = proxy(request("/"));

    expect(response.status).toBe(200);
    expect(response.headers.get("x-middleware-rewrite")).toBe(
      "https://football2026.nextstep.is/en",
    );
  });

  it("redirects the base route to the locale chosen by cookie", () => {
    const response = proxy(
      request("/?utm_source=test", {
        headers: {
          cookie: "NEXT_LOCALE=ar",
          "accept-language": "es;q=1",
        },
      }),
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://football2026.nextstep.is/ar?utm_source=test",
    );
  });

  it("redirects the base route to the best Accept-Language translation", () => {
    const response = proxy(
      request("/", {
        headers: {
          "accept-language": "pt;q=0.9,en;q=0.8",
        },
      }),
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://football2026.nextstep.is/pt-BR",
    );
  });

  it("keeps English canonical at the base route when English is preferred", () => {
    const response = proxy(
      request("/", {
        headers: {
          cookie: "NEXT_LOCALE=en",
          "accept-language": "es;q=1",
        },
      }),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
    expect(response.headers.get("x-middleware-rewrite")).toBe(
      "https://football2026.nextstep.is/en",
    );
  });

  it("redirects locale-prefixed region aliases while preserving the locale", () => {
    const response = proxy(request("/es/Africa?utm_source=test"));

    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe(
      "https://football2026.nextstep.is/es/africa?utm_source=test",
    );
  });

  it("treats locale-like first segments as locales before region aliases", () => {
    const response = proxy(request("/id"));

    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
    expect(response.headers.get("x-middleware-rewrite")).toBeNull();
  });

  it("redirects prefixed English routes back to canonical unprefixed URLs", () => {
    const response = proxy(request("/en/africa"));

    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe(
      "https://football2026.nextstep.is/africa",
    );
  });
});

import { NextResponse, type NextRequest } from "next/server";

import { getPreferredLocale, localeCookieName } from "@/i18n/locale-preference";
import { defaultLocale, isLocale } from "@/i18n/routing";
import { getRegion } from "@/lib/regions";

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const segments = pathname.split("/").filter(Boolean);

  if (
    segments.includes("opengraph-image") ||
    segments.includes("twitter-image")
  ) {
    return NextResponse.next();
  }

  if (segments.length === 0) {
    const preferredLocale = getPreferredLocale({
      acceptLanguage: request.headers.get("accept-language"),
      cookie: request.cookies.get(localeCookieName)?.value,
    });

    if (preferredLocale !== defaultLocale) {
      const url = request.nextUrl.clone();
      url.pathname = `/${preferredLocale}`;
      url.search = search;
      return NextResponse.redirect(url, 307);
    }
  }

  if (segments[0] === defaultLocale) {
    const url = request.nextUrl.clone();
    const rest = segments.slice(1).join("/");
    url.pathname = rest ? `/${rest}` : "/";
    url.search = search;
    return NextResponse.redirect(url, 308);
  }

  if (segments.length === 1) {
    const [segment] = segments;
    if (!isLocale(segment)) {
      const region = getRegion(segment);
      if (region && segment !== region.id) {
        const url = request.nextUrl.clone();
        url.pathname = `/${region.id}`;
        url.search = search;
        return NextResponse.redirect(url, 308);
      }
    }
  }

  if (segments.length === 2 && isLocale(segments[0])) {
    const [locale, segment] = segments;
    const region = getRegion(segment);
    if (region && segment !== region.id) {
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}/${region.id}`;
      url.search = search;
      return NextResponse.redirect(url, 308);
    }
  }

  if (segments.length === 0 || !isLocale(segments[0])) {
    const url = request.nextUrl.clone();
    url.pathname =
      pathname === "/" ? `/${defaultLocale}` : `/${defaultLocale}${pathname}`;
    url.search = search;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next|.*\\..*|icon.png|apple-icon.png|opengraph-image|twitter-image|robots.txt|sitemap.xml).*)",
  ],
};

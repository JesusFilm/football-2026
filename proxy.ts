import { NextResponse, type NextRequest } from "next/server";

import { getRegion } from "@/lib/regions";

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const segment = pathname.slice(1);

  if (!segment || segment.includes("/")) {
    return NextResponse.next();
  }

  const region = getRegion(segment);
  if (region && segment !== region.id) {
    const url = request.nextUrl.clone();
    url.pathname = `/${region.id}`;
    url.search = search;
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|icon.png|apple-icon.png|opengraph-image|twitter-image|robots.txt|sitemap.xml).*)",
  ],
};

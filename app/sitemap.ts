import type { MetadataRoute } from "next";

import { locales } from "@/i18n/routing";
import { SITE_LAST_MODIFIED, SITE_URL } from "@/lib/site";
import { REGIONS } from "@/lib/regions";
import { getLocalePath, getLocalizedAlternates } from "@/lib/url-utils";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["/", ...REGIONS.map((region) => `/${region.id}`)];

  return [
    ...paths.flatMap((path) =>
      locales.map((locale) => ({
        url: `${SITE_URL}${getLocalePath(locale, path)}`,
        lastModified: SITE_LAST_MODIFIED,
        changeFrequency: "weekly" as const,
        priority: path === "/" ? 1 : 0.8,
        alternates: {
          languages: getLocalizedAlternates(path),
        },
      })),
    ),
  ] satisfies MetadataRoute.Sitemap;
}

import type { MetadataRoute } from "next";

import { SITE_LAST_MODIFIED, SITE_URL } from "@/lib/site";
import { REGIONS } from "@/lib/regions";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: SITE_LAST_MODIFIED,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...REGIONS.map((r) => ({
      url: `${SITE_URL}/${r.id}`,
      lastModified: SITE_LAST_MODIFIED,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}

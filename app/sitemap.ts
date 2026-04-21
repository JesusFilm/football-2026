import type { MetadataRoute } from "next";

import { REGIONS } from "@/lib/regions";

const BASE_URL = "https://football2026.nextstep.is";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...REGIONS.map((r) => ({
      url: `${BASE_URL}/${r.id}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}

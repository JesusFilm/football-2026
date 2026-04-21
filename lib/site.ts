export const SITE_URL = "https://football2026.nextstep.is";
export const SITE_NAME = "Jesus Film Project · World Cup 2026 Activate";
export const DEFAULT_TITLE = "World Cup 2026 · Activate Your Region";
export const DEFAULT_DESCRIPTION =
  "Jesus Film Project Activate — share ready-to-use World Cup 2026 videos in your audience's heart language.";
export const SOCIAL_IMAGE = "/opengraph-image";
export const SITE_LAST_MODIFIED = "2026-04-21";

export const sharedOpenGraph = {
  type: "website" as const,
  siteName: SITE_NAME,
  locale: "en_US",
  images: [
    {
      url: SOCIAL_IMAGE,
      width: 1200,
      height: 630,
      alt: "World Cup 2026 Activate by Jesus Film Project",
    },
  ],
};

export const sharedTwitter = {
  card: "summary_large_image" as const,
  images: [SOCIAL_IMAGE],
};

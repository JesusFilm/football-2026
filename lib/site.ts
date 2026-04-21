export const SITE_URL = "https://football2026.nextstep.is";
export const SITE_NAME = "Jesus Film Project · World Cup 2026 Activate";
export const DEFAULT_TITLE = "World Cup 2026 · Activate Your Region";
export const DEFAULT_DESCRIPTION =
  "Jesus Film Project Activate — share World Cup 2026 videos in the language that matches your audience.";
export const SOCIAL_IMAGE = "/opengraph-image";
export const SITE_LAST_MODIFIED = "2026-04-21";
export const DEFAULT_SOCIAL_ALT =
  "World Cup 2026 Activate by Jesus Film Project";

export function socialImagePath(locale = "en"): string {
  return `/${locale}${SOCIAL_IMAGE}`;
}

export function socialImageUrl(locale = "en"): string {
  return `${SITE_URL}${socialImagePath(locale)}`;
}

export function sharedOpenGraph(
  locale = "en",
  imageAlt = DEFAULT_SOCIAL_ALT,
  siteName = SITE_NAME,
) {
  return {
    type: "website" as const,
    siteName,
    images: [
      {
        url: socialImageUrl(locale),
        width: 1200,
        height: 630,
        alt: imageAlt,
      },
    ],
  };
}

export function sharedTwitter(locale = "en") {
  return {
    card: "summary_large_image" as const,
    images: [socialImageUrl(locale)],
  };
}

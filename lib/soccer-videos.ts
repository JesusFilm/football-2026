// Curated catalog of the 12 short films in the Jesus Film Project
// "Global Football (Soccer) Event" collection, frozen for the World Cup
// 2026 campaign window.
//
// Source of truth at curation time:
//   https://www.jesusfilm.org/watch/soccer_event_collection.html/english.html
//
// Pulled via the Arclight GraphQL gateway
// (https://api-gateway.central.jesusfilm.org) on 2026-05-16 by:
//   query {
//     video(id: "global_soccer_event_collection") {
//       children {
//         id slug title imageAlt images
//         variant { duration downloads { quality url } }
//       }
//     }
//   }
//
// If JFP rotates the collection before the World Cup, a maintainer should
// re-run the same query and update the array below. The shape is stable.
//
// Per AGENTS.md: stable identifiers (slugs, URLs, image URLs, duration)
// live here in lib/, NOT in translations. Titles and blurbs are
// localized via messages/<locale>.json under HomeVideoCollection.items.

export const COLLECTION_URL =
  "https://www.jesusfilm.org/watch/soccer_event_collection.html/english.html";

export type SoccerVideo = {
  /** Stable slug — also the JFP watch URL segment and the i18n key under
   *  HomeVideoCollection.items.<id>. */
  id: string;
  /** Public watch URL on jesusfilm.org (English; JFP offers their own
   *  language switcher on the destination page). */
  watchUrl: string;
  /** Cloudflare Images URL — `mobileCinematicHigh` 1280×600 widescreen. */
  thumbnailUrl: string;
  /** Direct MP4 stream URL (720p MUX). Played inline via <video>. */
  videoUrl: string;
  /** Total runtime in seconds. Surfaced as a M:SS badge. */
  durationSeconds: number;
};

function watchUrl(slug: string): string {
  return `https://www.jesusfilm.org/watch/${slug}.html/english.html`;
}

export const SOCCER_VIDEOS: readonly SoccerVideo[] = [
  {
    id: "wc-praying-hands-cta",
    watchUrl: watchUrl("wc-praying-hands-cta"),
    thumbnailUrl:
      "https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/4fa85cfa-4f3f-402e-ec0f-cc7fc0113100/f=jpg,w=1280,h=600,q=95",
    videoUrl:
      "https://stream.mux.com/66wV3GVJiKqYYIKFtQhKwV02AgKpm00smSn8xJxlSbAko/720p.mp4",
    durationSeconds: 51,
  },
  {
    id: "where-you-belong",
    watchUrl: watchUrl("where-you-belong"),
    thumbnailUrl:
      "https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/2_0-WhereYouBelong.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95",
    videoUrl:
      "https://stream.mux.com/Lkso4KD9wson5ha302KFCM7UJbw6j8Wqb02UzdDwxdNPU/720p.mp4",
    durationSeconds: 90,
  },
  {
    id: "wc-you-can-talk-jesus",
    watchUrl: watchUrl("wc-you-can-talk-jesus"),
    thumbnailUrl:
      "https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/e6397550-4c1a-46cd-82d8-b4b14710d200/f=jpg,w=1280,h=600,q=95",
    videoUrl:
      "https://stream.mux.com/D00y2TyHAjQwTEugG23wWVtRwXjEPgXtNQBGGQ2SvEp00/720p.mp4",
    durationSeconds: 66,
  },
  {
    id: "wc-after-win",
    watchUrl: watchUrl("wc-after-win"),
    thumbnailUrl:
      "https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/4092feae-ad65-4d91-eabc-173c38f04200/f=jpg,w=1280,h=600,q=95",
    videoUrl:
      "https://stream.mux.com/JMqTVj301iWuLmNnD6g012OWzlp1CzRNWetp2afOjCDJI/720p.mp4",
    durationSeconds: 84,
  },
  {
    id: "wc-not-enough-cta",
    watchUrl: watchUrl("wc-not-enough-cta"),
    thumbnailUrl:
      "https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/63a1bac2-7bb0-448a-d101-05c09ed51600/f=jpg,w=1280,h=600,q=95",
    videoUrl:
      "https://stream.mux.com/lPOFPdOMWvusLox6ip102302iuE00Y8UkNcgkyhc01OgLp4/720p.mp4",
    durationSeconds: 140,
  },
  {
    id: "wc-when-joy-is-gone-cta",
    watchUrl: watchUrl("wc-when-joy-is-gone-cta"),
    thumbnailUrl:
      "https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/c107f4fc-a850-4a71-add9-4f75fdb07f00/f=jpg,w=1280,h=600,q=95",
    videoUrl:
      "https://stream.mux.com/RoPpbQCjBfuHse8802iFoaP3I01UHU6L8LYlGwj00F902IQ/720p.mp4",
    durationSeconds: 123,
  },
  {
    id: "wc-ultimate-coach",
    watchUrl: watchUrl("wc-ultimate-coach"),
    thumbnailUrl:
      "https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/2e614395-b7e7-4721-2752-d23a7b079400/f=jpg,w=1280,h=600,q=95",
    videoUrl:
      "https://stream.mux.com/S00piN5TP02qKgUd8Pn02xjXl200GrOxidEheT2PHlg3TW4/720p.mp4",
    durationSeconds: 100,
  },
  {
    id: "wc-most-asked-questions-online",
    watchUrl: watchUrl("wc-most-asked-questions-online"),
    thumbnailUrl:
      "https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/7108ebfb-9450-41b9-15aa-75f384bbd600/f=jpg,w=1280,h=600,q=95",
    videoUrl:
      "https://stream.mux.com/L19dOrA00qmCVVgxQwVOLQ4kLyiL3401UsveE46rW6kP00/720p.mp4",
    durationSeconds: 118,
  },
  {
    id: "falcao-s-story",
    watchUrl: watchUrl("falcao-s-story"),
    thumbnailUrl:
      "https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/4_AIAWC-ThePrize_Falcao-0-0.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95",
    videoUrl:
      "https://stream.mux.com/SBYK00xqT8TsjTZfKP01GwvRDBZw01ylH7Kp00tvP02XwK018/720p.mp4",
    durationSeconds: 315,
  },
  {
    id: "relationship-vs-religion",
    watchUrl: watchUrl("relationship-vs-religion"),
    thumbnailUrl:
      "https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/4_AIAWC-ThePrize_RVR-0-0.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95",
    videoUrl:
      "https://stream.mux.com/e00PRdPok2JffFzWbn02YTn02P1oMm5GdKytt9q72zdHPE/720p.mp4",
    durationSeconds: 340,
  },
  {
    id: "relationship-trumps-fame",
    watchUrl: watchUrl("relationship-trumps-fame"),
    thumbnailUrl:
      "https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/4_AIAWC-ThePrize_RTF-0-0.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95",
    videoUrl:
      "https://stream.mux.com/AGnFKwbP00RHnTtLazJLPst5BtV7IhoI3vHeYIi6OieU/720p.mp4",
    durationSeconds: 229,
  },
  {
    id: "just-an-outside-shot",
    watchUrl: watchUrl("just-an-outside-shot"),
    thumbnailUrl:
      "https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/2_0-Just-An-Outside-Shot.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95",
    videoUrl:
      "https://stream.mux.com/7GJAdMc2tmgF3Oozz8ObKPrOHGowJ5qoECLJ00m4gN9w/720p.mp4",
    durationSeconds: 450,
  },
] as const;

/** Format seconds as "M:SS" (or "H:MM:SS" for runtimes over an hour). */
export function formatDuration(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${m}:${String(s).padStart(2, "0")}`;
}

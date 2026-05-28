// Curated catalog of the 4 Athletes In Action (AIA) YouVersion reading
// plans listed on JFP's Ready-to-Use resources page for the World Cup
// 2026 campaign.
//
// Source of truth at curation time:
//   https://www.jesusfilm.org/resources/strategies/outreach/2026-global-soccer-event-resources/ready-to-use/
// Pulled 2026-05-28.
//
// Each plan links to its YouVersion (bible.com) reading-plan URL.
// Thumbnails are hosted on JFP's WordPress media library.
//
// Per AGENTS.md: stable identifiers (slugs, URLs, image URLs, author
// names, day counts) live here in lib/, NOT in translations. Titles,
// eyebrow labels, and blurbs are localized via messages/<locale>.json
// under HomeYouVersionCollection.items.<id>.

export const YOUVERSION_COLLECTION_URL =
  "https://www.jesusfilm.org/resources/strategies/outreach/2026-global-soccer-event-resources/ready-to-use/";

export type YouVersionPlan = {
  /** Stable slug — matches the i18n key under
   *  HomeYouVersionCollection.items.<id>. */
  id: string;
  /** bible.com reading-plan URL. */
  bibleComUrl: string;
  /** Portrait-friendly thumbnail from JFP's WordPress media. */
  thumbnailUrl: string;
  /** Featured athlete author. */
  author: string;
  /** Plan length in days, surfaced in the card eyebrow. */
  daysCount: number;
};

export const YOUVERSION_PLANS: readonly YouVersionPlan[] = [
  {
    id: "i-belong-to-jesus",
    bibleComUrl: "https://www.bible.com/reading-plans/64628-i-belong-to-jesus",
    thumbnailUrl:
      "https://www.jesusfilm.org/wp-content/uploads/2026/04/f3b374f0cf1d8a01ace12197bff29495864c2e60.jpg",
    author: "Kaká",
    daysCount: 6,
  },
  {
    id: "kingdom-playmaker",
    bibleComUrl:
      "https://www.bible.com/reading-plans/64771-kingdom-playmaker-living-with-intention",
    thumbnailUrl:
      "https://www.jesusfilm.org/wp-content/uploads/2026/04/8fb1bcefec61580acac34863604e71903b86c7c6.jpg",
    author: "Eyong Enoh",
    daysCount: 5,
  },
  {
    id: "fully-his",
    bibleComUrl:
      "https://www.bible.com/reading-plans/67561-fully-his-the-power-of-daily-surrender",
    thumbnailUrl:
      "https://www.jesusfilm.org/wp-content/uploads/2026/04/296f133aa75356e427d4e0738940bcbd4ea22a8c.jpg",
    author: "Jonathan Mensah",
    daysCount: 6,
  },
  {
    id: "tools-for-transformation",
    bibleComUrl:
      "https://www.bible.com/reading-plans/68423-tools-for-transformation",
    thumbnailUrl:
      "https://www.jesusfilm.org/wp-content/uploads/2026/04/1280x720.avif",
    author: "Lucas Moura",
    daysCount: 5,
  },
] as const;

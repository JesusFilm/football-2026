// Curated catalog of the 4 NextSteps journey templates featured at
// https://nextstep.is/football2026/ for the World Cup 2026 campaign.
//
// Source of truth at curation time:
//   https://nextstep.is/football2026/
// Pulled 2026-05-28.
//
// Each entry links to the NextSteps "template" page on
// admin.nextstep.is, where staff and partners can preview the journey
// and clone it into their own customized share URL.
//
// If JFP rotates the football2026 set, a maintainer should re-scrape
// nextstep.is/football2026/ and update the array below.
//
// Per AGENTS.md: stable identifiers (UUIDs, URLs, image URLs) live
// here in lib/, NOT in translations. Titles, eyebrow labels, and
// blurbs are localized via messages/<locale>.json under
// HomeJourneyCollection.items.<id>.

export const JOURNEY_COLLECTION_URL = "https://nextstep.is/football2026/";

export type JourneyTemplate = {
  /** Stable slug — matches the i18n key under
   *  HomeJourneyCollection.items.<id>. */
  id: string;
  /** NextSteps "template" page on admin.nextstep.is — preview + clone. */
  templateUrl: string;
  /** Portrait thumbnail from the NextSteps WordPress media library. */
  thumbnailUrl: string;
};

export const JOURNEYS: readonly JourneyTemplate[] = [
  {
    id: "spiritual-conversation-starter",
    templateUrl:
      "https://admin.nextstep.is/templates/d336c09c-25fd-41f9-8e19-2e944ce16b1b",
    thumbnailUrl: "https://nextstep.is/wp-content/uploads/2026/03/public.webp",
  },
  {
    id: "prayer-connect",
    templateUrl:
      "https://admin.nextstep.is/templates/d941b7f7-621f-4ccc-ad3f-c49d7b53c06d",
    thumbnailUrl:
      "https://nextstep.is/wp-content/uploads/2026/03/public-1.webp",
  },
  {
    id: "gospel-encounter",
    templateUrl:
      "https://admin.nextstep.is/templates/d3c0093f-06a7-4049-9a61-5b3ce7ae14c7",
    thumbnailUrl:
      "https://nextstep.is/wp-content/uploads/2026/03/public-3.webp",
  },
  {
    id: "four-spiritual-laws",
    templateUrl:
      "https://admin.nextstep.is/templates/be24ad2f-81b2-4741-a8ac-1e1819027b15",
    thumbnailUrl:
      "https://nextstep.is/wp-content/uploads/2026/03/public-4.webp",
  },
] as const;

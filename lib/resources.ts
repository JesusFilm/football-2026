// World Cup 2026 outreach resource catalog.
//
// The catalog is frozen at write time — IDs and URLs do not change between
// deploys. Localized titles + blurbs come from `messages/*.json` under
// `Resources.items.<id>.{title,blurb}` so copy stays translatable while
// stable identifiers stay out of translations.
//
// Curation source (snapshot, do not fetch at runtime):
//   https://www.jesusfilm.org/resources/strategies/outreach/2026-global-soccer-event-resources/ready-to-use/
//   https://www.jesusfilm.org/resources/strategies/outreach/2026-global-soccer-event-resources/customizable/
//
// Curated on 2026-05-15. Re-sync manually if the upstream pages change
// before launch.

export type ResourceCategory = "ready-to-use" | "customizable" | "physical-kit";

export type Resource = {
  /** Stable identifier — also the translation key segment. Lowercase, kebab-case. */
  id: string;
  /** External URL the card links to. Opens in a new tab. */
  url: string;
  category: ResourceCategory;
  /** Number of languages the resource is available in. Displayed when present. */
  languageCount?: number;
};

export const RESOURCES: readonly Resource[] = [
  // ── Ready-to-Use ─────────────────────────────────────────────────────
  {
    id: "prayforawin",
    url: "https://prayforawin.com/",
    category: "ready-to-use",
  },
  {
    id: "when-everything",
    url: "https://your.nextstep.is/prayforawinwc",
    category: "ready-to-use",
  },
  {
    id: "where-you-belong",
    url: "https://your.nextstep.is/youbelong",
    category: "ready-to-use",
    languageCount: 76,
  },
  {
    id: "i-belong-jesus",
    url: "https://www.bible.com/reading-plans/64628-i-belong-to-jesus",
    category: "ready-to-use",
  },
  {
    id: "kingdom-playmaker",
    url: "https://www.bible.com/reading-plans/64771-kingdom-playmaker-living-with-intention",
    category: "ready-to-use",
  },
  {
    id: "fully-his",
    url: "https://www.bible.com/reading-plans/67561-fully-his-the-power-of-daily-surrender",
    category: "ready-to-use",
  },
  {
    id: "tools-transformation",
    url: "https://www.bible.com/reading-plans/68423-tools-for-transformation",
    category: "ready-to-use",
  },

  // ── Customizable ─────────────────────────────────────────────────────
  {
    id: "nextsteps-templates",
    url: "https://nextstep.is/world-cup/",
    category: "customizable",
  },
  {
    id: "hope-ball-not-enough",
    url: "https://dam.jesusfilm.org/shared/collections/5a6c3aa6-670b-4631-9a5e-3402b6f42cac",
    category: "customizable",
  },
  {
    id: "hope-ball-joy-gone",
    url: "https://dam.jesusfilm.org/shared/collections/cee8975c-1212-4708-a83f-e3b5f2e6ff4b",
    category: "customizable",
  },
  {
    id: "praying-hands-prayer",
    url: "https://dam.jesusfilm.org/shared/collections/f0f3b948-baaa-481b-bc48-3afe3dab07f1",
    category: "customizable",
  },
  {
    id: "praying-hands-talk-jesus",
    url: "https://dam.jesusfilm.org/shared/collections/944bb2bf-c6ee-42f7-8158-f51cb12f2ff0",
    category: "customizable",
  },
  {
    id: "ultimate-coach",
    url: "https://dam.jesusfilm.org/shared/collections/b84f3b48-f5e0-46d8-831e-d9fbac5bbd76",
    category: "customizable",
  },
  {
    id: "most-asked-questions",
    url: "https://dam.jesusfilm.org/shared/collections/3abbc203-7d86-4659-b492-aedf10dbcca6",
    category: "customizable",
  },
  {
    id: "after-the-win",
    url: "https://dam.jesusfilm.org/shared/collections/fb006fdf-733b-44e3-af0e-df195eec78a3",
    category: "customizable",
  },
  {
    id: "print-collection",
    url: "https://dam.jesusfilm.org/shared/collections/a58c576c-5333-4992-9b3d-42d0a794054a",
    category: "customizable",
  },
  {
    id: "all-videos",
    url: "https://www.jesusfilm.org/watch/soccer_event_collection.html/english.html",
    category: "customizable",
  },

  // ── Physical Kits ────────────────────────────────────────────────────
  {
    id: "watch-party-kit",
    url: "https://victorybeyondthecup.com/keyplayer",
    category: "physical-kit",
  },
  {
    id: "movement-maker-kit",
    url: "https://jesuslovesyouball.com/athletesinaction/#mission",
    category: "physical-kit",
  },
  {
    id: "jesus-loves-you-ball",
    url: "https://jesuslovesyouball.com/athletesinaction/",
    category: "physical-kit",
  },
] as const;

export const RESOURCE_CATEGORIES_IN_ORDER: readonly ResourceCategory[] = [
  "ready-to-use",
  "customizable",
  "physical-kit",
];

export function resourcesByCategory(
  category: ResourceCategory,
): readonly Resource[] {
  return RESOURCES.filter((resource) => resource.category === category);
}

export function getResourceById(id: string): Resource | undefined {
  return RESOURCES.find((resource) => resource.id === id);
}

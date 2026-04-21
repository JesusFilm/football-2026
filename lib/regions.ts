export const JSONBIN_REGION_CODES = [
  "Africa",
  "East Asia",
  "Europe",
  "LAC",
  "NAMESTAN",
  "NAmOceania",
  "SESA",
] as const;

export type JsonbinRegionCode = (typeof JSONBIN_REGION_CODES)[number];

export type Region = {
  id: string;
  code: JsonbinRegionCode;
  displayCode: string;
  teamId: string;
  name: string;
  blurb: string;
  flags: string[];
};

export const REGIONS: Region[] = [
  {
    id: "nao",
    code: "NAmOceania",
    displayCode: "NAO",
    teamId: "ac6991e8-02e2-45fc-8ec4-db4a6219777b",
    name: "North America & Oceania",
    blurb: "United States, Canada, Australia, New Zealand & the Pacific.",
    flags: ["🇺🇸", "🇨🇦", "🇦🇺", "🇳🇿", "🇫🇯"],
  },
  {
    id: "namestan",
    code: "NAMESTAN",
    displayCode: "NAMESTAN",
    teamId: "9615769e-cae6-4195-9653-94a3a85aeb8c",
    name: "North Africa, Middle East & Central Asia",
    blurb: "Morocco to Kazakhstan — 22 countries across three continents.",
    flags: ["🇲🇦", "🇪🇬", "🇸🇦", "🇮🇷", "🇰🇿"],
  },
  {
    id: "lac",
    code: "LAC",
    displayCode: "LAC",
    teamId: "52d33887-e8f4-498e-a970-9f0dde0aac2e",
    name: "Latin America & Caribbean",
    blurb:
      "From Tijuana to Tierra del Fuego — a continent unified by football.",
    flags: ["🇧🇷", "🇦🇷", "🇨🇴", "🇲🇽", "🇨🇱"],
  },
  {
    id: "europe",
    code: "Europe",
    displayCode: "EUR",
    teamId: "5b4f4e32-36f3-48d5-a282-c25a395a9858",
    name: "Europe",
    blurb: "The continent where the modern game was written.",
    flags: ["🇬🇧", "🇫🇷", "🇩🇪", "🇪🇸", "🇮🇹"],
  },
  {
    id: "sesa",
    code: "SESA",
    displayCode: "SESA",
    teamId: "029e30eb-4ae3-4e94-a803-3552206fa99b",
    name: "South & South East Asia",
    blurb: "From Mumbai to Manila — home to a quarter of the world's people.",
    flags: ["🇮🇳", "🇮🇩", "🇵🇭", "🇻🇳", "🇹🇭"],
  },
  {
    id: "east-asia",
    code: "East Asia",
    displayCode: "EA",
    teamId: "8edb9a03-5e5a-4c11-96ab-530a1dfed384",
    name: "East Asia",
    blurb: "China, Japan, Korea, Mongolia — the heart of the Pacific rim.",
    flags: ["🇨🇳", "🇯🇵", "🇰🇷", "🇲🇳", "🇹🇼"],
  },
  {
    id: "africa",
    code: "Africa",
    displayCode: "AFR",
    teamId: "f73ae713-cf8e-446b-8cb2-45228edfd69e",
    name: "Sub-Saharan Africa",
    blurb: "Fifty-four nations. Two thousand languages. One game.",
    flags: ["🇳🇬", "🇿🇦", "🇰🇪", "🇬🇭", "🇪🇹"],
  },
];

function normalizeRegionRouteValue(value: string): string {
  const decoded = (() => {
    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  })();

  return decoded
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getRegion(id: string): Region | undefined {
  const normalizedId = normalizeRegionRouteValue(id);

  return REGIONS.find((region) => {
    const aliases = [
      region.id,
      region.code,
      region.displayCode,
      region.name,
      region.name.replace(/^Sub-Saharan /, ""),
    ];

    return aliases.some(
      (alias) => normalizeRegionRouteValue(alias) === normalizedId,
    );
  });
}

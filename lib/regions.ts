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
  seoDescription: string;
  flagCodes: { countryCode: string; label: string }[];
};

export const REGIONS: Region[] = [
  {
    id: "africa",
    code: "Africa",
    displayCode: "AFR",
    teamId: "f73ae713-cf8e-446b-8cb2-45228edfd69e",
    name: "Africa",
    blurb:
      "Across Africa's activation region. Hundreds of languages. One game.",
    seoDescription:
      "World Cup 2026 outreach tools for Africa: share videos in local languages and track country-level views.",
    flagCodes: [
      { countryCode: "ng", label: "Nigeria" },
      { countryCode: "za", label: "South Africa" },
      { countryCode: "ke", label: "Kenya" },
      { countryCode: "gh", label: "Ghana" },
      { countryCode: "et", label: "Ethiopia" },
    ],
  },
  {
    id: "east-asia",
    code: "East Asia",
    displayCode: "EA",
    teamId: "8edb9a03-5e5a-4c11-96ab-530a1dfed384",
    name: "East Asia",
    blurb: "China, Japan, Korea, Mongolia — the heart of the Pacific rim.",
    seoDescription:
      "Activate East Asia for World Cup 2026 with regional Jesus Film Project videos, QR codes, share links, and view tracking.",
    flagCodes: [
      { countryCode: "cn", label: "China" },
      { countryCode: "jp", label: "Japan" },
      { countryCode: "kr", label: "Korea" },
      { countryCode: "mn", label: "Mongolia" },
      { countryCode: "tw", label: "Taiwan" },
    ],
  },
  {
    id: "europe",
    code: "Europe",
    displayCode: "EUR",
    teamId: "5b4f4e32-36f3-48d5-a282-c25a395a9858",
    name: "Europe",
    blurb: "The continent where the modern game was written.",
    seoDescription:
      "Activate Europe during World Cup 2026 with Jesus Film Project videos, QR codes, share links, and regional view data.",
    flagCodes: [
      { countryCode: "gb", label: "United Kingdom" },
      { countryCode: "fr", label: "France" },
      { countryCode: "de", label: "Germany" },
      { countryCode: "es", label: "Spain" },
      { countryCode: "it", label: "Italy" },
    ],
  },
  {
    id: "lac",
    code: "LAC",
    displayCode: "LAC",
    teamId: "52d33887-e8f4-498e-a970-9f0dde0aac2e",
    name: "Latin America & Caribbean",
    blurb:
      "From Tijuana to Tierra del Fuego — a continent unified by football.",
    seoDescription:
      "World Cup 2026 outreach tools for Latin America & Caribbean: share regional videos, QR codes, and local-language journeys.",
    flagCodes: [
      { countryCode: "br", label: "Brazil" },
      { countryCode: "ar", label: "Argentina" },
      { countryCode: "co", label: "Colombia" },
      { countryCode: "mx", label: "Mexico" },
      { countryCode: "cl", label: "Chile" },
    ],
  },
  {
    id: "namestan",
    code: "NAMESTAN",
    displayCode: "NAMESTAN",
    teamId: "9615769e-cae6-4195-9653-94a3a85aeb8c",
    name: "North Africa, Middle East & Central Asia",
    blurb: "Morocco to Kazakhstan — across three continents.",
    seoDescription:
      "Activate North Africa, the Middle East & Central Asia with World Cup 2026 videos, QR codes, and local-language sharing tools.",
    flagCodes: [
      { countryCode: "ma", label: "Morocco" },
      { countryCode: "eg", label: "Egypt" },
      { countryCode: "sa", label: "Saudi Arabia" },
      { countryCode: "ir", label: "Iran" },
      { countryCode: "kz", label: "Kazakhstan" },
    ],
  },
  {
    id: "nao",
    code: "NAmOceania",
    displayCode: "NAO",
    teamId: "ac6991e8-02e2-45fc-8ec4-db4a6219777b",
    name: "North America & Oceania",
    blurb: "United States, Canada, Australia, New Zealand & the Pacific.",
    seoDescription:
      "World Cup 2026 outreach tools for North America & Oceania: share local-language videos, QR codes, and regional view data.",
    flagCodes: [
      { countryCode: "us", label: "United States" },
      { countryCode: "ca", label: "Canada" },
      { countryCode: "au", label: "Australia" },
      { countryCode: "nz", label: "New Zealand" },
      { countryCode: "fj", label: "Fiji" },
    ],
  },
  {
    id: "sesa",
    code: "SESA",
    displayCode: "SESA",
    teamId: "029e30eb-4ae3-4e94-a803-3552206fa99b",
    name: "South & South East Asia",
    blurb: "From Mumbai to Manila — home to a quarter of the world's people.",
    seoDescription:
      "World Cup 2026 outreach tools for South & South East Asia: share local-language videos across a high-reach region.",
    flagCodes: [
      { countryCode: "in", label: "India" },
      { countryCode: "id", label: "Indonesia" },
      { countryCode: "ph", label: "Philippines" },
      { countryCode: "vn", label: "Vietnam" },
      { countryCode: "th", label: "Thailand" },
    ],
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
      region.id === "africa" ? "Sub-Saharan Africa" : "",
    ];

    return aliases.some(
      (alias) => normalizeRegionRouteValue(alias) === normalizedId,
    );
  });
}

export function getRegionById(id: string): Region | undefined {
  return REGIONS.find((region) => region.id === id);
}

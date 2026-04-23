const ENGLISH_LANGUAGE_ID = "529";
const GRAPHQL_ENDPOINT =
  process.env.GRAPHQL_ENDPOINT ?? "https://api-gateway.central.jesusfilm.org";

const QUERY = /* GraphQL */ `
  query GetJourneys($teamId: String!) {
    journeys(where: { teamId: $teamId, template: false }) {
      slug
      language {
        id
        bcp47
        name(languageId: "${ENGLISH_LANGUAGE_ID}", primary: true) {
          value
          primary
          language {
            id
          }
        }
      }
    }
  }
`;

type RawName = {
  value: string;
  primary: boolean;
  language: { id: string };
};

type RawJourney = {
  slug: string;
  language: {
    id: string;
    bcp47?: string | null;
    name: RawName[];
  };
};

type RawResponse = {
  data?: { journeys: RawJourney[] };
  errors?: { message: string }[];
};

export type JourneyLanguage = {
  /** Stable per-language ID from the GraphQL API. */
  id: string;
  /** BCP 47 language code, when provided by the GraphQL API. */
  bcp47?: string;
  /** English name of the language — display primary (e.g. "Spanish"). */
  english: string;
  /** Native name, if distinct from English (e.g. "Español"). */
  native?: string;
};

export type Journey = {
  slug: string;
  language: JourneyLanguage;
};

function normalizeJourney(raw: RawJourney): Journey {
  const names = raw.language.name;
  const english =
    names.find((n) => n.language.id === ENGLISH_LANGUAGE_ID && !n.primary)
      ?.value ??
    names.find((n) => n.language.id === ENGLISH_LANGUAGE_ID)?.value ??
    names[0]?.value ??
    "";
  const primary = names.find((n) => n.primary)?.value;
  const native = primary && primary !== english ? primary : undefined;

  return {
    slug: raw.slug,
    language: {
      id: raw.language.id,
      bcp47: raw.language.bcp47 ?? undefined,
      english,
      native,
    },
  };
}

/**
 * Fetch journeys for a team. Cached for an hour per teamId via the Next.js
 * Data Cache — the fetch is tagged so we can revalidate on demand if needed.
 */
export async function fetchJourneys(teamId: string): Promise<Journey[]> {
  const res = await fetch(GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: QUERY, variables: { teamId } }),
    next: {
      revalidate: 3600,
      tags: [`journeys:${teamId}`],
    },
  });

  if (!res.ok) {
    throw new Error(`Journeys request failed: ${res.status} ${res.statusText}`);
  }

  const json = (await res.json()) as RawResponse;
  if (json.errors?.length) {
    throw new Error(
      `Journeys query errors: ${json.errors.map((e) => e.message).join("; ")}`,
    );
  }

  return (json.data?.journeys ?? []).map(normalizeJourney);
}

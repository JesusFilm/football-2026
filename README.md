# Football 2026

World Cup 2026 Activate is a campaign microsite for Jesus Film Project. It helps regional teams share localized NextSteps journeys, QR codes, and country-level view data for their activation region.

The production site is configured for:

- Public URL: `https://football2026.nextstep.is`
- Framework: Next.js 16 App Router
- Runtime target: self-hosted Next standalone output
- Package manager: `pnpm@10.33.0`
- Deployment: Railway using Railpack

## What The App Does

The app has one homepage and one canonical page per activation region in English:

- `/`
- `/africa`
- `/east-asia`
- `/europe`
- `/lac`
- `/namestan`
- `/nao`
- `/sesa`

The homepage introduces the activation flow and links to every region. Region pages show the regional activation copy, localized journey sharing panel, QR/share tooling, country-level journey view data, and links to the other regions.

Aliases such as `/Europe`, `/EA`, or `/north-africa-middle-east-central-asia` are normalized through `proxy.ts` and redirected to canonical route IDs when they map to a known region.

Non-English routes are locale-prefixed, for example `/es` and `/es/africa`. English remains canonical at the unprefixed routes rather than `/en`. Supported locales are configured in `i18n/routing.ts`: `en`, `zh-Hans`, `hi`, `es`, `fr`, `ar`, `pt-BR`, `bn`, `ru`, `ur`, `id`, and `de`.

## Repository Map

```text
app/                  Next.js App Router routes, metadata, icons, robots, sitemap
components/           React UI components for home, region, sharing, maps, and layout
lib/                  Region config, journey fetching, country-view normalization, SEO constants
public/               Static brand and visual assets
test/                 Vitest unit and component tests
docs/brainstorms/     Product framing and requirements notes
docs/plans/           Implementation and deployment plans
docs/seo/             SEO audit and launch verification notes
railway.json          Railway config-as-code for Railpack deployment
```

Useful entry points:

- `app/[locale]/page.tsx` builds localized homepages.
- `app/[locale]/[id]/page.tsx` builds localized region pages.
- `i18n/routing.ts` defines supported locales, locale labels, and text direction.
- `messages/*.json` holds translation messages; every locale file must match the English key structure.
- `lib/regions.ts` defines canonical region IDs, JSONBin region codes, and NextSteps team IDs.
- `lib/journeys.ts` fetches journeys from the Jesus Film API by team ID.
- `lib/country-views.ts` fetches and normalizes the public JSONBin country-view data.
- `lib/country-display.ts` resolves JSONBin country names to country codes and formats localized country names.
- `lib/site.ts` owns public URL, metadata defaults, and social image defaults.

## Prerequisites

Use Node.js with Corepack enabled so the pinned pnpm version is honored:

```bash
corepack enable
pnpm install
```

Do not use npm, Yarn, or Bun for this repo. The lockfile is `pnpm-lock.yaml`, and `package.json` pins `pnpm@10.33.0`.

## Local Development

Start the dev server:

```bash
pnpm dev
```

Then open:

```text
http://localhost:3000
```

The app does not require local environment variables for the current production behavior. It uses public defaults for external data:

- Journeys GraphQL endpoint: `https://api-gateway.central.jesusfilm.org`
- Country views JSONBin endpoint: configured in `lib/country-views.ts`

To test a different journeys endpoint locally, set:

```bash
GRAPHQL_ENDPOINT=https://example.test pnpm dev
```

## Scripts

```bash
pnpm dev            # Run Next.js locally in development mode
pnpm build          # Build the production Next.js standalone app
pnpm start          # Run .next/standalone/server.js on 0.0.0.0
pnpm lint           # Run ESLint
pnpm lint:fix       # Apply ESLint fixes
pnpm format         # Format with Prettier
pnpm format:check   # Check Prettier formatting
pnpm typegen        # Generate Next.js route and app type declarations
pnpm typecheck      # Run TypeScript without emitting files
pnpm test           # Run Vitest in watch mode
pnpm test:run       # Run Vitest once
pnpm test:coverage  # Run Vitest with coverage
```

Pre-commit hooks run `lint-staged`, which formats staged files and applies ESLint fixes to staged JavaScript and TypeScript.

## Production Build Locally

Railway runs the same basic path this repo can run locally:

```bash
pnpm build
PORT=3000 pnpm start
```

Then check:

```bash
curl -I http://localhost:3000/
curl -I http://localhost:3000/robots.txt
curl -I http://localhost:3000/sitemap.xml
```

The production build depends on two pieces working together:

- `next.config.ts` sets `output: "standalone"`, which makes Next emit `.next/standalone/server.js`.
- `package.json` has a `postbuild` script that copies `public/` and `.next/static/` into the standalone output so the self-hosted server can serve assets correctly.

## Deployment

Deployment is configured through `railway.json`:

```json
{
  "build": {
    "builder": "RAILPACK",
    "buildCommand": "pnpm build"
  },
  "deploy": {
    "startCommand": "pnpm start",
    "healthcheckPath": "/",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE"
  }
}
```

How Railway deploys this app:

1. Railway detects the root app and uses Railpack because `railway.json` sets `build.builder` to `RAILPACK`.
2. Railpack installs dependencies with pnpm from `pnpm-lock.yaml`.
3. Railway runs `pnpm build`.
4. Next emits a standalone server because `next.config.ts` sets `output: "standalone"`.
5. `postbuild` copies static and public assets into `.next/standalone`.
6. Railway starts the app with `pnpm start`.
7. `pnpm start` runs `HOSTNAME=0.0.0.0 node .next/standalone/server.js`, which binds the server to the container interface Railway expects.
8. Railway checks `/` as the healthcheck route and restarts on failure.

There is intentionally no Dockerfile. Adding one would change Railway's builder path away from the current Railpack setup.

## Production Verification

After a deploy, smoke-test the public site:

```bash
curl -I https://football2026.nextstep.is/
curl -I https://football2026.nextstep.is/robots.txt
curl -I https://football2026.nextstep.is/sitemap.xml
curl -I https://football2026.nextstep.is/africa
curl -I https://football2026.nextstep.is/Europe
```

Expected behavior:

- `/`, `/robots.txt`, `/sitemap.xml`, and canonical region routes return success responses.
- Known aliases redirect permanently to canonical route IDs.
- Unknown region IDs return `404`.
- The sitemap includes the homepage plus the seven canonical region pages.

For launch or SEO-sensitive changes, also verify:

- Open Graph and Twitter image metadata render on home and region pages.
- JSON-LD scripts are valid JSON.
- Country-view summaries are visible in the initial rendered HTML.
- The production site matches the canonical URL in `lib/site.ts`.

## Quality Gate

Run the full gate before handing off source, config, or test changes:

```bash
pnpm lint
pnpm format:check
pnpm typecheck
pnpm test:run
pnpm build
```

For quick iteration:

```bash
pnpm lint:fix
pnpm test:run
```

Documentation-only edits usually only need `pnpm format:check`, unless they also change code examples, scripts, or deployment instructions that should be verified manually.

## Data And Caching

Journey data:

- Fetched in `lib/journeys.ts`.
- Uses the region's `teamId` from `lib/regions.ts`.
- Requests the Jesus Film GraphQL API.
- Uses Next.js Data Cache with `revalidate: 3600`.
- Throws on failed GraphQL responses; region pages catch failures and continue with an empty journey list.

Country-view data:

- Fetched in `lib/country-views.ts`.
- Uses the public JSONBin payload.
- Treats JSONBin region codes as the source of truth for country-view membership.
- Filters aggregate rows, `Error`, `Unknown`, and rows without usable country identity.
- Sorts by journey views descending, then country name.
- Uses Next.js Data Cache with `revalidate: 3600`.
- Returns an unavailable state instead of throwing when the JSONBin request fails.

Region configuration:

- Route IDs and friendly display names are app-controlled in `lib/regions.ts`.
- Country-view membership comes from JSONBin region labels such as `Africa`, `East Asia`, `Europe`, `LAC`, `NAMESTAN`, `NAmOceania`, and `SESA`.
- The `Other/Unknown` JSONBin bucket is recognized as data context but is not rendered as a normal activation region.

## SEO And Public Routes

The app uses Next metadata routes and generated images:

- `app/sitemap.ts` emits the canonical sitemap.
- `app/robots.ts` allows crawling and points to the sitemap.
- `app/opengraph-image.tsx` and `app/twitter-image.tsx` generate social preview images.
- `app/[locale]/layout.tsx` defines locale-aware metadata, document `lang`/`dir`, and Organization/WebSite JSON-LD.
- `app/[locale]/[id]/page.tsx` defines region-specific metadata and WebPage/Breadcrumb JSON-LD.

Keep `SITE_URL` in `lib/site.ts` aligned with the production domain. Metadata, sitemap, robots, structured data, and social previews all depend on it.

## Working Productively With An Agent

This repo is intentionally friendly to coding agents. The best results come from giving your agent a clear goal, pointing it at the relevant files or docs, and asking it to verify the change before handoff.

Good agent prompts:

```text
Add a new region card interaction. Read AGENTS.md first, inspect the existing region components, make the change, and run the narrowest useful tests.
```

```text
Investigate why country-view data is missing for a region. Start with lib/country-views.ts and app/[locale]/[id]/page.tsx, explain the root cause, patch it, and run focused tests.
```

```text
Update the Railway deployment docs after changing package scripts. Verify README, railway.json, package.json, and the local production build all agree.
```

Helpful habits:

- Ask the agent to inspect before editing.
- Mention whether you want a brainstorm, a plan, an implementation, or a review.
- For cross-file or architectural work, ask it to create or update a plan in `docs/plans/`.
- For ambiguous product direction, ask it to capture requirements in `docs/brainstorms/`.
- For a non-obvious solved problem, ask it to record the reusable lesson in `docs/solutions/`.
- Ask it to use existing scripts from `package.json` instead of inventing commands.
- Ask it to summarize verification with exact commands and any relevant failures.

The local agent instructions live in `AGENTS.md`. They tell agents to use pnpm, prefer `rg` for inspection, preserve generated folders, and run the standard quality gate when appropriate.

## Common Tasks

Add or edit a region:

1. Update `lib/regions.ts`.
2. Confirm the `id` is the canonical URL segment.
3. Confirm `code` matches the JSONBin region label used for country views.
4. Confirm `teamId` is the NextSteps team ID used by the journeys API.
5. Update tests that assert region inventory or route behavior.

Change the production domain:

1. Update `SITE_URL` in `lib/site.ts`.
2. Confirm Railway custom domain settings point to the same host.
3. Run `pnpm build`.
4. Verify `/robots.txt`, `/sitemap.xml`, canonical metadata, and social image URLs.

Change deployment behavior:

1. Update `package.json`, `next.config.ts`, or `railway.json`.
2. Keep Railway's build command and start command aligned with local scripts.
3. Run `pnpm build`.
4. Run `PORT=3000 pnpm start` and smoke-test `/`, `/robots.txt`, and `/sitemap.xml`.
5. Update this README and any relevant plan in `docs/plans/`.

## Troubleshooting

If `pnpm start` cannot find `.next/standalone/server.js`, confirm `next.config.ts` still includes:

```ts
output: "standalone";
```

Then rebuild with:

```bash
pnpm build
```

If assets are missing in production mode, confirm the `postbuild` script copied both `public/` and `.next/static/` into `.next/standalone`.

If journey cards are empty, check the GraphQL endpoint, the region `teamId`, and whether `fetchJourneys` is throwing. Region pages intentionally continue rendering if journeys fail.

If country-view data is unavailable, inspect the JSONBin response shape and `normalizeCountryViewsRows`. The page should show an unavailable state instead of crashing.

If aliases do not redirect as expected, inspect `proxy.ts` and `getRegion` in `lib/regions.ts`.

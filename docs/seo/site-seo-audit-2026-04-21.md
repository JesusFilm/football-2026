---
date: 2026-04-21
status: complete
source_plan: docs/plans/2026-04-21-003-chore-site-seo-review-plan.md
site: https://football2026.nextstep.is
---

# Site SEO Audit

## Executive Summary

The site has a solid SEO foundation for a small campaign app: the intended public route set is clear, the homepage links to all canonical region pages with crawlable anchors, valid routes return `200`, unknown routes return `404`, `/robots.txt` allows crawling, `/sitemap.xml` lists the intended eight canonical URLs, and every indexable page has a unique title, description, canonical URL, and single `<h1>`.

The highest-impact fixes are concentrated in four areas:

- Canonical alias handling: several non-sitemap region aliases return `200` instead of redirecting or 404ing.
- Social metadata completeness: region pages drop inherited Open Graph fields, and no page emits an OG/Twitter image.
- Crawler-visible content: country-view data renders only after client-side intersection/scroll, so crawlers and non-scrolling previews initially see the heading but not the country list.
- Production startup: the current `pnpm start` script points at `.next/standalone/server.js`, but the audited build did not produce that file.

No evidence was found of blocked public pages, accidental `noindex`, multiple `<h1>` elements, uncrawlable homepage region links, invalid JSON-LD syntax, or missing sitemap/robots endpoints.

## Implementation Status

Resolved in the follow-up SEO fix pass:

- F1: canonical route case variants now redirect through `proxy.ts`, and non-ID aliases are rejected by canonical region page lookup.
- F2: sitemap `lastModified` now uses a stable site date instead of `new Date()`.
- F3: `pnpm build && pnpm start` now serves the standalone bundle locally.
- F4-F5: shared Open Graph/Twitter metadata and generated social image routes are present.
- F6: region metadata descriptions now use region-specific SEO descriptions.
- F8-F10: country-view summaries and sibling region links are visible in initial page HTML.
- F12: homepage and region pages now emit page-level JSON-LD in addition to Organization/WebSite data.
- F14: the external journey iframe is deferred until the user requests a video preview.

## Audit Method

Commands and tools used:

- `pnpm build`
- `PORT=3000 pnpm start`
- `PORT=3000 pnpm exec next start -H 127.0.0.1`
- `curl` / `fetch` checks against local production build
- `jsdom` parsing of returned HTML
- Playwright Chromium checks for hydrated DOM, scroll-triggered content, and local navigation/resource timing
- Source inspection of `app/layout.tsx`, `app/[id]/page.tsx`, `app/page.tsx`, `app/sitemap.ts`, `app/robots.ts`, `lib/regions.ts`, and relevant components

External baseline:

- Google Search Central SEO Starter Guide: crawlability, duplicate content, snippets, and page understanding.
- Google Search Central link best practices: crawlable links should use `<a href>`.
- Google Search Central structured data docs: validate JSON-LD with Rich Results Test and keep structured data accurate.
- Next.js Metadata API docs: nested metadata is shallow-merged, so route-level `openGraph` objects replace inherited nested fields.
- Next.js sitemap and robots metadata route docs.

Lighthouse was not installed in the repo, so this pass used Playwright timing/resource inspection locally and leaves PageSpeed/Lighthouse as production verification.

## Page Inventory

| Route        | Status | Canonical                                    | Title                                                                           | Description status | H1                                                  | Intended indexability |
| ------------ | -----: | -------------------------------------------- | ------------------------------------------------------------------------------- | ------------------ | --------------------------------------------------- | --------------------- |
| `/`          |    200 | `https://football2026.nextstep.is`           | `World Cup 2026 · Activate Your Region`                                         | Unique             | `Activate Your Region`                              | Index                 |
| `/nao`       |    200 | `https://football2026.nextstep.is/nao`       | `Activate North America & Oceania · Activate · World Cup 2026`                  | Unique             | `Activate North America & Oceania`                  | Index                 |
| `/namestan`  |    200 | `https://football2026.nextstep.is/namestan`  | `Activate North Africa, Middle East & Central Asia · Activate · World Cup 2026` | Unique             | `Activate North Africa, Middle East & Central Asia` | Index                 |
| `/lac`       |    200 | `https://football2026.nextstep.is/lac`       | `Activate Latin America & Caribbean · Activate · World Cup 2026`                | Unique             | `Activate Latin America & Caribbean`                | Index                 |
| `/europe`    |    200 | `https://football2026.nextstep.is/europe`    | `Activate Europe · Activate · World Cup 2026`                                   | Unique             | `Activate Europe`                                   | Index                 |
| `/sesa`      |    200 | `https://football2026.nextstep.is/sesa`      | `Activate South & South East Asia · Activate · World Cup 2026`                  | Unique             | `Activate South & South East Asia`                  | Index                 |
| `/east-asia` |    200 | `https://football2026.nextstep.is/east-asia` | `Activate East Asia · Activate · World Cup 2026`                                | Unique             | `Activate East Asia`                                | Index                 |
| `/africa`    |    200 | `https://football2026.nextstep.is/africa`    | `Activate Sub-Saharan Africa · Activate · World Cup 2026`                       | Unique             | `Activate Sub-Saharan Africa`                       | Index                 |

## Route and Crawl Findings

| ID  | Severity       | Finding                                                              | Evidence                                                                                                                                                                                                                                            | Recommended fix                                                                                                                                                                                                       | Owner files                                                                | Verification                                                                                                                                               |
| --- | -------------- | -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F1  | P1             | Non-canonical aliases return `200`, creating duplicate URL variants. | Local production responses: `/NAO` -> `200` with canonical `/nao`; `/Europe` -> `200` with canonical `/europe`; `/sub-saharan-africa` -> `200` with canonical `/africa`. `/north-america-oceania` returned `404`.                                   | Prefer permanent redirects from accepted aliases to `/${region.id}`. If aliases are not intentional public entry points, make `app/[id]/page.tsx` only accept `region.id` values and return `notFound()` for aliases. | `lib/regions.ts`, `app/[id]/page.tsx`, optional `next.config.ts` redirects | Request alias URLs and verify `308` to canonical route, or `404` if aliases are intentionally unsupported. Confirm sitemap still lists only canonical IDs. |
| F2  | P2             | Sitemap is correct in membership, but `lastModified` is volatile.    | `/sitemap.xml` listed exactly the homepage plus seven region routes, but all `<lastmod>` values were the build/runtime timestamp from `new Date()` in `app/sitemap.ts`.                                                                             | Use a meaningful stable date per route, remove `lastModified`, or source it from real content/deploy metadata. Avoid implying every page changed whenever the sitemap is regenerated.                                 | `app/sitemap.ts`                                                           | Rebuild twice without content changes and confirm unchanged URLs do not receive misleading new `<lastmod>` values.                                         |
| F3  | P0 operational | `pnpm start` failed for the audited build.                           | `pnpm start` ran `node .next/standalone/server.js` and failed with `MODULE_NOT_FOUND`; `.next/standalone/server.js` was absent after `pnpm build`. `next start` served the build but warned that it should not be used with `output: "standalone"`. | Resolve the deployment/start command before production launch. Either make standalone output reliably produce `.next/standalone/server.js`, or adjust start/deploy config to match the actual Next.js build output.   | `next.config.ts`, `package.json`, `railway.json`                           | Run `pnpm build && pnpm start` locally and in Railway; verify the app responds with `200` for `/`, `/robots.txt`, and `/sitemap.xml`.                      |

## Metadata and Search Appearance Findings

| ID  | Severity | Finding                                                                                                                        | Evidence                                                                                                                                                                          | Recommended fix                                                                                                                                                                                                                                                               | Owner files                                                                                          | Verification                                                                                                                                            |
| --- | -------- | ------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F4  | P1       | Region pages overwrite inherited Open Graph fields.                                                                            | Homepage includes `og:site_name` and `og:locale`; region pages do not. This matches Next.js shallow merge behavior because `generateMetadata()` sets a nested `openGraph` object. | Define shared Open Graph defaults and spread them into route-level metadata, or explicitly include `siteName`, `locale`, and any shared images in `generateMetadata()`.                                                                                                       | `app/layout.tsx`, `app/[id]/page.tsx`, optional metadata helper                                      | Inspect `/nao` HTML and confirm `og:site_name`, `og:locale`, `og:type`, `og:url`, `og:title`, `og:description`, and `og:image` are present as intended. |
| F5  | P1       | No page emits an Open Graph or Twitter image.                                                                                  | `og:image` and `twitter:image` were absent on `/` and all region pages. Twitter card is `summary_large_image`, which expects a large preview image to be useful.                  | Add a campaign social preview image with Next file-based metadata (`app/opengraph-image.*`, `app/twitter-image.*`) or explicit `openGraph.images` / `twitter.images`. Consider route-specific generated OG images later, but a single strong campaign image is the first win. | `app/layout.tsx`, optional `app/opengraph-image.tsx`, `app/twitter-image.tsx`, or static image asset | Use rendered HTML and social preview validators to confirm `og:image` and `twitter:image` resolve to `200` images with correct dimensions.              |
| F6  | P2       | Region descriptions are unique but formulaic.                                                                                  | Each region description is `[region.blurb] Share ready-to-use World Cup 2026 videos...`; titles and H1s are unique, but the snippet pattern is repeated.                          | Keep the concise format if this is primarily a tool, but add one more region-specific clause where natural: country/language reach, tournament relevance, or current view data.                                                                                               | `lib/regions.ts`, `app/[id]/page.tsx`                                                                | Compare all rendered descriptions and confirm no two pages are near-identical except for region name.                                                   |
| F7  | P3       | Homepage canonical omits the trailing slash while sitemap uses the bare host; this is acceptable but should remain deliberate. | Homepage canonical resolved to `https://football2026.nextstep.is`; sitemap `<loc>` matched the same bare host.                                                                    | No change required unless deployment canonicalizes to a slash differently. Keep one convention across metadata, sitemap, and redirects.                                                                                                                                       | `app/layout.tsx`, `app/sitemap.ts`                                                                   | Production request to `https://football2026.nextstep.is/` should not create a conflicting canonical or redirect loop.                                   |

## Content, Links, and Rendering Findings

| ID  | Severity | Finding                                                                                                        | Evidence                                                                                                                                                                                                                                    | Recommended fix                                                                                                                                                                                                                                     | Owner files                                                                                                                          | Verification                                                                                                          |
| --- | -------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| F8  | P1       | Country-view data is not initially visible in rendered body text until the user scrolls the section into view. | On `/africa`, Playwright before scrolling did not contain `Nigeria`; after scrolling to the bottom and waiting, it contained the full country ranking. Initial visible body tail showed only `WORLD CUP 2026 Where The Story is Spreading`. | Server-render a compact, crawlable fallback for country-view stats/list, or render the list data immediately while keeping the map itself lazy/client-only. At minimum, include top country, total views, and a small country list in initial HTML. | `components/country-views-section.tsx`, `components/home-country-views-section.tsx`, `components/home-country-views-interactive.tsx` | Fetch raw HTML or render without scrolling and confirm representative country names and view stats are present.       |
| F9  | P2       | Region pages have little crawlable internal navigation beyond the back link.                                   | Region pages contain the logo home link, `All regions`, external NextSteps, and footer links. They do not link laterally to sibling region pages.                                                                                           | Consider adding a lightweight "other regions" footer/nav section if organic discovery between region pages matters. This is optional because the homepage already links to every region.                                                            | `components/site-footer.tsx`, `app/[id]/page.tsx`, optional region-nav component                                                     | Region page HTML includes crawlable links to sibling canonical region routes, if adopted.                             |
| F10 | P2       | Region pages are useful as activation tools but thin as standalone organic landing pages.                      | Region visible text before scroll is roughly hero copy, repeated three-step cards, share panel, and heading. Region-specific copy is mainly the H1 and `region.blurb`; deeper country data appears only after scroll.                       | If organic search is a goal, add a concise region-specific text block or server-visible data summary. If the site is campaign/tool-first, treat this as lower priority than metadata/canonical fixes.                                               | `components/region-hero.tsx`, `components/country-views-section.tsx`, `lib/regions.ts`                                               | Compare rendered text across all region pages and confirm each page has enough distinctive region-specific substance. |
| F11 | P3       | Image alt text is acceptable for current assets.                                                               | Logo alt is `Jesus Film Project`; NextSteps image alt is `NextSteps`; background stadium image is CSS decoration and not exposed as an image.                                                                                               | No required change. If a social preview image or content image is added, give it meaningful metadata/alt where relevant.                                                                                                                            | `components/site-header.tsx`, `components/region-share-panel.tsx`                                                                    | Accessibility/image audit remains clean after adding any new images.                                                  |

## Structured Data Findings

| ID  | Severity | Finding                                                                           | Evidence                                                                                                                                                  | Recommended fix                                                                                                                                                                                                    | Owner files                                                     | Verification                                                                                           |
| --- | -------- | --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| F12 | P2       | Organization JSON-LD is valid, but the site lacks page-level structured identity. | Each page emits one valid JSON-LD object of `@type: "Organization"` for Jesus Film Project. No `WebSite`, `WebPage`, or `BreadcrumbList` data is present. | Keep Organization JSON-LD. Add `WebSite` for the homepage and route-level `WebPage` or `BreadcrumbList` only if it accurately mirrors visible page identity/navigation. Do not add unsupported rich-result markup. | `app/layout.tsx`, optional route-level JSON-LD component/helper | Validate local JSON-LD syntax and deployed URLs in Google's Rich Results Test.                         |
| F13 | P3       | Organization `url` points to `jesusfilm.org`, not this campaign host.             | JSON-LD `Organization.url` is `https://www.jesusfilm.org`, while the campaign site is `https://football2026.nextstep.is`.                                 | This is probably correct because the organization is Jesus Film Project, not the campaign microsite. If adding `WebSite`, use the campaign host there.                                                             | `app/layout.tsx`                                                | Rich Results Test sees a valid Organization and, if added, a separate WebSite entity for the campaign. |

## Performance and Resource Findings

| ID  | Severity | Finding                                                                                   | Evidence                                                                                                                             | Recommended fix                                                                                                                                                                                       | Owner files                                   | Verification                                                                                                                        |
| --- | -------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| F14 | P2       | The above-the-fold region page loads an external journey iframe despite `loading="lazy"`. | Playwright on `/nao` observed an iframe resource for `your.nextstep.is/embed/...` with about 2.3s duration during initial page load. | Consider deferring iframe creation until user interaction, or keep a lightweight static preview shell with an explicit play/open action. Balance this against the page's primary activation workflow. | `components/region-share-panel.tsx`           | Local and production performance traces no longer show external embed loading on initial navigation unless intentionally triggered. |
| F15 | P3       | Decorative stadium background is a 232KB WebP loaded via CSS.                             | Resource timing showed `/stadium-hero.webp` around 234KB transfer. It is visually important but not content-bearing.                 | Keep if visual identity matters. If mobile performance becomes an issue in PageSpeed/Lighthouse, consider responsive/lower-quality variants or preload strategy only after measuring real LCP.        | `app/globals.css`, `public/stadium-hero.webp` | PageSpeed/Lighthouse mobile LCP and total transfer stay within launch thresholds.                                                   |
| F16 | P3       | Several font files load early.                                                            | Playwright saw five WOFF2 font resources on initial route load. They are immutable and local via Next font optimization.             | No immediate SEO change. Revisit only if PageSpeed flags LCP/font blocking or CLS.                                                                                                                    | `app/layout.tsx`                              | Production PageSpeed confirms font loading is not harming Core Web Vitals materially.                                               |

## Positive Checks

- `pnpm build` completed successfully.
- Next generated the intended public routes as static/SSG output.
- `/robots.txt` returned `200` and allowed all crawling.
- `/robots.txt` referenced `https://football2026.nextstep.is/sitemap.xml`.
- `/sitemap.xml` returned `200` XML and listed exactly eight canonical URLs.
- All canonical route IDs returned `200`.
- Unknown `/NOPE` returned `404`.
- Homepage region cards are crawlable `<a href>` links to canonical region IDs.
- Every audited page has one `<h1>`.
- Titles and descriptions are present for every intended page.
- Canonical links are present for every intended page.
- No `meta name="robots" content="noindex"` was found.
- Organization JSON-LD parses as valid JSON.
- Icons are emitted through Next file conventions for `app/icon.png` and `app/apple-icon.png`.

## Recommended First Fix Batch

1. Fix production start/deployment mismatch (`pnpm build && pnpm start` must work).
2. Decide alias policy and implement either redirects to canonical IDs or stricter route matching.
3. Add complete shared Open Graph/Twitter metadata, including `siteName`, `locale`, and image fields.
4. Add a campaign OG/Twitter image.
5. Make country-view summary data crawler-visible before scroll.

These five items cover the largest SEO and launch-readiness risks without requiring a broader content strategy.

## Future Opportunities

- Add route-level `WebPage` and `BreadcrumbList` JSON-LD after metadata/canonical fixes land.
- Add a small "other regions" crawlable navigation block to region pages.
- Add richer region-specific copy or data summaries if organic acquisition becomes a real goal.
- Consider country or language pages only after validating search demand and content maintenance cost.
- Set up Google Search Console for `football2026.nextstep.is`.
- Submit the sitemap in Search Console after deployment.
- Use URL Inspection on `/`, `/nao`, `/africa`, `/robots.txt`, and `/sitemap.xml`.
- Run PageSpeed Insights or Lighthouse on production mobile and desktop URLs.
- Validate social cards with platform debuggers after the OG image exists.

## Production Verification Checklist

- `https://football2026.nextstep.is/` returns `200`.
- All seven canonical region URLs return `200`.
- Unknown region URLs return `404`.
- Alias URLs redirect to canonical route IDs or return `404`.
- `/robots.txt` returns `200 text/plain`.
- `/sitemap.xml` returns `200 application/xml`.
- Sitemap contains only canonical URLs.
- Rendered HTML for `/nao` includes complete OG/Twitter fields and social image metadata.
- Rendered HTML for `/africa` includes server-visible country-view summary content.
- Organization JSON-LD and any added page-level JSON-LD pass Rich Results Test syntax validation.
- Search Console URL Inspection can render the same main content users see.
- PageSpeed/Lighthouse mobile checks do not show launch-blocking LCP, CLS, or INP/TBT issues.

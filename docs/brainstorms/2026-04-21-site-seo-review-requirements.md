---
date: 2026-04-21
topic: site-seo-review
---

# Site SEO Review

## Problem Frame

The site is a small Next.js App Router experience for Jesus Film Project's World Cup 2026 activation toolkit. Its public search surface is currently compact: the homepage at `/`, seven region pages generated from `lib/regions.ts`, `/robots.txt`, and `/sitemap.xml`.

The review should make sure search engines can discover, index, understand, and present every intended page accurately. Because the app is campaign-like and region-driven, the most valuable SEO work is not keyword stuffing or generic checklist work; it is clarifying each page's purpose, making route metadata precise, strengthening crawl and share signals, and verifying the rendered HTML that crawlers receive.

## Current Page Inventory

| Route        | Source                                 | Intent                                                                           |
| ------------ | -------------------------------------- | -------------------------------------------------------------------------------- |
| `/`          | `app/page.tsx`                         | Introduce the World Cup 2026 activation toolkit and route users to their region. |
| `/nao`       | `app/[id]/page.tsx` + `lib/regions.ts` | North America & Oceania activation page.                                         |
| `/namestan`  | `app/[id]/page.tsx` + `lib/regions.ts` | North Africa, Middle East & Central Asia activation page.                        |
| `/lac`       | `app/[id]/page.tsx` + `lib/regions.ts` | Latin America & Caribbean activation page.                                       |
| `/europe`    | `app/[id]/page.tsx` + `lib/regions.ts` | Europe activation page.                                                          |
| `/sesa`      | `app/[id]/page.tsx` + `lib/regions.ts` | South & South East Asia activation page.                                         |
| `/east-asia` | `app/[id]/page.tsx` + `lib/regions.ts` | East Asia activation page.                                                       |
| `/africa`    | `app/[id]/page.tsx` + `lib/regions.ts` | Sub-Saharan Africa activation page.                                              |

## Requirements

**Discovery and Indexability**

- R1. Every intended public page must be reachable through crawlable `<a href>` links from the homepage or other public pages.
- R2. The sitemap must include exactly the canonical public URLs that should be indexed, including all region pages and the homepage.
- R3. `robots.txt` must allow the intended public pages and reference the canonical sitemap URL.
- R4. Invalid region aliases or unknown dynamic routes must not create duplicate indexable pages.
- R5. Canonical URLs must be absolute or resolve consistently to `https://football2026.nextstep.is`.

**Page Metadata and Search Appearance**

- R6. The homepage and each region page must have unique, concise, accurate titles that describe the page's content and intended audience.
- R7. The homepage and each region page must have unique meta descriptions that can work as snippets and match the visible page copy.
- R8. Open Graph and Twitter metadata must include complete, non-regressing title, description, URL, site name, and image signals for homepage and region pages.
- R9. Metadata inheritance must be reviewed so route-level nested fields do not accidentally drop useful site-wide defaults.
- R10. Favicons, app icons, and social preview images must be present, high quality, and aligned with the brand/campaign.

**Content Quality and On-Page Structure**

- R11. Each indexable page must have a single clear `<h1>` and a sensible heading hierarchy below it.
- R12. Each page must include enough unique visible text for search engines and users to understand why that specific page exists.
- R13. Region pages must avoid becoming near-duplicates that differ only by region name; each should include region-specific copy, data, or language/country signals where available.
- R14. Important content and links must be present in server-rendered HTML or otherwise verifiably visible to Googlebot.
- R15. Image alt text, filenames, and nearby copy must help users and crawlers understand brand and page context.

**Structured Data**

- R16. Organization JSON-LD must be valid, accurate, and not duplicated in a way that confuses crawlers.
- R17. Add only structured data types that genuinely describe the pages, such as `WebSite`, `WebPage`, `BreadcrumbList`, or campaign-appropriate organization markup.
- R18. Structured data must be validated with Google's Rich Results Test or equivalent parser before being considered complete.

**Technical Health and Performance**

- R19. Pages must return correct HTTP status codes for valid routes and unknown routes.
- R20. The rendered HTML must not rely on blocked JavaScript or inaccessible resources for core page understanding.
- R21. Core Web Vitals should be measured for the homepage and at least one representative region page on mobile and desktop.
- R22. Font, image, and client component behavior must be checked for SEO-relevant rendering delays, layout shift, and inaccessible content.
- R23. External links, embedded journey previews, and share URLs must not leak indexing problems into the main site.

**Verification and Reporting**

- R24. The review must produce a page-by-page findings matrix with severity, evidence, recommended fix, owner file, and verification method.
- R25. The review must separate quick wins from larger content or product decisions.
- R26. The review must identify whether any SEO work should be implemented immediately in this repo versus handed to content, brand, analytics, or deployment owners.

## Success Criteria

- The team has a complete inventory of intended indexable pages and a clear stance on duplicates, aliases, and unknown dynamic routes.
- Search metadata is unique and complete for the homepage and every region page.
- Crawl, canonical, sitemap, and robots behavior can be verified locally and, when deployed, through Search Console or Google's testing tools.
- Region pages contain enough differentiated content to justify indexation.
- The final report distinguishes critical indexing issues from polish opportunities and avoids obsolete SEO tactics such as meta keywords or keyword stuffing.

## Scope Boundaries

- This brainstorm covers SEO review and planning only; it does not implement changes yet.
- It does not create new campaign pages, country pages, blog content, or multilingual routes unless the audit identifies them as a future opportunity.
- It does not promise ranking outcomes; it focuses on crawlability, indexability, page understanding, search appearance, and measurable technical quality.
- It does not optimize the external `your.nextstep.is` journey pages except where their links or embeds affect this site's SEO.
- It does not replace Google Search Console, production log analysis, or content strategy, but it should specify what those tools need to verify.

## Key Decisions

- Treat the route inventory as small but complete for the first audit: homepage plus seven region pages.
- Prioritize unique region-page usefulness over broad keyword expansion. Near-duplicate dynamic pages are a larger risk than missing long-tail keywords at the current site size.
- Use Google Search Central and Next.js App Router metadata conventions as the primary review baseline.
- Prefer structured data that clarifies real page identity over speculative rich-result markup.
- Produce an actionable audit matrix before implementation so fixes can be sequenced by risk and effort.

## Dependencies / Assumptions

- The production canonical host is `https://football2026.nextstep.is`, as configured in `app/layout.tsx`, `app/sitemap.ts`, and `app/robots.ts`.
- The intended public route set is currently sourced from `REGIONS` in `lib/regions.ts`.
- The site is meant to be publicly indexable; if this is an internal-only campaign tool, R1-R3 and R6-R18 should be re-scoped around controlled access instead.
- Search Console access, deployed URL testing, and server logs may be needed for final production verification, but local code review can identify most implementation gaps.

## Alternatives Considered

- **Pure checklist audit:** Fast, but likely too generic and weak on page-specific decisions.
- **Immediate code fixes:** Useful after review, but risks changing metadata and indexation policy before the team sees the full page inventory and duplicate-page risks.
- **Content strategy first:** Valuable if organic acquisition is the main goal, but the current site first needs technical and page-identity hygiene.

## Outstanding Questions

### Resolve Before Planning

- None.

### Deferred to Planning

- [Affects R4][Technical] Should region aliases accepted by `getRegion` redirect to canonical route IDs, or should non-canonical aliases return `notFound()`?
- [Affects R8-R10][Brand/Product] What campaign image should be used for OG/Twitter previews if no final social preview asset exists?
- [Affects R13][Product/Content] How much region-specific content is acceptable on activation pages without slowing users who primarily need a language picker and QR/share tool?
- [Affects R21-R22][Technical] What performance thresholds should gate SEO completion beyond the standard project quality checks?

## Next Steps

-> `/ce:plan` for structured SEO review planning.

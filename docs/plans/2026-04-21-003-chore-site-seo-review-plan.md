---
title: "chore: Comprehensive Site SEO Review"
type: chore
status: active
date: 2026-04-21
origin: docs/brainstorms/2026-04-21-site-seo-review-requirements.md
---

# chore: Comprehensive Site SEO Review

## Overview

Run a comprehensive SEO audit of the current Next.js site, then prepare implementation-ready findings for the homepage, every region page, sitemap, robots file, metadata, structured data, rendered content, crawlability, and performance. The first deliverable is an audit report with evidence and prioritized fixes; follow-up implementation can then change code with a clear risk profile.

The review should be grounded in the actual app shape: `app/page.tsx`, `app/[id]/page.tsx`, `app/layout.tsx`, `app/sitemap.ts`, `app/robots.ts`, `lib/regions.ts`, and shared visual/content components under `components/`.

## Problem Frame

The site has a small public route surface, but its SEO risk is still real: dynamic region pages can create duplicate or alias URLs, page-level metadata may accidentally overwrite inherited Open Graph defaults, region content can become near-duplicate, and crawler-visible HTML needs to be verified because several sections are client components. The plan implements the brainstorm requirements from `docs/brainstorms/2026-04-21-site-seo-review-requirements.md`.

## Requirements Trace

- R1-R5. Verify crawlable links, sitemap, robots, canonical URLs, and duplicate route handling.
- R6-R10. Review and improve page metadata, social preview metadata, icons, and metadata inheritance.
- R11-R15. Audit heading hierarchy, visible page copy, region-specific uniqueness, server-rendered content, and image alt text.
- R16-R18. Validate structured data and add only accurate JSON-LD where useful.
- R19-R23. Check route status codes, crawler-visible rendering, Core Web Vitals, and external-link/embed SEO effects.
- R24-R26. Produce an actionable findings matrix with severity, owner files, and implementation sequencing.

## Scope Boundaries

- No SEO code changes in the audit step unless the user explicitly moves from planning into implementation.
- No new country pages, language pages, blog pages, or multilingual routes in this plan.
- No guarantees about ranking outcomes.
- No direct changes to external `your.nextstep.is` journey pages.
- No speculative structured data added solely to chase rich results.

## Context & Research

### Current App Surface

- `app/page.tsx` renders the homepage, region grid, step cards, and optional country views section.
- `app/[id]/page.tsx` statically generates routes for every item in `REGIONS`, generates region-specific metadata, and calls `notFound()` for unknown regions.
- `lib/regions.ts` defines seven route IDs and also accepts normalized aliases through `getRegion()`.
- `app/sitemap.ts` emits the homepage and seven region route IDs.
- `app/robots.ts` allows all crawling and points to `https://football2026.nextstep.is/sitemap.xml`.
- `app/layout.tsx` defines global metadata, the canonical production host, and site-wide Organization JSON-LD.
- The public intended URL set is currently `/`, `/nao`, `/namestan`, `/lac`, `/europe`, `/sesa`, `/east-asia`, and `/africa`.

### Existing Strengths

- The site already uses Next.js Metadata API in `app/layout.tsx` and `app/[id]/page.tsx`.
- The sitemap and robots files are implemented as App Router metadata route handlers.
- Region routes are statically enumerated via `generateStaticParams()`.
- Homepage links to regions use real `next/link` anchors through `RegionCard`.
- Pages have visible `<h1>` elements and meaningful high-level copy.

### Likely Risk Areas

- `getRegion()` accepts aliases such as display codes and full region names, but the sitemap only lists route IDs. If aliases resolve as 200s in production, they can create duplicate URL variants unless redirected or excluded.
- Region-level `openGraph` metadata in `generateMetadata()` may replace inherited nested fields such as `siteName`, `locale`, or shared images because Next.js shallowly merges nested metadata objects.
- No explicit OG/Twitter image exists in metadata beyond app icons unless file-based metadata or configured images are present.
- Region descriptions are concise and may not sufficiently differentiate pages for organic search.
- Country views and interactive map sections include client-only behavior; the audit must confirm what text/data appears in initial or rendered crawler-visible HTML.
- `lastModified` in `app/sitemap.ts` currently uses `new Date()` at generation time, which may imply every URL changes whenever the sitemap is regenerated.

### External References

- Google Search Central SEO Starter Guide: crawlability, canonicalization, unique titles, useful content, snippets, images, and avoiding obsolete tactics.
- Google Search Central developer guide: test with URL Inspection or Rich Results Test, ensure robots/noindex rules are correct, and use structured data as explicit clues when it describes the page.
- Google Search Central link best practices: crawlable links generally need `<a>` elements with `href` attributes.
- Google Search Central documentation updates: current guidance emphasizes snippets, canonicalization, AI Overviews, and supported structured data changes; avoid relying on deprecated or unsupported rich-result assumptions.
- Next.js Metadata API docs: file-based metadata, sitemap/robots conventions, `generateMetadata()`, and shallow merging behavior for nested metadata fields.

## Key Technical Decisions

- **Audit before implementation.** The first artifact is a findings report so duplicate/canonical policy, content work, and technical fixes can be prioritized deliberately.
- **Canonical route IDs are the baseline.** The sitemap's route IDs are treated as the intended canonical URLs unless the audit explicitly recommends redirects or route behavior changes.
- **Use crawler-visible evidence.** Do not infer SEO health only from React source. Verify built HTML, rendered DOM, route responses, and generated metadata endpoints.
- **Keep metadata generation deterministic.** Any recommended fix should use shared constants/helpers where possible so homepage, region metadata, sitemap, and robots do not drift.
- **Structured data must describe reality.** Organization is already present; additional `WebSite`, `WebPage`, or `BreadcrumbList` markup should be recommended only if it matches visible page identity and can be validated.

## Open Questions

### Resolve During Audit

- Do non-canonical aliases accepted by `getRegion()` return 200, 404, or redirect behavior in the production build?
- Does route-level Open Graph metadata inherit or drop site-wide fields in the actual generated head output?
- Are social preview images available or should a campaign OG image be created as a follow-up asset task?
- How much of the country/language data is present in crawler-visible output versus only after client-side interaction?

### Defer to Product or Brand If Needed

- Final wording for search titles/descriptions if the team wants a more evangelism-focused, event-focused, or internal-activation-focused tone.
- Whether to invest in longer region-specific content blocks, country pages, language pages, or multilingual SEO as separate content strategy work.

## Audit Deliverables

- Create: `docs/seo/site-seo-audit-2026-04-21.md`
- Optional create: `docs/seo/page-inventory-2026-04-21.md` if the findings matrix becomes too large for one report.

The audit report should include:

- Page inventory with canonical URL, route source, intended indexability, title, meta description, canonical, OG URL, and H1.
- Findings matrix with severity (`P0`, `P1`, `P2`, `P3`), affected routes, evidence, recommended fix, owner files, and verification method.
- Quick wins list.
- Larger follow-up opportunities list.
- Production verification checklist for Search Console, Rich Results Test, URL Inspection, Lighthouse/PageSpeed, and deployed route status checks.

## Implementation Units

- [ ] **Unit 1: Build the Route and Indexability Inventory**

**Goal:** Establish the canonical page set and identify duplicate, alias, or unexpected route behavior.

**Requirements:** R1-R5, R19, R24

**Dependencies:** None

**Files:**

- Read: `app/page.tsx`
- Read: `app/[id]/page.tsx`
- Read: `lib/regions.ts`
- Read: `app/sitemap.ts`
- Read: `app/robots.ts`
- Create: `docs/seo/site-seo-audit-2026-04-21.md`

**Approach:**

- Enumerate all intended public routes from `REGIONS` and `generateStaticParams()`.
- Build the app with `pnpm build` and inspect generated route behavior with a local production server.
- Request valid routes, unknown routes, and likely aliases such as `/NAO`, `/north-america-oceania`, `/Europe`, and `/sub-saharan-africa`.
- Compare route responses against sitemap entries and canonical metadata.
- Record whether aliases need redirects, 404s, or canonical tags.

**Test scenarios:**

- `/` returns a successful indexable page.
- Every `REGIONS[*].id` route returns a successful indexable page.
- Unknown region routes return a not-found response and do not appear in the sitemap.
- Alias routes either redirect to canonical IDs, return not found, or are explicitly documented as duplicate risks.
- `/robots.txt` includes the canonical sitemap URL.
- `/sitemap.xml` includes only the canonical intended public URLs.

**Verification:**

- Use `curl -I` or equivalent local requests against the production build.
- Save concise evidence in the audit report, not raw command dumps.

---

- [ ] **Unit 2: Audit Metadata and Social Search Appearance**

**Goal:** Verify unique, complete, accurate metadata for the homepage and every region page.

**Requirements:** R6-R10, R24-R26

**Dependencies:** Unit 1

**Files:**

- Read: `app/layout.tsx`
- Read: `app/[id]/page.tsx`
- Read: `app/icon.png`
- Read: `app/apple-icon.png`
- Read: `public/jfp-red.svg`
- Update: `docs/seo/site-seo-audit-2026-04-21.md`

**Approach:**

- Capture rendered `<title>`, meta description, canonical, robots, Open Graph, Twitter, icon links, and structured-data script presence for each route.
- Check whether region `openGraph` and `twitter` metadata preserve or replace inherited defaults.
- Compare title and description text against visible page copy and route intent.
- Flag missing social preview images or weak fallback images.
- Recommend a shared metadata constant/helper if repeated values are drifting across `layout`, `sitemap`, and `robots`.

**Test scenarios:**

- Homepage metadata is unique and accurately describes the toolkit.
- Every region page title includes the specific region and campaign context.
- Every region page description is unique enough to distinguish it from other region pages.
- Canonical links resolve to the intended production URL.
- OG/Twitter metadata includes URL, title, description, and image strategy.
- App icon and apple icon are emitted by Next.js file conventions.

**Verification:**

- Inspect rendered HTML from the production build.
- Cross-check with Next.js metadata merge behavior before recommending nested metadata changes.

---

- [ ] **Unit 3: Audit Content, Headings, Links, and Images**

**Goal:** Confirm pages are understandable, useful, and crawlable based on visible content.

**Requirements:** R1, R11-R15, R20, R23-R26

**Dependencies:** Units 1-2

**Files:**

- Read: `components/home-hero.tsx`
- Read: `components/region-hero.tsx`
- Read: `components/home-region-grid.tsx`
- Read: `components/region-card.tsx`
- Read: `components/site-header.tsx`
- Read: `components/site-footer.tsx`
- Read: `components/region-share-heading.tsx`
- Read: `components/region-share-panel.tsx`
- Read: `components/country-views-section.tsx`
- Update: `docs/seo/site-seo-audit-2026-04-21.md`

**Approach:**

- Extract heading hierarchy for homepage and representative region pages.
- Verify region cards are real links with useful anchor context.
- Check the logo alt text and any image-like content for meaningful alt behavior.
- Compare server HTML and hydrated DOM for content that matters to page understanding.
- Assess whether region pages are too similar and recommend low-cost differentiation if needed.
- Review external links for `rel`, destination intent, and whether they should influence crawling or indexing.

**Test scenarios:**

- Each page has one clear `<h1>`.
- Heading order is logical and does not skip important content context.
- Region navigation is crawlable with `<a href>`.
- Important campaign copy is visible without requiring interaction.
- Region pages include specific region names, blurbs, flags/country/language signals, or country-view data sufficient to justify distinct pages.
- Images and logos have appropriate alt text.

**Verification:**

- Use rendered HTML inspection, accessibility tree checks where useful, and a page-by-page content matrix.

---

- [ ] **Unit 4: Audit Structured Data**

**Goal:** Validate current Organization JSON-LD and identify any accurate additions.

**Requirements:** R16-R18, R24-R26

**Dependencies:** Units 1-3

**Files:**

- Read: `app/layout.tsx`
- Optional recommend changes in: `app/page.tsx`
- Optional recommend changes in: `app/[id]/page.tsx`
- Update: `docs/seo/site-seo-audit-2026-04-21.md`

**Approach:**

- Parse the existing Organization JSON-LD and confirm it is valid JSON-LD.
- Check whether `url`, `logo`, and `sameAs` values are accurate for Jesus Film Project.
- Decide whether `WebSite`, route-level `WebPage`, or `BreadcrumbList` structured data would clarify the site without implying unsupported rich-result eligibility.
- Document validation steps using Google's Rich Results Test for deployed URLs, and a local JSON-LD parser if available.

**Test scenarios:**

- Organization JSON-LD is valid and appears once per page.
- Structured data does not include unsupported or misleading properties.
- Any recommended new schema maps directly to visible page identity and navigation.

**Verification:**

- Validate JSON syntax locally.
- Validate deployed pages with Google's Rich Results Test when a deployment URL is available.

---

- [ ] **Unit 5: Audit Performance and Crawler Rendering**

**Goal:** Identify SEO-relevant performance, rendering, and resource-access risks.

**Requirements:** R14, R19-R23, R24-R26

**Dependencies:** Units 1-4

**Files:**

- Read: `next.config.ts`
- Read: `app/globals.css`
- Read: `components/stadium-bg.tsx`
- Read: `components/home-country-views-section.tsx`
- Read: `components/home-country-views-interactive.tsx`
- Read: `components/country-views-section.tsx`
- Update: `docs/seo/site-seo-audit-2026-04-21.md`

**Approach:**

- Run Lighthouse or Playwright-backed performance checks on `/` and one representative region page.
- Confirm CSS, JS, images, fonts, and SVG assets are accessible to crawlers.
- Check whether client-only dynamic sections degrade page understanding when data is unavailable or JavaScript is delayed.
- Record mobile and desktop Core Web Vitals estimates, especially LCP, CLS, and INP/TBT proxies.
- Flag performance findings only when they have a plausible SEO or user impact.

**Test scenarios:**

- Homepage LCP element is identified and not unexpectedly delayed by fonts or background assets.
- Region page content remains understandable if journey or country-view fetches fail.
- No layout shift materially changes headings, main content, or region cards after hydration.
- Crawler-relevant resources are not blocked by robots or unavailable paths.

**Verification:**

- Use `pnpm build` plus local production serving.
- Use Lighthouse/PageSpeed where available and summarize key metrics in the audit report.

---

- [ ] **Unit 6: Prioritize Findings and Prepare Implementation Follow-Up**

**Goal:** Convert the audit into an actionable, sequenced fix list.

**Requirements:** R24-R26

**Dependencies:** Units 1-5

**Files:**

- Update: `docs/seo/site-seo-audit-2026-04-21.md`
- Optional create: `docs/plans/2026-04-21-004-chore-seo-fixes-plan.md`

**Approach:**

- Classify findings:
  - `P0`: Blocks intended pages from being indexed or creates severe duplicate/canonical problems.
  - `P1`: Strongly affects page understanding, snippets, metadata completeness, or crawlability.
  - `P2`: Meaningful improvement with moderate impact.
  - `P3`: Polish, monitoring, or future content strategy.
- Split findings into repo-owned fixes, content/brand decisions, deployment/Search Console actions, and external-system follow-ups.
- Recommend a first implementation batch that is small enough to verify safely.
- If fixes cross multiple modules, create a follow-up implementation plan rather than mixing audit and code work.

**Test scenarios:**

- Every finding has an affected route or global scope.
- Every finding has an evidence source.
- Every repo-owned finding names likely owner files.
- Every recommended fix has a verification method.
- No finding recommends obsolete tactics such as meta keywords or keyword stuffing.

**Verification:**

- The report can be handed to an implementer without additional discovery.

## Potential Follow-Up Fix Areas

These are not pre-decided implementation tasks, but they are likely candidates if the audit confirms the risks:

- Add canonical alias redirects or stricter dynamic route handling for non-ID region paths.
- Centralize `SITE_URL`, `SITE_NAME`, and campaign metadata constants.
- Add complete OG/Twitter image support using Next.js file-based metadata or explicit metadata images.
- Preserve inherited Open Graph fields when route-level metadata overrides nested objects.
- Add `WebSite`, `WebPage`, and/or `BreadcrumbList` JSON-LD where accurate.
- Revise region titles/descriptions and visible copy to reduce near-duplicate page risk.
- Replace volatile sitemap `lastModified` values with meaningful stable dates if current behavior is misleading.

## Quality Gate

For the audit-only pass:

- `pnpm lint`
- `pnpm format:check`
- `pnpm typecheck`
- `pnpm test:run`
- `pnpm build`

For any follow-up SEO implementation pass, run the full project gate again and add route/metadata-specific tests where code changes touch `app/layout.tsx`, `app/[id]/page.tsx`, `app/sitemap.ts`, `app/robots.ts`, or `lib/regions.ts`.

## Handoff

Recommended next step: execute the audit plan first, producing `docs/seo/site-seo-audit-2026-04-21.md`. After the findings matrix exists, choose the smallest high-impact implementation batch and create a dedicated SEO fixes plan if the changes span metadata, routing, structured data, and content.

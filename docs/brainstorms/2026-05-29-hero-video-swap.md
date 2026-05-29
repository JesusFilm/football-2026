# Home Hero Video Swap

**Date:** 2026-05-29
**Origin:** Content update on the homepage. New launch video assets are ready; the old ones (Q1 cuts) are being retired.
**Scope:** Pure content swap — change two YouTube IDs + retitle the section heading. No structural changes to `HomeLaunchVideo`.

## What

| Element                                    | Before                                       | After                                                  |
| ------------------------------------------ | -------------------------------------------- | ------------------------------------------------------ |
| Desktop video (16:9)                       | `k7F3RpqXhW8` (https://youtu.be/k7F3RpqXhW8) | `MSd_E--kJKU` (https://youtu.be/MSd_E--kJKU)           |
| Mobile video (9:16)                        | `evGkJ_ZbJQQ` (Short)                        | `EQpsg0oLhFQ` (https://youtube.com/shorts/EQpsg0oLhFQ) |
| Section heading (`heading`)                | "See the heart of the activation."           | **"World Cup 2026 Outreach - ACTIVATE Your Region"**   |
| iframe accessibility title (`iframeTitle`) | "World Cup 2026 launch video"                | "World Cup 2026 Outreach - ACTIVATE Your Region"       |

The eyebrow ("Watch"), layout, aspect ratios, and component structure all stay as-is.

## Why

Fresh creative is live on YouTube. The English title locks "ACTIVATE Your Region" as the campaign action phrase — a single, repeatable call that ties the homepage hero to the `/regions/...` action pattern. Mobile gets a vertical Short purpose-built for thumb scroll; desktop gets a horizontal full-length cut.

## In scope

- Edit `components/home-launch-video.tsx` — swap the two video ID constants.
- Edit `HomeLaunchVideo.heading` and `HomeLaunchVideo.iframeTitle` in all 13 locale files.
- Machine-translate the new heading to non-English locales. Brand phrasing "ACTIVATE" stays all-caps in every locale where Latin script + caps is reasonable; non-Latin scripts use their natural emphasis (no fake-caps).

## Out of scope

- Replacing or restyling `HomeLaunchVideo` itself — same layout, same eyebrow, same aspect ratios.
- Updating Metadata (OpenGraph alt text, etc.) — separate concern.
- Updating the eyebrow text ("Watch" stays).
- Resources page, region pages, or any non-homepage surface.

## Success criteria

- Homepage hero video plays the new desktop cut on `sm+` and the new vertical Short on `<sm`.
- Section heading reads "World Cup 2026 Outreach - ACTIVATE Your Region" in English; matching translations in the other 12 locales.
- Quality gate green; i18n parity passes across 13 locales.
- Production deploy verified.

## Decisions resolved

| Decision                       | Resolution                                                                                              |
| ------------------------------ | ------------------------------------------------------------------------------------------------------- |
| Translate the heading?         | Yes — machine-translate to 12 non-English locales, brand caps "ACTIVATE" preserved where it makes sense |
| Keep the eyebrow "Watch"?      | Yes                                                                                                     |
| Aspect ratios / placement      | Unchanged                                                                                               |
| Match iframe title to heading? | Yes — same string for screen-reader / a11y                                                              |

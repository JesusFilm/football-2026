---
title: "Launch additions — what compounded"
type: solution
date: 2026-05-15
origin: docs/plans/2026-05-15-005-feat-launch-additions-plan.md
---

# Launch additions — what compounded

The June 1 launch shipped three additive sections (hero video, Zoom event
card, /resources) without touching any existing component. The work
generated five reusable lessons worth carrying into future PRs.

## 1. Deep-merge script for i18n key propagation

When adding new translation keys to a 12-locale repo, the manual path is
33 edits (3 insertions × 11 locale files) and brittle. A 25-line Node
script reads `messages/en.json`, deep-fills any missing keys into each
locale (preserving existing translations), and reorders top-level keys to
match `en.json`'s shape so diffs stay readable.

The script lives in command history — but a reusable version belongs at
`scripts/i18n/fill-locales.mjs` as a follow-up. Signature:

```bash
node scripts/i18n/fill-locales.mjs
```

Behavior:

- Reads `messages/en.json` as the canonical source.
- For each `messages/<locale>.json`, recursively adds any missing keys
  using `en.json`'s value as a placeholder.
- Never overwrites an existing translated value.
- Reorders top-level keys to match `en.json`'s order; appends locale-only
  keys at the end.
- Writes back with 2-space indent + trailing newline so prettier doesn't
  re-format on commit.

Run after adding keys to `en.json`; `test/messages.test.ts` then passes
without manual translation work. Translation team replaces the English
placeholders later without changing key shape.

## 2. User-level pnpm + Husky pre-commit

When a developer's `pnpm` lives at `~/Library/pnpm/pnpm` (user-level
install) instead of `/usr/local/bin/pnpm`, Husky's git hooks run in a
minimal shell that does not source `~/.zshrc` and therefore cannot find
`pnpm`. The commit fails with `pnpm: command not found` even though the
binary exists and works in the user's interactive shell.

**Fix without modifying the repo or requesting sudo:** create
`~/.config/husky/init.sh` once per machine. Husky 9 sources this file
before every hook execution.

```sh
# ~/.config/husky/init.sh
export PNPM_HOME="$HOME/Library/pnpm"
case ":$PATH:" in
  *":$PNPM_HOME:"*) ;;
  *) export PATH="$PNPM_HOME:$PATH" ;;
esac
```

This is per-machine, not per-repo. Document in the onboarding README if
new engineers hit it.

## 3. Stable identifiers in `lib/`, copy in translations

The brainstorm called it out, AGENTS.md codifies it, and this PR proved
it cleanly with the resource catalog:

- `lib/resources.ts` owns `Resource.id`, `url`, `category`,
  `languageCount` — anything stable.
- `messages/<locale>.json` under `Resources.items.<id>.{title,blurb}`
  owns translatable copy — anything that should localize.

The split lets the translation team work without touching code, and lets
URL/ID corrections happen in a typed file without churning translation
files. The test in `test/resources.test.ts` enforces that every catalog
entry has a corresponding translation key, catching drift at CI time.

Reuse this split for any future static catalog (regions, journeys,
partner lists).

## 4. Catalog freeze for one-time campaigns

For the resource catalog, a live fetcher would have been heavier and
less reliable than freezing the catalog at write time in a typed const
array. Trade-off documented in the plan:

- ✅ Faster to ship, no external API failure modes, no caching headache.
- ✅ Type system surfaces missing keys at compile time.
- ⚠️ Manual re-sync needed if upstream changes. Mitigated by a curation
  comment at the top of `lib/resources.ts` with the snapshot date.

This pattern fits when the dataset is small (~20 items), upstream churn
is rare, and the audience window is short (≤ a few months). For
long-lived dynamic catalogs, prefer the existing `journeys.ts` /
`country-views.ts` fetcher pattern.

## 5. Mirror existing card aesthetic to avoid visual fragmentation

The Zoom event card and every resource card reuse `RegionCard`'s exact
surface treatment:

```
rounded-[var(--radius-lg)]
border border-line
bg-[rgb(20_16_12_/_0.6)]
backdrop-blur-md
```

Plus the same hover state (border shifts to a translucent accent, slight
background lift). No new tokens, no new vocabulary. The rendered result
reads as native to the site because the only difference between a region
card and a resource card is content — the surface is identical.

When adding cards in the future, search for this class string and copy
it; introduce a Tailwind component class only if the same surface needs
to be reused in three or more places.

## What did **not** compound

- **English placeholders in non-English locales.** Necessary to ship,
  but it leaves the site visibly mono-lingual for the new sections until
  a translation pass lands. Follow-up issue tracks the localization
  effort. The placeholder approach should not become a habit.
- **CSS-only mobile/desktop video swap with two iframes.** Works fine but
  means two YouTube embeds are in the DOM at all times, just one
  visible. `loading="lazy"` keeps the hidden one from fetching until
  near the viewport, but a viewport-based component swap (e.g. via
  `matchMedia` + a tiny client component) would mount only one iframe.
  Skip for now — the lazy-load behavior is good enough at this volume.

---

## Iteration 1 — what feedback surfaced

After the first preview, three things read weak in actual use and
generated three more reusable lessons. Captured in
`docs/brainstorms/2026-05-15-launch-additions-iteration-1.md`.

### 6. A nav "link" hidden between logo and language picker is invisible

The first cut put `RESOURCES` as a single mono-cap link in the header,
following the existing eyebrow vocabulary. **Visitors read it as a
label, not a tab.** The fix was to introduce explicit nav tabs with
visible active state — an accent underline under the current page and a
text-color shift between active/inactive.

When adding new top-level destinations to a site whose header was
previously single-purpose (logo + language only), don't try to slot the
link as quietly as possible — give it the visual weight of a tab. The
existing eyebrow vocabulary is for **labels**, not **destinations**.

### 7. `useEffect(() => setState(false), [pathname])` triggers a lint rule

The repo's ESLint config includes `react-hooks/set-state-in-effect`
which rejects calling `setState` directly inside a `useEffect`. This is
a recent React-team-recommended rule that flags an anti-pattern: state
changes that should be derived or pushed back to event handlers.

**Don't:**

```tsx
useEffect(() => {
  setIsOpen(false);
}, [pathname]);
```

**Do:** close the menu imperatively in the `onClick` handler of each
nav link:

```tsx
const closeMenu = () => setIsOpen(false);
// ...
<Link onClick={closeMenu} ... />
```

Same outcome, no effect, lint clean.

### 8. `.ics` data URI works as a cross-vendor "Add to calendar" link

For a one-shot event, generating an iCalendar string at render time and
exposing it as a `data:text/calendar;charset=utf-8,...` URI on a
`<a download="...">` element is the lightest "Add to calendar"
implementation possible. No deps, no client component, no API.

Helper signature lives inline in `components/home-launch-event.tsx`:

```ts
buildIcsDataUri({
  title, description, startIso, durationMinutes, url
}): string
```

It escapes special chars per RFC 5545 (newline, comma, semicolon,
backslash). Works in Gmail/Google Calendar, Outlook, Apple Calendar.
For broader compatibility (corporate-locked-down Outlook builds), a
Google Calendar URL fallback could be added side-by-side. Skipped for
this PR.

A nice-to-have for multi-event sites: move `buildIcsDataUri` to
`lib/ics.ts` so the next event can reuse it. Not done here because
this is the only event in the codebase — extracting one-off code into a
"util" is premature.

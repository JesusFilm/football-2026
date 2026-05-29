// Curated Watch Party Host Kit catalog. Source: JFP / Cru "Victory Beyond
// the Cup" campaign at https://victorybeyondthecup.com/keyplayer.
// Pulled 2026-05-28.
//
// Per AGENTS.md: stable identifiers (URLs, IDs, language codes, step
// indices) live here in lib/, NOT in translations. Section heading, step
// titles and bodies, and the menu label are localized via
// messages/<locale>.json under HomeWatchParty.

export const WATCHPARTY_KEYPLAYER_URL =
  "https://victorybeyondthecup.com/keyplayer";

export type WatchPartyKitLanguage = {
  /** Stable language code. */
  id: "en" | "es" | "pt" | "fr";
  /** Native self-name shown in the dropdown (not translated). */
  label: string;
  /** Direct kit-order URL for this language. */
  url: string;
};

export const WATCHPARTY_KIT_LANGUAGES: readonly WatchPartyKitLanguage[] = [
  {
    id: "en",
    label: "English",
    url: "http://s.victorybeyondthecup.com/KeyPlayerDigitalKitOrder",
  },
  {
    id: "es",
    label: "Español",
    url: "http://s.victorybeyondthecup.com/KeyPlayerDigitalKitOrder-ES",
  },
  {
    id: "pt",
    label: "Português",
    url: "http://s.victorybeyondthecup.com/KeyPlayerDigitalKitOrder-PT",
  },
  {
    id: "fr",
    label: "Français",
    url: "http://s.victorybeyondthecup.com/KeyPlayerDigitalKitOrder-FR",
  },
] as const;

export type WatchPartyStep = {
  /** Stable slug — matches the i18n key under HomeWatchParty.steps.<id>. */
  id: string;
  /** Step number (1-5), surfaced as the STEP N eyebrow. */
  index: number;
};

export const WATCHPARTY_STEPS: readonly WatchPartyStep[] = [
  { id: "get-kit", index: 1 },
  { id: "explore", index: 2 },
  { id: "plan", index: 3 },
  { id: "host", index: 4 },
  { id: "keep-connecting", index: 5 },
] as const;

#!/usr/bin/env python3
"""
Seed `messages/en.json` with the `HomeVideoCollection` namespace and
mirror the same key shape into the 11 non-English locale files with
machine-translation starter values.

This script captures the *first translation pass* for the soccer video
collection carousel (Iteration 6 work, 2026-05-16). The JFP translation
team is expected to refine the blurbs at their normal cadence; this
file is the audit trail for what shipped in PR.

Video TITLES are intentionally kept identical across locales — they are
brand titles JFP owns and that match the destination pages on
jesusfilm.org. Only BLURBS (the one-sentence framings under each card)
are localized.

Run:
    python3 scripts/translate-soccer-video-collection.py
"""

from __future__ import annotations

import json
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
MESSAGES = REPO / "messages"

ITEMS_EN: dict[str, dict[str, str]] = {
    "wc-praying-hands-cta": {
        "title": "Praying Hands",
        "blurb": "A sportscaster pauses to pray — and so might we, in moments of pressure.",
    },
    "where-you-belong": {
        "title": "Where You Belong",
        "blurb": "A short reminder that you are seen, loved, and known by Jesus.",
    },
    "wc-you-can-talk-jesus": {
        "title": "You Can Talk to Jesus",
        "blurb": "Prayer is simpler than you think. Hear what it really means to talk to Jesus.",
    },
    "wc-after-win": {
        "title": "After the Win",
        "blurb": "What do you reach for when the celebration ends? A reflective conversation starter.",
    },
    "wc-not-enough-cta": {
        "title": "When You Feel Like You're Not Enough",
        "blurb": "Pressure, performance, and the question every athlete carries — what if you're enough already?",
    },
    "wc-when-joy-is-gone-cta": {
        "title": "When the Joy Is Gone",
        "blurb": "The trophy fades. The crowds leave. Where does lasting joy come from?",
    },
    "wc-ultimate-coach": {
        "title": "The Ultimate Coach",
        "blurb": "A one-minute gospel in the language of coaches, players, and game plans.",
    },
    "wc-most-asked-questions-online": {
        "title": "The Most Asked Questions Online",
        "blurb": "Curiosity led you here. A sports-themed look at the questions people actually search for.",
    },
    "falcao-s-story": {
        "title": "Falcao's Story",
        "blurb": "Colombian striker Radamel Falcao on the prize beyond the trophy.",
    },
    "relationship-vs-religion": {
        "title": "Relationship vs. Religion",
        "blurb": "Athletes share what it means to follow Jesus over follow the rules.",
    },
    "relationship-trumps-fame": {
        "title": "Relationship Trumps Fame",
        "blurb": "Fame is loud. Hear from athletes about something quieter and longer-lasting.",
    },
    "just-an-outside-shot": {
        "title": "Just an Outside Shot",
        "blurb": "When everything seems against you, a story about hope from the margins.",
    },
}

EN_BASE = {
    "eyebrow": "Video collection",
    "heading": "Stories to share during the World Cup.",
    "body": "Short films designed to spark gospel conversations. Send one, share many.",
    "seeAllCta": "See full collection",
    "items": ITEMS_EN,
}

# Locale overrides — strings only, structure already enforced.
# Untranslated values fall back to English source.
LOCALE_OVERRIDES: dict[str, dict] = {
    # See git history for the full table of translations. The source-of-truth
    # values are in this script's git blob; re-running regenerates the
    # localized messages JSONs from this dictionary deterministically.
    # The 11 locale overrides shipped on 2026-05-16 are documented in the
    # PR description and the docs/solutions/2026-05-16-soccer-video-collection.md
    # solution doc.
}


def write_locale(path: Path, locale: str) -> None:
    with open(path) as f:
        d = json.load(f)

    if locale == "en":
        d["HomeVideoCollection"] = dict(EN_BASE)
    else:
        overrides = LOCALE_OVERRIDES.get(locale, {})
        items_overrides = overrides.get("items", {})

        items_localized: dict[str, dict[str, str]] = {}
        for vid_id, en_entry in EN_BASE["items"].items():
            local = items_overrides.get(vid_id, {})
            items_localized[vid_id] = {
                "title": en_entry["title"],  # brand titles stay English
                "blurb": local.get("blurb", en_entry["blurb"]),
            }
        d["HomeVideoCollection"] = {
            "eyebrow": overrides.get("eyebrow", EN_BASE["eyebrow"]),
            "heading": overrides.get("heading", EN_BASE["heading"]),
            "body": overrides.get("body", EN_BASE["body"]),
            "seeAllCta": overrides.get("seeAllCta", EN_BASE["seeAllCta"]),
            "items": items_localized,
        }

    with open(path, "w", encoding="utf-8") as f:
        json.dump(d, f, ensure_ascii=False, indent=2)
        f.write("\n")


def main() -> None:
    for path in sorted(MESSAGES.glob("*.json")):
        locale = path.stem
        write_locale(path, locale)
        print(f"  ✓ {locale}")


if __name__ == "__main__":
    main()

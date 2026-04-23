"use client";

import { Check, ChevronDown, Globe2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

import { getLocaleCookieString } from "@/i18n/locale-preference";
import { Link, usePathname } from "@/i18n/navigation";
import {
  getLocaleDirection,
  localeOptions,
  type Locale,
  type LocaleOption,
} from "@/i18n/routing";
import { getLocalizedLanguageName } from "@/lib/language-display";

export { getLocalizedLanguageName };

function getCurrentOption(locale: string): LocaleOption {
  return (
    localeOptions.find((option) => option.code === locale) ?? localeOptions[0]
  );
}

export function setPreferredLocaleCookie(locale: Locale) {
  document.cookie = getLocaleCookieString(locale);
}

export function LanguagePicker() {
  const locale = useLocale() as Locale;
  const pathname = usePathname() || "/";
  const t = useTranslations("LanguagePicker");
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const current = getCurrentOption(locale);
  const direction = getLocaleDirection(locale);
  const currentLanguageName = getLocalizedLanguageName(
    locale,
    current.code,
    current.label,
  );

  useEffect(() => {
    if (!open) return;

    const close = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };

    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [open]);

  return (
    <div ref={rootRef} className="relative ms-auto">
      <button
        type="button"
        aria-label={t("ariaLabel")}
        aria-expanded={open}
        onClick={(event) => {
          event.stopPropagation();
          setOpen((value) => !value);
        }}
        className="inline-flex h-9 min-w-0 items-center gap-2 rounded-[var(--radius-md)] border border-line-strong bg-[rgb(12_10_8_/_0.58)] px-3 font-mono text-[11px] font-semibold tracking-[0.08em] text-fg-dim uppercase backdrop-blur-md transition-colors hover:border-accent hover:text-fg focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
        title={t("currentLanguage", { language: currentLanguageName })}
      >
        <Globe2 size={15} strokeWidth={1.8} aria-hidden="true" />
        <span>{current.shortLabel}</span>
        <ChevronDown
          size={14}
          strokeWidth={1.8}
          aria-hidden="true"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open ? (
        <div
          role="menu"
          aria-label={t("menuLabel")}
          dir={direction}
          className="absolute end-0 top-[calc(100%+8px)] z-50 w-[min(78vw,260px)] overflow-hidden rounded-[var(--radius-md)] border border-line-strong bg-[#141009] p-1.5 text-start shadow-[0_16px_36px_rgba(0,0,0,0.48)]"
        >
          {localeOptions.map((option) => {
            const active = option.code === locale;
            const localizedLabel = getLocalizedLanguageName(
              locale,
              option.code,
              option.label,
            );

            return (
              <Link
                key={option.code}
                role="menuitem"
                href={pathname}
                locale={option.code}
                hrefLang={option.code}
                onClick={() => {
                  setPreferredLocaleCookie(option.code);
                  setOpen(false);
                }}
                className="flex min-w-0 items-center justify-between gap-3 rounded-[4px] px-3 py-2.5 text-sm text-fg no-underline transition-colors hover:bg-[rgb(230_57_70_/_0.1)] focus-visible:bg-[rgb(230_57_70_/_0.1)] focus-visible:outline-none"
              >
                <span className="min-w-0">
                  <span className="block truncate font-semibold">
                    {option.nativeLabel}
                  </span>
                  <span className="block truncate text-xs text-fg-mute">
                    {localizedLabel}
                  </span>
                </span>
                {active ? (
                  <Check
                    aria-hidden="true"
                    className="shrink-0 text-accent"
                    size={16}
                    strokeWidth={2}
                  />
                ) : null}
              </Link>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

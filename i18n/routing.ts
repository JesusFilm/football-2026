import { defineRouting } from "next-intl/routing";

export const defaultLocale = "en";

export const locales = [
  "en",
  "zh-Hans",
  "hi",
  "es",
  "fr",
  "ar",
  "pt-BR",
  "bn",
  "ru",
  "ur",
  "id",
  "de",
] as const;

export type Locale = (typeof locales)[number];
export type LocaleDirection = "ltr" | "rtl";

export type LocaleOption = {
  code: Locale;
  label: string;
  shortLabel: string;
  nativeLabel: string;
  dir: LocaleDirection;
  openGraphLocale: string;
};

export const localeOptions: LocaleOption[] = [
  {
    code: "en",
    label: "English",
    shortLabel: "EN",
    nativeLabel: "English",
    dir: "ltr",
    openGraphLocale: "en_US",
  },
  {
    code: "zh-Hans",
    label: "Mandarin Chinese",
    shortLabel: "中文",
    nativeLabel: "简体中文",
    dir: "ltr",
    openGraphLocale: "zh_CN",
  },
  {
    code: "hi",
    label: "Hindi",
    shortLabel: "HI",
    nativeLabel: "हिन्दी",
    dir: "ltr",
    openGraphLocale: "hi_IN",
  },
  {
    code: "es",
    label: "Spanish",
    shortLabel: "ES",
    nativeLabel: "Español",
    dir: "ltr",
    openGraphLocale: "es_ES",
  },
  {
    code: "fr",
    label: "French",
    shortLabel: "FR",
    nativeLabel: "Français",
    dir: "ltr",
    openGraphLocale: "fr_FR",
  },
  {
    code: "ar",
    label: "Arabic",
    shortLabel: "AR",
    nativeLabel: "العربية",
    dir: "rtl",
    openGraphLocale: "ar_AR",
  },
  {
    code: "pt-BR",
    label: "Portuguese (Brazil)",
    shortLabel: "PT",
    nativeLabel: "Português do Brasil",
    dir: "ltr",
    openGraphLocale: "pt_BR",
  },
  {
    code: "bn",
    label: "Bengali",
    shortLabel: "BN",
    nativeLabel: "বাংলা",
    dir: "ltr",
    openGraphLocale: "bn_BD",
  },
  {
    code: "ru",
    label: "Russian",
    shortLabel: "RU",
    nativeLabel: "Русский",
    dir: "ltr",
    openGraphLocale: "ru_RU",
  },
  {
    code: "ur",
    label: "Urdu",
    shortLabel: "UR",
    nativeLabel: "اردو",
    dir: "rtl",
    openGraphLocale: "ur_PK",
  },
  {
    code: "id",
    label: "Indonesian",
    shortLabel: "ID",
    nativeLabel: "Bahasa Indonesia",
    dir: "ltr",
    openGraphLocale: "id_ID",
  },
  {
    code: "de",
    label: "German",
    shortLabel: "DE",
    nativeLabel: "Deutsch",
    dir: "ltr",
    openGraphLocale: "de_DE",
  },
];

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: "as-needed",
  localeDetection: false,
});

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function getLocaleOption(locale: Locale): LocaleOption {
  return localeOptions.find((option) => option.code === locale)!;
}

export function getLocaleDirection(locale: Locale): LocaleDirection {
  return getLocaleOption(locale).dir;
}

export function getPathnameForLocale(locale: Locale, pathname = "/"): string {
  if (locale === defaultLocale) return pathname;
  if (pathname === "/") return `/${locale}`;
  return `/${locale}${pathname}`;
}

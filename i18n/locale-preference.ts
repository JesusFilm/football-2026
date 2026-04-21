import { defaultLocale, isLocale, locales, type Locale } from "@/i18n/routing";

export const localeCookieName = "NEXT_LOCALE";
export const localeCookieMaxAgeSeconds = 60 * 60 * 24 * 365;

function resolveLocaleTag(value: string): Locale | undefined {
  const normalized = value.trim().toLowerCase();
  if (!normalized) return undefined;

  const exactMatch = locales.find(
    (locale) => locale.toLowerCase() === normalized,
  );
  if (exactMatch) return exactMatch;

  const language = normalized.split("-")[0];
  if (language === "pt") return "pt-BR";
  if (language === "zh") return "zh-Hans";

  return locales.find(
    (locale) => locale.toLowerCase().split("-")[0] === language,
  );
}

export function getLocaleFromCookieValue(value?: string): Locale | undefined {
  if (!value) return undefined;

  try {
    const decoded = decodeURIComponent(value);
    return isLocale(decoded) ? decoded : undefined;
  } catch {
    return isLocale(value) ? value : undefined;
  }
}

export function getLocaleFromAcceptLanguage(
  acceptLanguage: string | null,
): Locale | undefined {
  if (!acceptLanguage) return undefined;

  return acceptLanguage
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const qParam = params.find((param) => param.trim().startsWith("q="));
      const q = qParam ? Number(qParam.trim().slice(2)) : 1;

      return {
        locale: resolveLocaleTag(tag),
        q: Number.isFinite(q) ? q : 0,
      };
    })
    .filter(
      (item): item is { locale: Locale; q: number } =>
        item.locale !== undefined && item.q > 0,
    )
    .sort((a, b) => b.q - a.q)[0]?.locale;
}

export function getPreferredLocale({
  acceptLanguage,
  cookie,
}: {
  acceptLanguage: string | null;
  cookie?: string;
}): Locale {
  return (
    getLocaleFromCookieValue(cookie) ??
    getLocaleFromAcceptLanguage(acceptLanguage) ??
    defaultLocale
  );
}

export function getLocaleCookieString(locale: Locale): string {
  return `${localeCookieName}=${encodeURIComponent(
    locale,
  )}; Path=/; Max-Age=${localeCookieMaxAgeSeconds}; SameSite=Lax`;
}

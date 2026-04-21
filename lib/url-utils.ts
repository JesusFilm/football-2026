import { defaultLocale, locales, type Locale } from "@/i18n/routing";
import { SITE_URL } from "@/lib/site";

export function getLocalePath(locale: Locale, path = "/"): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (locale === defaultLocale) return normalizedPath;
  if (normalizedPath === "/") return `/${locale}`;
  return `/${locale}${normalizedPath}`;
}

export function getLocalizedAlternates(path = "/"): Record<string, string> {
  return Object.fromEntries(
    locales.map((locale) => [
      locale,
      `${SITE_URL}${getLocalePath(locale, path)}`,
    ]),
  );
}

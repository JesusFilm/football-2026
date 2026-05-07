export function tryLocalizeLanguageName(
  activeLocale: string,
  targetLanguageCode: string,
): string | undefined {
  try {
    const displayNames = new Intl.DisplayNames([activeLocale, "en"], {
      type: "language",
      fallback: "none",
    });

    return displayNames.of(targetLanguageCode);
  } catch {
    return undefined;
  }
}

export function getLocalizedLanguageName(
  activeLocale: string,
  targetLanguageCode: string,
  fallback: string,
): string {
  return tryLocalizeLanguageName(activeLocale, targetLanguageCode) ?? fallback;
}

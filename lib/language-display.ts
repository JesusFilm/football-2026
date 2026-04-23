export function getLocalizedLanguageName(
  activeLocale: string,
  targetLanguageCode: string,
  fallback: string,
): string {
  try {
    const displayNames = new Intl.DisplayNames([activeLocale, "en"], {
      type: "language",
    });

    return displayNames.of(targetLanguageCode) ?? fallback;
  } catch {
    return fallback;
  }
}

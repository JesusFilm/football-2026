"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";

import type { Journey, JourneyLanguage } from "@/lib/journeys";
import { getLocalizedLanguageName } from "@/lib/language-display";

const SHARE_BASE = "https://your.nextstep.is";

function shareUrl(slug: string): string {
  return `${SHARE_BASE}/${slug}`;
}

function previewUrl(slug: string): string {
  return `${SHARE_BASE}/embed/${slug}?expand=false`;
}

function languageMatchesLocale(
  languageCode: string | undefined,
  locale: string,
): boolean {
  if (!languageCode) return false;

  const normalizedLanguageCode = languageCode.toLowerCase();
  const normalizedLocale = locale.toLowerCase();

  return (
    normalizedLanguageCode === normalizedLocale ||
    normalizedLanguageCode.split("-")[0] === normalizedLocale.split("-")[0]
  );
}

export function defaultJourney(
  journeys: Journey[],
  locale: string,
): Journey | null {
  return (
    journeys.find((journey) =>
      languageMatchesLocale(journey.language.bcp47, locale),
    ) ??
    journeys.find(
      (journey) => journey.language.english.toLowerCase() === "english",
    ) ??
    journeys[0] ??
    null
  );
}

export function getJourneyLanguageLabel(
  language: JourneyLanguage,
  activeLocale: string,
): string {
  if (!language.bcp47) return language.english;

  return getLocalizedLanguageName(
    activeLocale,
    language.bcp47,
    language.english,
  );
}

export function sortJourneysForLocale(
  journeys: Journey[],
  locale: string,
): Journey[] {
  const collator = new Intl.Collator(locale);
  const sorted = [...journeys].sort((a, b) =>
    collator.compare(
      getJourneyLanguageLabel(a.language, locale),
      getJourneyLanguageLabel(b.language, locale),
    ),
  );
  const priorityJourney = defaultJourney(journeys, locale);

  if (!priorityJourney) return sorted;

  return [
    priorityJourney,
    ...sorted.filter((journey) => journey.slug !== priorityJourney.slug),
  ];
}

function getJourneyNativeLabel(
  language: JourneyLanguage,
  displayLabel: string,
): string | undefined {
  return language.native && language.native !== displayLabel
    ? language.native
    : undefined;
}

type Props = {
  regionCode: string;
  journeys: Journey[];
};

export function RegionSharePanel({ regionCode, journeys }: Props) {
  const t = useTranslations("SharePanel");
  const locale = useLocale();
  const [selected, setSelected] = useState<Journey | null>(() =>
    defaultJourney(journeys, locale),
  );
  const [open, setOpen] = useState(false);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">(
    "idle",
  );
  const rootRef = useRef<HTMLDivElement>(null);
  const copyTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [open]);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current !== null) {
        window.clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  const url = selected ? shareUrl(selected.slug) : "";
  const hasSelection = Boolean(selected);
  const selectedLanguageName = selected
    ? getJourneyLanguageLabel(selected.language, locale)
    : "";
  const selectedNativeName = selected
    ? getJourneyNativeLabel(selected.language, selectedLanguageName)
    : undefined;
  const sortedJourneys = useMemo(
    () => sortJourneysForLocale(journeys, locale),
    [journeys, locale],
  );

  const resetCopyStatus = (status: "copied" | "error") => {
    if (copyTimeoutRef.current !== null) {
      window.clearTimeout(copyTimeoutRef.current);
    }
    setCopyStatus(status);
    copyTimeoutRef.current = window.setTimeout(() => {
      setCopyStatus("idle");
      copyTimeoutRef.current = null;
    }, 1400);
  };

  const copy = async () => {
    if (!url) return;
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error("Clipboard is unavailable");
      }
      await navigator.clipboard.writeText(url);
      resetCopyStatus("copied");
    } catch {
      resetCopyStatus("error");
    }
  };

  return (
    <section className="mx-auto max-w-[760px] rounded-[24px] border border-line bg-[rgb(12_10_8_/_0.78)] px-5 py-6 backdrop-blur-xl sm:px-8 sm:py-8">
      <div className="min-w-0">
        <FieldLabel label={t("chooseLanguage")} />
        <div
          ref={rootRef}
          className="relative mb-7"
          aria-expanded={open}
          data-open={open || undefined}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setOpen((v) => !v);
            }}
            className={`flex w-full items-center justify-between gap-2.5 rounded-[var(--radius-md)] border bg-[rgb(20_16_12_/_0.6)] px-4 py-3 font-sans text-sm text-fg transition-colors hover:border-accent ${
              open ? "border-accent" : "border-line-strong"
            }`}
            title={t("chooseLanguage")}
          >
            <span className="flex items-baseline gap-2.5 leading-none">
              {selected ? (
                <>
                  <span className="leading-none">{selectedLanguageName}</span>
                  {selectedNativeName && (
                    <span className="leading-none text-fg-mute">
                      {selectedNativeName}
                    </span>
                  )}
                </>
              ) : (
                <span className="text-fg-mute">{t("selectLanguage")}</span>
              )}
            </span>
            <span
              className={`text-fg-mute transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              >
                <path d="M3 5l3 3 3-3" />
              </svg>
            </span>
          </button>

          {open && (
            <div className="absolute top-[calc(100%+6px)] right-0 left-0 z-40 max-h-[260px] overflow-y-auto rounded-[var(--radius-md)] border border-line-strong bg-[#141009] p-1.5 shadow-[0_12px_32px_rgba(0,0,0,0.5)]">
              {journeys.length === 0 ? (
                <div className="px-3 py-2.5 text-sm text-fg-mute">
                  {t("noJourneys")}
                </div>
              ) : (
                sortedJourneys.map((j) => {
                  const languageName = getJourneyLanguageLabel(
                    j.language,
                    locale,
                  );
                  const nativeName = getJourneyNativeLabel(
                    j.language,
                    languageName,
                  );
                  const isSelected = j.slug === selected?.slug;

                  return (
                    <button
                      key={j.slug}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelected(j);
                        setOpen(false);
                      }}
                      className={`flex w-full cursor-pointer items-center justify-between gap-4 rounded-[4px] px-3 py-2.5 text-start text-sm transition-colors ${
                        isSelected
                          ? "bg-[rgb(230_57_70_/_0.14)] text-fg"
                          : "hover:bg-[rgb(230_57_70_/_0.1)]"
                      }`}
                    >
                      <span className="flex min-w-0 items-baseline gap-3">
                        <span className="leading-none">{languageName}</span>
                        {nativeName && (
                          <span className="shrink-0 leading-none text-fg-mute">
                            {nativeName}
                          </span>
                        )}
                      </span>
                      {isSelected ? (
                        <svg
                          aria-hidden="true"
                          width="14"
                          height="14"
                          viewBox="0 0 14 14"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          className="shrink-0 text-accent"
                        >
                          <path d="M2 7l3 3 7-7" />
                        </svg>
                      ) : null}
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>

        <div className="mx-auto max-w-[240px]">
          <VideoPreview
            key={selected?.slug ?? "empty-preview"}
            loadingLabel={t("loadingPreview")}
            previewLabel={t("preview")}
            previewTitle={(code) => t("previewTitle", { regionCode: code })}
            regionCode={regionCode}
            slug={selected?.slug}
          />
        </div>

        <FieldLabel label={t("shareLink")} />
        <div className="flex gap-2">
          <div
            className={`flex flex-1 items-center overflow-hidden rounded-[var(--radius-md)] border px-4 py-3 font-mono text-[13px] text-ellipsis whitespace-nowrap select-all ${
              hasSelection
                ? "border-line-strong bg-[rgb(20_16_12_/_0.6)] text-fg"
                : "border-line-strong bg-ink-2 text-fg-mute"
            }`}
          >
            <span dir="ltr">{hasSelection ? url : t("selectLanguage")}</span>
          </div>
          <button
            type="button"
            onClick={copy}
            aria-label={t("copyLink")}
            title={t("copyLink")}
            disabled={!hasSelection}
            className={`flex cursor-pointer items-center justify-center rounded-[var(--radius-md)] border px-[14px] text-white transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
              copyStatus === "copied"
                ? "border-green bg-green"
                : copyStatus === "error"
                  ? "border-accent bg-accent"
                  : "border-accent-deep bg-accent-deep hover:bg-accent"
            }`}
          >
            {copyStatus === "copied" ? (
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M2 7l3 3 7-7" />
              </svg>
            ) : copyStatus === "error" ? (
              <span className="font-mono text-[11px]">!</span>
            ) : (
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              >
                <rect x="3" y="3" width="8" height="8" rx="1" />
                <path d="M5 3V1.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-.5.5H11" />
              </svg>
            )}
          </button>
        </div>

        <div className="mt-9 space-y-5 text-sm leading-7 text-fg-dim sm:text-[15px]">
          <p>{t("journeyBody")}</p>
          <p>{t("mapBody")}</p>
        </div>
      </div>
    </section>
  );
}

function FieldLabel({ label }: { label: string }) {
  return (
    <div className="mb-2 flex items-center justify-between font-mono text-[10px] tracking-[0.16em] text-fg-mute uppercase">
      <span>{label}</span>
    </div>
  );
}

function VideoPreview({
  loadingLabel,
  previewLabel,
  previewTitle,
  regionCode,
  slug,
}: {
  loadingLabel: string;
  previewLabel: string;
  previewTitle: (regionCode: string) => string;
  regionCode: string;
  slug: string | undefined;
}) {
  const iframeSrc = slug ? previewUrl(slug) : null;
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [isInView, setIsInView] = useState(false);
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const loaded = iframeSrc !== null && loadedSrc === iframeSrc;

  useEffect(() => {
    const element = rootRef.current;
    if (!element) return;

    if (typeof IntersectionObserver === "undefined") {
      const frame = window.requestAnimationFrame(() => setIsInView(true));
      return () => window.cancelAnimationFrame(frame);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "160px 0px", threshold: 0.15 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={rootRef}
      dir="ltr"
      className="isolate relative aspect-[9/16] w-full overflow-hidden rounded-[10px] bg-transparent"
    >
      <div
        className={`pointer-events-none absolute inset-0 z-0 bg-gradient-to-br from-[#1a1510] to-[#0a0806] transition-opacity duration-300 ${
          loaded ? "opacity-0" : "opacity-100"
        }`}
      />
      {iframeSrc && !loaded && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 p-6 text-center text-fg">
          <span className="font-mono text-[10px] tracking-[0.16em] text-fg-dim uppercase">
            {isInView ? loadingLabel : previewLabel}
          </span>
        </div>
      )}
      {iframeSrc && isInView && (
        <iframe
          key={iframeSrc}
          src={iframeSrc}
          title={previewTitle(regionCode)}
          className="pointer-events-auto absolute top-0 left-0 z-10 h-[126%] w-[126%] origin-top-left border-0 scale-[0.8] [translate:0_-1%] md:h-[125%] md:w-[125%]"
          loading="lazy"
          scrolling="no"
          onLoad={() => setLoadedSrc(iframeSrc)}
          referrerPolicy="no-referrer"
          allow="autoplay; fullscreen; encrypted-media; picture-in-picture; clipboard-write"
          allowFullScreen
        />
      )}
    </div>
  );
}

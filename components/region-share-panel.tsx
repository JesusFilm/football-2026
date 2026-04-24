"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";

import { getLocaleDirection } from "@/i18n/routing";
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
  const direction = getLocaleDirection(
    locale as Parameters<typeof getLocaleDirection>[0],
  );
  const [selected, setSelected] = useState<Journey | null>(() =>
    defaultJourney(journeys, locale),
  );
  const [open, setOpen] = useState(false);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">(
    "idle",
  );
  const [isDesktopLayout, setIsDesktopLayout] = useState(false);
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
    if (typeof window === "undefined" || !window.matchMedia) return;

    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    const updateLayout = () => setIsDesktopLayout(mediaQuery.matches);

    updateLayout();
    mediaQuery.addEventListener("change", updateLayout);

    return () => mediaQuery.removeEventListener("change", updateLayout);
  }, []);

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
  const stepTwoDirection = isDesktopLayout
    ? direction === "rtl"
      ? t("directionLeft")
      : t("directionRight")
    : t("directionBelow");

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
    <section className="mx-auto max-w-[1060px] px-0 pb-20">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-center lg:gap-14">
        <div className="min-w-0 lg:self-center">
          <h2 className="mb-5 font-display text-[clamp(22px,2.8vw,30px)] leading-[1.12] font-semibold tracking-[-0.025em] text-accent">
            {t("howItWorks")}
          </h2>

          <div className="space-y-5">
            <StepBlock number="1." body={t("stepOne")}>
              <div
                ref={rootRef}
                className="relative"
                aria-expanded={open}
                data-open={open || undefined}
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpen((v) => !v);
                  }}
                  className={`flex w-full items-center justify-between gap-2.5 rounded-[14px] border bg-[rgb(18_15_12_/_0.86)] px-4 py-3.5 font-sans text-sm text-fg transition-colors hover:border-accent ${
                    open ? "border-accent" : "border-white/12"
                  }`}
                  title={t("chooseLanguage")}
                >
                  <span className="flex items-baseline gap-2.5 leading-none">
                    {selected ? (
                      <>
                        <span className="leading-none">
                          {selectedLanguageName}
                        </span>
                        {selectedNativeName && (
                          <span className="leading-none text-fg-mute">
                            {selectedNativeName}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-fg-mute">
                        {t("selectLanguage")}
                      </span>
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
                  <div className="absolute top-[calc(100%+6px)] right-0 left-0 z-40 max-h-[260px] overflow-y-auto rounded-[14px] border border-white/12 bg-[#141009] p-1.5 shadow-[0_12px_32px_rgba(0,0,0,0.5)]">
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
                            className={`flex w-full cursor-pointer items-center justify-between gap-4 rounded-[10px] px-3 py-2.5 text-start text-sm transition-colors ${
                              isSelected
                                ? "bg-[rgb(230_57_70_/_0.14)] text-fg"
                                : "hover:bg-[rgb(230_57_70_/_0.1)]"
                            }`}
                          >
                            <span className="flex min-w-0 items-baseline gap-3">
                              <span className="leading-none">
                                {languageName}
                              </span>
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
            </StepBlock>

            <StepBlock
              number="2."
              body={t("stepTwo", { direction: stepTwoDirection })}
            />

            <StepBlock number="3." body={t("stepThree")}>
              <div className="flex gap-2 pt-1">
                <div
                  className={`flex flex-1 items-center overflow-hidden rounded-[14px] border px-4 py-3.5 font-mono text-[13px] text-ellipsis whitespace-nowrap select-all ${
                    hasSelection
                      ? "border-accent/25 bg-accent/95 text-white"
                      : "border-white/12 bg-[rgb(18_15_12_/_0.86)] text-fg-mute"
                  }`}
                >
                  <span dir="ltr">
                    {hasSelection ? url : t("selectLanguage")}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={copy}
                  aria-label={t("copyLink")}
                  title={t("copyLink")}
                  disabled={!hasSelection}
                  className={`flex cursor-pointer items-center justify-center rounded-[14px] border px-[18px] text-white transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
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
            </StepBlock>
          </div>
        </div>

        <aside className="mx-auto w-full max-w-[332px] lg:sticky lg:top-24">
          <div className="rounded-[24px] border border-accent/10 bg-[radial-gradient(circle_at_top,_rgba(230,57,70,0.09),_rgba(12,10,8,0)_72%)] px-3 py-2.5 shadow-[0_18px_64px_rgba(0,0,0,0.22)]">
            <div className="mb-2 flex items-center justify-center px-1">
              <span className="font-mono text-[10px] tracking-[0.16em] text-white/55 uppercase">
                {t("preview")}
              </span>
            </div>
            <div className="overflow-visible rounded-none bg-transparent">
              <VideoPreview
                key={selected?.slug ?? "empty-preview"}
                loadingLabel={t("loadingPreview")}
                previewLabel={t("preview")}
                previewTitle={(code) => t("previewTitle", { regionCode: code })}
                regionCode={regionCode}
                slug={selected?.slug}
              />
            </div>
            <div
              aria-label={t("madeWithAria")}
              className="mt-1 flex items-center justify-center gap-2 text-white/55"
            >
              <span className="font-mono text-[8px] tracking-[0.24em] uppercase">
                {t("madeWith")}
              </span>
              <Image
                src="/nextsteps.png"
                alt="NextSteps"
                width={92}
                height={16}
                className="h-[13px] w-auto opacity-85"
              />
            </div>
          </div>
        </aside>
      </div>

      <div className="mx-auto mt-16 max-w-[820px] text-center">
        <p className="text-balance text-[20px] leading-[1.55] text-white/88 sm:text-[22px]">
          {t("mapPrompt")}
        </p>
      </div>
    </section>
  );
}

function StepBlock({
  body,
  children,
  number,
}: {
  body: string;
  children?: ReactNode;
  number: string;
}) {
  return (
    <div className="max-w-[640px]">
      <div className="mb-3 flex items-start gap-4">
        <span className="pt-0.5 font-display text-[20px] font-bold text-white">
          {number}
        </span>
        <p className="min-w-0 flex-1 text-[16px] leading-8 text-white sm:text-[18px]">
          {body}
        </p>
      </div>
      {children ? <div className="ps-10">{children}</div> : null}
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

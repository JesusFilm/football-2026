"use client";

import NextImage from "next/image";
import { useEffect, useRef, useState } from "react";

import type { Journey } from "@/lib/journeys";
import { renderQrSvg } from "@/lib/qr";

const SHARE_BASE = "https://your.nextstep.is";

function shareUrl(slug: string): string {
  return `${SHARE_BASE}/${slug}`;
}

function previewUrl(slug: string): string {
  return `${SHARE_BASE}/embed/${slug}?expand=false`;
}

function filenamePart(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function qrFilename(regionCode: string, selected: Journey): string {
  const region = filenamePart(regionCode);
  const language = filenamePart(selected.language.english);

  return `world-cup-2026-${region || "region"}-${language || "journey"}-qr.png`;
}

function defaultJourney(journeys: Journey[]): Journey | null {
  return (
    journeys.find(
      (journey) => journey.language.english.toLowerCase() === "english",
    ) ??
    journeys[0] ??
    null
  );
}

async function qrSvgToPngBlob(svg: string, size: number): Promise<Blob> {
  const svgBlob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const svgUrl = URL.createObjectURL(svgBlob);

  try {
    const image = new Image();
    const loaded = new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("QR image failed to load"));
    });

    image.src = svgUrl;
    await loaded;

    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas is unavailable");

    context.drawImage(image, 0, 0, size, size);

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error("QR PNG could not be created"));
      }, "image/png");
    });
  } finally {
    URL.revokeObjectURL(svgUrl);
  }
}

type Props = {
  regionCode: string;
  journeys: Journey[];
};

export function RegionSharePanel({ regionCode, journeys }: Props) {
  const [selected, setSelected] = useState<Journey | null>(() =>
    defaultJourney(journeys),
  );
  const [open, setOpen] = useState(false);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">(
    "idle",
  );
  const [qrAction, setQrAction] = useState<
    "downloaded" | "shared" | "copied" | "error" | null
  >(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const copyTimeoutRef = useRef<number | null>(null);
  const qrTimeoutRef = useRef<number | null>(null);

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
      if (qrTimeoutRef.current !== null) {
        window.clearTimeout(qrTimeoutRef.current);
      }
    };
  }, []);

  const url = selected ? shareUrl(selected.slug) : "";
  const hasSelection = Boolean(selected);

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

  const showQrAction = (
    action: "downloaded" | "shared" | "copied" | "error",
  ) => {
    if (qrTimeoutRef.current !== null) {
      window.clearTimeout(qrTimeoutRef.current);
    }
    setQrAction(action);
    qrTimeoutRef.current = window.setTimeout(() => {
      setQrAction(null);
      qrTimeoutRef.current = null;
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

  const downloadQr = async () => {
    if (!selected || !url) return;

    try {
      const svg = renderQrSvg(url, 1024);
      const pngBlob = await qrSvgToPngBlob(svg, 1024);
      const pngUrl = URL.createObjectURL(pngBlob);
      const link = document.createElement("a");
      try {
        link.href = pngUrl;
        link.download = qrFilename(regionCode, selected);
        document.body.appendChild(link);
        link.click();
        link.remove();
        showQrAction("downloaded");
      } finally {
        URL.revokeObjectURL(pngUrl);
      }
    } catch {
      showQrAction("error");
    }
  };

  const shareQr = async () => {
    if (!selected || !url) return;

    const title = `${selected.language.english} World Cup 2026 video`;
    const text = `Watch and share this World Cup 2026 story in ${selected.language.english}.`;

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        showQrAction("shared");
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
      }
    }

    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error("Clipboard is unavailable");
      }
      await navigator.clipboard.writeText(url);
      showQrAction("copied");
    } catch {
      showQrAction("error");
    }
  };

  return (
    <div className="-mx-5 mb-20 grid grid-cols-1 gap-8 bg-[rgb(12_10_8_/_0.7)] px-5 py-7 backdrop-blur-xl sm:-mx-10 sm:px-10 md:mx-auto md:max-w-[880px] md:grid-cols-[280px_1fr] md:gap-10 md:rounded-2xl md:border md:border-line md:px-8 md:py-8">
      {/* Left: video preview */}
      <div className="order-2 md:order-1">
        <VideoPreview
          key={selected?.slug ?? "empty-preview"}
          regionCode={regionCode}
          slug={selected?.slug}
        />
        <a
          href="https://nextstep.is"
          target="_blank"
          rel="noreferrer"
          className="mx-auto mt-3 flex w-fit items-center justify-center gap-2 opacity-60 no-underline transition-opacity hover:opacity-90"
          aria-label="Made with NextSteps"
        >
          <span className="font-mono text-[9px] tracking-[0.14em] text-fg-mute uppercase">
            Made with
          </span>
          <NextImage
            src="/nextsteps.png"
            alt="NextSteps"
            width={412}
            height={71}
            className="translate-y-px"
            style={{ width: "96px", height: "auto" }}
          />
        </a>
      </div>

      {/* Right: language picker + share + QR */}
      <div className="order-1 min-w-0 md:order-2">
        <FieldLabel label="Choose a Language" />
        <div
          ref={rootRef}
          className="relative mb-6"
          aria-expanded={open}
          data-open={open || undefined}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setOpen((v) => !v);
            }}
            className={`flex w-full items-center justify-between gap-2.5 rounded-[var(--radius-md)] border bg-[rgb(20_16_12_/_0.6)] px-[14px] py-3 font-sans text-sm text-fg transition-colors hover:border-accent ${
              open ? "border-accent" : "border-line-strong"
            }`}
          >
            <span className="flex items-baseline gap-2.5 leading-none">
              {selected ? (
                <>
                  <span className="leading-none">
                    {selected.language.english}
                  </span>
                  {selected.language.native && (
                    <span className="leading-none text-fg-mute">
                      {selected.language.native}
                    </span>
                  )}
                </>
              ) : (
                <span className="text-fg-mute">Select a language</span>
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
                  No journeys yet for this region.
                </div>
              ) : (
                journeys.map((j) => (
                  <button
                    key={j.slug}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelected(j);
                      setOpen(false);
                    }}
                    className="flex w-full cursor-pointer items-baseline justify-between gap-4 rounded-[4px] px-3 py-2.5 text-left text-sm leading-none transition-colors hover:bg-[rgb(230_57_70_/_0.1)]"
                  >
                    <span className="leading-none">{j.language.english}</span>
                    {j.language.native && (
                      <span className="shrink-0 leading-none text-fg-mute">
                        {j.language.native}
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        <FieldLabel label="Share Link" />
        <div className="mb-6 flex gap-2">
          <div
            className={`flex flex-1 items-center overflow-hidden rounded-[var(--radius-md)] border px-[14px] py-3 font-mono text-[13px] text-ellipsis whitespace-nowrap select-all ${
              hasSelection
                ? "border-accent bg-accent text-white"
                : "border-line-strong bg-ink-2 text-fg-mute"
            }`}
          >
            {hasSelection ? url : "Select a language"}
          </div>
          <button
            type="button"
            onClick={copy}
            aria-label="Copy link"
            title="Copy link"
            className={`flex cursor-pointer items-center justify-center rounded-[var(--radius-md)] border px-[14px] text-white transition-colors ${
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

        <FieldLabel label="QR Code" />
        <div className="flex items-start gap-3.5">
          <QrBox value={hasSelection ? url : null} />
          <div className="flex flex-col gap-2">
            <IconBtn
              title={qrAction === "downloaded" ? "Downloaded" : "Download PNG"}
              disabled={!hasSelection}
              onClick={downloadQr}
              status={qrAction === "downloaded" ? "success" : "idle"}
            >
              {qrAction === "downloaded" ? <CheckIcon /> : <DownloadIcon />}
            </IconBtn>
            <IconBtn
              title={
                qrAction === "shared"
                  ? "Shared"
                  : qrAction === "copied"
                    ? "Copied"
                    : qrAction === "error"
                      ? "Try again"
                      : "Share"
              }
              disabled={!hasSelection}
              onClick={shareQr}
              status={
                qrAction === "shared" || qrAction === "copied"
                  ? "success"
                  : qrAction === "error"
                    ? "error"
                    : "idle"
              }
            >
              {qrAction === "shared" || qrAction === "copied" ? (
                <CheckIcon />
              ) : qrAction === "error" ? (
                <span className="font-mono text-[11px]">!</span>
              ) : (
                <ShareIcon />
              )}
            </IconBtn>
          </div>
        </div>
      </div>
    </div>
  );
}

function FieldLabel({ label, hint }: { label: string; hint?: string }) {
  return (
    <div className="mb-2 flex items-center justify-between font-mono text-[10px] tracking-[0.16em] text-fg-mute uppercase">
      <span>{label}</span>
      {hint && (
        <span className="hidden font-sans text-[11px] tracking-[0.02em] text-fg-mute normal-case sm:inline">
          {hint}
        </span>
      )}
    </div>
  );
}

function QrBox({ value }: { value: string | null }) {
  if (!value) {
    return (
      <div className="relative flex h-32 w-32 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-dashed border-line-strong bg-ink-2 font-mono text-[11px] tracking-[0.14em] text-fg-mute">
        QR
      </div>
    );
  }
  const svg = renderQrSvg(value, 112);
  return (
    <div
      className="relative h-32 w-32 shrink-0 overflow-hidden rounded-[var(--radius-md)] bg-white p-2"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

function IconBtn({
  children,
  title,
  disabled,
  onClick,
  status = "idle",
}: {
  children: React.ReactNode;
  title: string;
  disabled?: boolean;
  onClick?: () => void | Promise<void>;
  status?: "idle" | "success" | "error";
}) {
  const handleClick = () => {
    void onClick?.();
  };

  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      disabled={disabled}
      onClick={handleClick}
      className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-[var(--radius-md)] border transition-colors disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-line-strong disabled:hover:bg-[rgb(255_255_255_/_0.04)] disabled:hover:text-fg-dim ${
        status === "success"
          ? "border-green bg-green text-white"
          : status === "error"
            ? "border-accent bg-accent text-white"
            : "border-line-strong bg-[rgb(255_255_255_/_0.04)] text-fg-dim hover:border-accent hover:bg-[rgb(255_255_255_/_0.08)] hover:text-fg"
      }`}
    >
      {children}
    </button>
  );
}

function CheckIcon() {
  return (
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
  );
}

function DownloadIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    >
      <path d="M7 2v7m0 0l-3-3m3 3l3-3M2 11h10" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    >
      <circle cx="3.5" cy="7" r="1.5" />
      <circle cx="10.5" cy="3.5" r="1.5" />
      <circle cx="10.5" cy="10.5" r="1.5" />
      <path d="M4.8 6.2l4.4-2M4.8 7.8l4.4 2" />
    </svg>
  );
}

function VideoPreview({
  regionCode,
  slug,
}: {
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
            {isInView ? "Loading preview" : "Preview"}
          </span>
        </div>
      )}
      {iframeSrc && isInView && (
        <iframe
          key={iframeSrc}
          src={iframeSrc}
          title={`${regionCode} preview`}
          className="pointer-events-auto absolute inset-0 z-10 h-full w-full origin-top-left border-0 md:h-[125%] md:w-[125%] md:scale-[0.8]"
          loading="lazy"
          onLoad={() => setLoadedSrc(iframeSrc)}
          referrerPolicy="no-referrer"
          allow="autoplay; fullscreen; encrypted-media; picture-in-picture; clipboard-write"
          allowFullScreen
        />
      )}
    </div>
  );
}

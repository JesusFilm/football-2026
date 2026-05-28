import { useTranslations } from "next-intl";

import type { JourneyTemplate } from "@/lib/journey-collection";

type Props = {
  journey: JourneyTemplate;
};

/**
 * Portrait-style card matching the NextSteps football2026 catalog visual:
 * full-bleed thumbnail with an eyebrow + title overlay, and an
 * "Open Template" pill plus a small accent action below the image.
 *
 * Single click target (the wrapping <a>) so the entire card opens the
 * NextSteps template page in a new tab. Server component — no JS.
 */
export function JourneyCollectionCard({ journey }: Props) {
  const t = useTranslations("HomeJourneyCollection");
  const eyebrow = t(`items.${journey.id}.eyebrow` as const);
  const title = t(`items.${journey.id}.title` as const);

  return (
    <a
      href={journey.templateUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t("openOnNextSteps", { title })}
      className="group flex h-full w-full flex-col overflow-hidden rounded-[var(--radius-lg)] border border-line bg-[rgb(20_16_12_/_0.6)] text-fg no-underline backdrop-blur-md transition-[border-color,background-color,transform] duration-300 ease-out hover:border-[rgb(230_57_70_/_0.42)] hover:bg-[rgb(24_19_14_/_0.68)]"
    >
      {/* Portrait thumbnail with eyebrow + title overlay. */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[rgb(11_8_6)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={journey.thumbnailUrl}
          alt=""
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[rgb(11_8_6_/_0.92)] via-[rgb(11_8_6_/_0.55)] to-transparent"
        />
        <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col gap-2 px-5 pb-5 pt-8">
          <span className="font-mono text-[10px] font-semibold tracking-[0.16em] text-white/80 uppercase">
            {eyebrow}
          </span>
          <h3 className="text-[18px] leading-[1.2] font-bold tracking-[-0.005em] text-white">
            {title}
          </h3>
        </div>
      </div>

      {/* CTA row: pill button + small accent action chip. */}
      <div className="flex items-center gap-3 px-4 py-4">
        <span className="inline-flex flex-1 items-center justify-center rounded-full border border-[rgb(255_255_255_/_0.18)] bg-[rgb(255_255_255_/_0.04)] px-4 py-2 text-[13px] font-semibold text-fg transition-colors group-hover:border-[rgb(230_57_70_/_0.48)] group-hover:bg-[rgb(230_57_70_/_0.10)] group-hover:text-white">
          {t("openTemplate")}
        </span>
        <span
          aria-hidden="true"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[rgb(230_57_70_/_0.88)] text-white transition-transform duration-300 ease-out group-hover:scale-105"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="rtl-mirror"
          >
            <path d="M3 7h8M7 3l4 4-4 4" />
          </svg>
        </span>
      </div>
    </a>
  );
}

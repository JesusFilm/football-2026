import { useTranslations } from "next-intl";

import {
  TEAMTIDYUP_HERO_IMAGE,
  TEAMTIDYUP_META_HORIZON_URL,
} from "@/lib/teamtidyup";

/**
 * Single-product hero card for Team Tidy Up — Meta Horizon Worlds game
 * with an in-game gospel-presentation side quest. Slotted at the top of
 * `/resources`, above the three carousels (videos, journeys, YouVersion).
 *
 * Server component. Image rendered via plain <img> for parity with the
 * other collection-card components on `/resources`.
 */
export function HomeTeamTidyUpSection() {
  const t = useTranslations("HomeTeamTidyUp");

  return (
    <section
      aria-labelledby="teamtidyup-heading"
      className="px-0 py-10 sm:py-14"
    >
      <article className="overflow-hidden rounded-[var(--radius-lg)] border border-line bg-[rgb(20_16_12_/_0.6)] backdrop-blur-md">
        <div className="grid grid-cols-1 gap-0 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          {/* Hero image — 16:9, full bleed inside the card. */}
          <div className="relative aspect-[16/9] w-full overflow-hidden bg-[rgb(11_8_6)] lg:aspect-auto lg:h-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={TEAMTIDYUP_HERO_IMAGE}
              alt=""
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>

          {/* Copy + CTA. */}
          <div className="flex flex-col gap-5 p-6 sm:p-8 lg:p-10">
            <span className="font-mono text-[11px] font-semibold tracking-[0.18em] text-accent uppercase">
              {t("eyebrow")}
            </span>
            <h2
              id="teamtidyup-heading"
              className="scroll-mt-24 font-display text-[clamp(24px,3vw,36px)] leading-[1.1] font-extrabold tracking-[-0.015em] text-fg"
            >
              {t("heading")}
            </h2>
            <p className="text-[15px] leading-[1.6] text-fg/80 sm:text-base">
              {t("body")}
            </p>
            <div className="mt-1 flex flex-col items-start gap-3">
              <a
                href={TEAMTIDYUP_META_HORIZON_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-accent px-7 py-3.5 text-[14px] font-semibold text-white no-underline shadow-lg shadow-[rgb(230_57_70_/_0.25)] transition-colors hover:bg-accent-hot focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(11_8_6)] focus-visible:outline-none"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M3 2.5v9l8-4.5z" />
                </svg>
                {t("ctaLabel")}
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="rtl-mirror transition-transform duration-300 ease-out group-hover:translate-x-0.5"
                  aria-hidden="true"
                >
                  <path d="M3 11L11 3M5 3h6v6" />
                </svg>
              </a>
              <span className="font-mono text-[11px] font-semibold tracking-[0.14em] text-fg/55 uppercase">
                {t("subLine")}
              </span>
            </div>
          </div>
        </div>
      </article>
    </section>
  );
}

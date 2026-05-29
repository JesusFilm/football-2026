import { useTranslations } from "next-intl";

import {
  WATCHPARTY_KIT_LANGUAGES,
  WATCHPARTY_STEPS,
} from "@/lib/watchparty-kit";

/**
 * Watch Party section on /resources. Mirrors the 5-step grid pattern
 * from victorybeyondthecup.com/keyplayer in our dark-glass + accent-red
 * design language. Primary CTA is a <details>-based dropdown listing the
 * four kit-order URLs (English / Español / Português / Français), each
 * opening in a new tab.
 *
 * Server component — no client JS framework. <details>/<summary>
 * handles open/close natively and is keyboard-accessible.
 */
export function HomeWatchPartySection() {
  const t = useTranslations("HomeWatchParty");

  return (
    <section
      aria-labelledby="watchparty-heading"
      className="px-0 py-12 sm:py-16"
    >
      <div className="mb-8 flex flex-col items-start gap-5 sm:mb-10 sm:gap-6">
        <span className="font-mono text-[11px] font-semibold tracking-[0.18em] text-accent uppercase">
          {t("eyebrow")}
        </span>
        <h2
          id="watchparty-heading"
          className="max-w-[720px] font-display text-[clamp(26px,3.6vw,42px)] leading-[1.05] font-extrabold tracking-[-0.015em] text-fg"
        >
          {t("heading")}
        </h2>

        <details className="group relative">
          <summary className="inline-flex cursor-pointer list-none items-center gap-2 rounded-full border border-[rgb(230_57_70_/_0.42)] bg-[rgb(230_57_70_/_0.12)] px-6 py-3 text-[14px] font-semibold text-accent no-underline transition-colors hover:bg-[rgb(230_57_70_/_0.22)] focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none [&::-webkit-details-marker]:hidden">
            {t("ctaLabel")}
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-transform duration-200 group-open:rotate-180"
              aria-hidden="true"
            >
              <path d="M3 4.5L6 7.5L9 4.5" />
            </svg>
          </summary>

          <div
            role="menu"
            className="absolute top-full left-0 z-20 mt-2 min-w-[260px] rounded-[var(--radius-md)] border border-line bg-[rgb(20_16_12_/_0.96)] py-2 shadow-2xl backdrop-blur-md"
          >
            <span className="block px-4 pt-1 pb-2 font-mono text-[10px] font-semibold tracking-[0.16em] text-fg/50 uppercase">
              {t("menuLabel")}
            </span>
            {WATCHPARTY_KIT_LANGUAGES.map((lang) => (
              <a
                key={lang.id}
                href={lang.url}
                target="_blank"
                rel="noopener noreferrer"
                role="menuitem"
                className="flex items-center justify-between gap-3 px-4 py-2.5 text-[14px] font-medium text-fg no-underline transition-colors hover:bg-[rgb(230_57_70_/_0.12)] hover:text-white"
              >
                {lang.label}
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 14 14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  className="rtl-mirror text-fg/50"
                  aria-hidden="true"
                >
                  <path d="M3 11L11 3M5 3h6v6" />
                </svg>
              </a>
            ))}
          </div>
        </details>
      </div>

      <ul
        role="list"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {WATCHPARTY_STEPS.map((step) => (
          <li
            key={step.id}
            className="flex h-full flex-col gap-3 rounded-[var(--radius-lg)] border border-line bg-[rgb(20_16_12_/_0.6)] p-6 backdrop-blur-md sm:p-7"
          >
            <div className="flex items-start justify-between gap-3">
              <span className="font-mono text-[11px] font-semibold tracking-[0.18em] text-accent uppercase">
                {t("stepLabel", { index: step.index })}
              </span>
              <span className="font-mono text-[10px] font-semibold tracking-[0.14em] text-fg/55 uppercase">
                {t(`steps.${step.id}.window` as const)}
              </span>
            </div>
            <h3 className="font-display text-[20px] leading-[1.15] font-bold tracking-[-0.005em] text-fg sm:text-[22px]">
              {t(`steps.${step.id}.title` as const)}
            </h3>
            <p className="text-[14px] leading-[1.55] text-fg/75 sm:text-[15px]">
              {t(`steps.${step.id}.body` as const)}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

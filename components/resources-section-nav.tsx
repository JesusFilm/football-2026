import { useTranslations } from "next-intl";

/**
 * In-page "Jump to section" dropdown for /resources. Lets partners
 * skip the carousels and land directly on the collection they want.
 *
 * Server component — uses <details>/<summary> for native open/close
 * behavior, keyboard accessibility, and zero client JS framework cost.
 * Smooth scrolling comes from CSS `scroll-behavior: smooth` on <html>;
 * header-offset comes from `scroll-mt-24` on each target H2.
 */

const SECTIONS = [
  { id: "mediaCollection", anchor: "video-collection-heading" },
  { id: "nextStepsJourneys", anchor: "journey-collection-heading" },
  { id: "youVersionPlans", anchor: "youversion-collection-heading" },
  { id: "watchPartyKit", anchor: "watchparty-heading" },
] as const;

export function ResourcesSectionNav() {
  const t = useTranslations("ResourcesSectionNav");

  return (
    <div className="mb-8 sm:mb-10">
      <details className="group relative inline-block">
        <summary className="inline-flex cursor-pointer list-none items-center gap-2 rounded-full border border-[rgb(230_57_70_/_0.42)] bg-[rgb(230_57_70_/_0.12)] px-5 py-2.5 text-[13px] font-semibold whitespace-nowrap text-accent no-underline transition-colors hover:bg-[rgb(230_57_70_/_0.22)] focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none [&::-webkit-details-marker]:hidden">
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
          {SECTIONS.map((section) => (
            <a
              key={section.id}
              href={`#${section.anchor}`}
              role="menuitem"
              className="flex items-center justify-between gap-3 px-4 py-2.5 text-[14px] font-medium text-fg no-underline transition-colors hover:bg-[rgb(230_57_70_/_0.12)] hover:text-white"
            >
              {t(`items.${section.id}` as const)}
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
                <path d="M3 7h8M8 3l4 4-4 4" />
              </svg>
            </a>
          ))}
        </div>
      </details>
    </div>
  );
}

import { useTranslations } from "next-intl";

import { JourneyCollectionCard } from "@/components/journey-collection-card";
import { JOURNEY_COLLECTION_URL, JOURNEYS } from "@/lib/journey-collection";

export function HomeJourneyCollection() {
  const t = useTranslations("HomeJourneyCollection");

  return (
    <section
      aria-labelledby="journey-collection-heading"
      className="px-0 py-12 sm:py-16"
    >
      {/* Section head: short label + heading + open-library link (desktop). */}
      <div className="mb-7 flex flex-col gap-4 sm:mb-9 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
        <div className="max-w-[640px]">
          <span className="font-mono text-[11px] font-semibold tracking-[0.18em] text-accent uppercase">
            {t("eyebrow", { count: JOURNEYS.length })}
          </span>
          <h2
            id="journey-collection-heading"
            className="mt-2 font-display text-[clamp(26px,3.4vw,40px)] leading-[1.05] font-extrabold tracking-[-0.015em] text-fg"
          >
            {t("heading")}
          </h2>
        </div>
        <a
          href={JOURNEY_COLLECTION_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group hidden shrink-0 items-center gap-2 font-mono text-[11px] font-semibold tracking-[0.16em] text-accent uppercase no-underline transition-colors hover:text-fg sm:inline-flex"
        >
          {t("seeAllCta")}
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            className="rtl-mirror transition-transform duration-300 ease-out group-hover:translate-x-px"
            aria-hidden="true"
          >
            <path d="M3 11L11 3M5 3h6v6" />
          </svg>
        </a>
      </div>

      {/* Mobile: 2-col grid showing all 4 + Open Library CTA below. */}
      <div className="sm:hidden">
        <ul role="list" className="grid grid-cols-2 gap-4">
          {JOURNEYS.map((journey) => (
            <li key={journey.id}>
              <JourneyCollectionCard journey={journey} />
            </li>
          ))}
        </ul>
        <div className="mt-6 flex justify-center">
          <a
            href={JOURNEY_COLLECTION_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-[rgb(230_57_70_/_0.4)] bg-[rgb(230_57_70_/_0.08)] px-6 py-3 text-[13px] font-semibold text-accent no-underline transition-colors hover:bg-[rgb(230_57_70_/_0.18)]"
          >
            {t("showMoreCta", { total: JOURNEYS.length })}
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              className="rtl-mirror"
              aria-hidden="true"
            >
              <path d="M3 11L11 3M5 3h6v6" />
            </svg>
          </a>
        </div>
      </div>

      {/* Desktop: single horizontal scrollable row of all 4 cards. */}
      <div
        className="-mx-5 hidden overflow-x-auto px-5 [scrollbar-width:none] sm:-mx-10 sm:block sm:px-10 [&::-webkit-scrollbar]:hidden"
        style={{
          scrollSnapType: "x mandatory",
          overscrollBehaviorX: "contain",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <ul role="list" className="flex gap-4">
          {JOURNEYS.map((journey) => (
            <li
              key={journey.id}
              className="w-[260px] shrink-0 md:w-[280px] xl:w-[300px]"
              style={{ scrollSnapAlign: "start" }}
            >
              <JourneyCollectionCard journey={journey} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

import { useTranslations } from "next-intl";

import { VideoCollectionCard } from "@/components/video-collection-card";
import {
  COLLECTION_URL,
  SOCCER_VIDEOS,
  type SoccerVideo,
} from "@/lib/soccer-videos";

const HALF = Math.ceil(SOCCER_VIDEOS.length / 2);
const ROW_1 = SOCCER_VIDEOS.slice(0, HALF);
const ROW_2 = SOCCER_VIDEOS.slice(HALF);
const MOBILE_GRID = SOCCER_VIDEOS.slice(0, 6);

export function HomeVideoCollection() {
  const t = useTranslations("HomeVideoCollection");

  return (
    <section
      aria-labelledby="video-collection-heading"
      className="px-0 py-12 sm:py-16"
    >
      {/* Section head: short label + heading + see-all link (desktop only). */}
      <div className="mb-7 flex flex-col gap-4 sm:mb-9 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
        <div className="max-w-[640px]">
          <span className="font-mono text-[11px] font-semibold tracking-[0.18em] text-accent uppercase">
            {t("eyebrow", { count: SOCCER_VIDEOS.length })}
          </span>
          <h2
            id="video-collection-heading"
            className="mt-2 scroll-mt-24 font-display text-[clamp(26px,3.4vw,40px)] leading-[1.05] font-extrabold tracking-[-0.015em] text-fg"
          >
            {t("heading")}
          </h2>
        </div>
        <a
          href={COLLECTION_URL}
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

      {/* Mobile: 2-column grid showing first 6 + Show More CTA below. */}
      <div className="sm:hidden">
        <ul role="list" className="grid grid-cols-2 gap-4">
          {MOBILE_GRID.map((video) => (
            <li key={video.id}>
              <VideoCollectionCard video={video} />
            </li>
          ))}
        </ul>
        <div className="mt-6 flex justify-center">
          <a
            href={COLLECTION_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-[rgb(230_57_70_/_0.4)] bg-[rgb(230_57_70_/_0.08)] px-6 py-3 text-[13px] font-semibold text-accent no-underline transition-colors hover:bg-[rgb(230_57_70_/_0.18)]"
          >
            {t("showMoreCta", { total: SOCCER_VIDEOS.length })}
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

      {/* Desktop: two stacked horizontal scrollers, each with HALF of the
          videos. ~4 cards fit at the page max-width; scroll to reveal the
          rest of each row. */}
      <div className="hidden flex-col gap-5 sm:flex">
        <VideoScrollRow videos={ROW_1} />
        <VideoScrollRow videos={ROW_2} />
      </div>
    </section>
  );
}

function VideoScrollRow({ videos }: { videos: readonly SoccerVideo[] }) {
  return (
    <div className="relative">
      <div
        className="-mx-5 overflow-x-auto px-5 [scrollbar-width:none] sm:-mx-10 sm:px-10 [&::-webkit-scrollbar]:hidden"
        style={{
          scrollSnapType: "x mandatory",
          overscrollBehaviorX: "contain",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <ul role="list" className="flex gap-4">
          {videos.map((video) => (
            <li
              key={video.id}
              className="w-[260px] shrink-0 md:w-[280px] xl:w-[300px]"
              style={{ scrollSnapAlign: "start" }}
            >
              <VideoCollectionCard video={video} />
            </li>
          ))}
        </ul>
      </div>

      {/* No scroll affordance overlay. The partial-card peek at the
          right edge naturally communicates "more to scroll" — no
          gradient, no chevron, no visual artifact at the edge. */}
    </div>
  );
}

import { useTranslations } from "next-intl";

import { InlineVideoPlayer } from "@/components/inline-video-player";
import { formatDuration, type SoccerVideo } from "@/lib/soccer-videos";

type Props = {
  video: SoccerVideo;
};

export function VideoCollectionCard({ video }: Props) {
  const t = useTranslations("HomeVideoCollection");
  const title = t(`items.${video.id}.title` as const);
  const blurb = t(`items.${video.id}.blurb` as const);
  const duration = formatDuration(video.durationSeconds);
  const playLabel = t("playLabel", { title });

  return (
    <article className="group relative flex h-full w-full flex-col overflow-hidden rounded-[var(--radius-lg)] border border-line bg-[rgb(20_16_12_/_0.6)] text-fg backdrop-blur-md transition-[border-color,background-color] duration-300 ease-out hover:border-[rgb(230_57_70_/_0.42)] hover:bg-[rgb(24_19_14_/_0.68)]">
      <InlineVideoPlayer
        thumbnailUrl={video.thumbnailUrl}
        videoUrl={video.videoUrl}
        playLabel={playLabel}
        duration={duration}
      />
      <div className="relative z-10 flex flex-1 flex-col px-4 pt-3 pb-4">
        <h3 className="mb-1.5 pe-6 text-[14px] leading-[1.3] font-semibold tracking-[-0.005em] text-fg">
          {title}
        </h3>
        <p className="line-clamp-2 text-[12px] leading-[1.45] text-fg-dim">
          {blurb}
        </p>
        <a
          href={video.watchUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t("openOnJesusFilm", { title })}
          className="absolute top-3 end-3 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-[rgb(255_255_255_/_0.04)] text-fg-mute no-underline transition-[background-color,color,transform] duration-300 ease-out hover:translate-x-px hover:-translate-y-px hover:bg-[rgb(230_57_70_/_0.88)] hover:text-white rtl:hover:-translate-x-px"
        >
          <svg
            width="12"
            height="12"
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
    </article>
  );
}

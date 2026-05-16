import { useTranslations } from "next-intl";

const VIDEO_ID_DESKTOP = "k7F3RpqXhW8";
const VIDEO_ID_MOBILE = "evGkJ_ZbJQQ";

export function HomeLaunchVideo() {
  const t = useTranslations("HomeLaunchVideo");
  const iframeTitle = t("iframeTitle");

  return (
    <section className="px-0 py-8 sm:py-12">
      <div className="mb-5 text-center sm:mb-7">
        <span className="inline-block font-mono text-[11px] font-semibold tracking-[0.18em] text-accent uppercase">
          {t("eyebrow")}
        </span>
        <h2 className="mt-2 font-display text-[clamp(22px,3vw,32px)] leading-[1.1] font-extrabold tracking-[-0.01em] text-fg">
          {t("heading")}
        </h2>
      </div>

      {/* Desktop / tablet: 16:9 */}
      <div className="mx-auto hidden aspect-video max-w-[960px] overflow-hidden rounded-[var(--radius-lg)] border border-line bg-[rgb(20_16_12_/_0.6)] sm:block">
        <iframe
          src={`https://www.youtube.com/embed/${VIDEO_ID_DESKTOP}`}
          title={iframeTitle}
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="h-full w-full border-0"
        />
      </div>

      {/* Mobile: 9:16 Short */}
      <div className="mx-auto block aspect-[9/16] max-w-[360px] overflow-hidden rounded-[var(--radius-lg)] border border-line bg-[rgb(20_16_12_/_0.6)] sm:hidden">
        <iframe
          src={`https://www.youtube.com/embed/${VIDEO_ID_MOBILE}`}
          title={iframeTitle}
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="h-full w-full border-0"
        />
      </div>
    </section>
  );
}

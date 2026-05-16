import { useTranslations } from "next-intl";

import { LAUNCH_EVENT } from "@/lib/launch-event";

export function HomeLaunchEvent() {
  const t = useTranslations("HomeLaunchEvent");

  return (
    <section className="px-0 py-10 sm:py-14">
      <article className="relative mx-auto grid max-w-[960px] gap-6 overflow-hidden rounded-[var(--radius-lg)] border border-line bg-[rgb(20_16_12_/_0.6)] p-6 backdrop-blur-md sm:grid-cols-[1fr_auto] sm:gap-8 sm:p-8">
        <div>
          <span className="inline-block font-mono text-[11px] font-semibold tracking-[0.18em] text-accent uppercase">
            {t("eyebrow")}
          </span>
          <h2 className="mt-2 font-display text-[clamp(22px,3vw,32px)] leading-[1.1] font-extrabold tracking-[-0.01em] text-fg">
            {t("heading")}
          </h2>
          <p className="mt-3 max-w-[520px] text-base leading-[1.55] text-fg-dim">
            {t("body")}
          </p>

          <dl className="mt-5 grid gap-1.5 text-sm text-fg-mute">
            <div className="flex flex-wrap items-baseline gap-2">
              <dt className="font-mono text-[10px] tracking-[0.16em] text-fg-mute uppercase">
                {t("dateLabel")}
              </dt>
              <dd className="text-fg">{t("dateValue")}</dd>
            </div>
            <div className="flex flex-wrap items-baseline gap-2">
              <dt className="font-mono text-[10px] tracking-[0.16em] text-fg-mute uppercase">
                {t("timeLabel")}
              </dt>
              <dd className="text-fg">{t("timeValue")}</dd>
            </div>
            <div className="flex flex-wrap items-baseline gap-2">
              <dt className="font-mono text-[10px] tracking-[0.16em] text-fg-mute uppercase">
                {t("durationLabel")}
              </dt>
              <dd className="text-fg">{t("durationValue")}</dd>
            </div>
            <div className="flex flex-wrap items-baseline gap-2">
              <dt className="font-mono text-[10px] tracking-[0.16em] text-fg-mute uppercase">
                {t("meetingIdLabel")}
              </dt>
              <dd className="font-mono text-fg">{LAUNCH_EVENT.meetingId}</dd>
            </div>
          </dl>
        </div>

        <div className="flex items-start sm:items-center">
          <a
            href={LAUNCH_EVENT.registrationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-md bg-accent px-6 py-3 font-medium text-white no-underline transition-colors duration-200 ease-out hover:bg-[rgb(230_57_70_/_0.88)]"
          >
            {t("cta")}
          </a>
        </div>
      </article>
    </section>
  );
}

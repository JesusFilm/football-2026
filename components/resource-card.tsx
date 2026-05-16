import { useTranslations } from "next-intl";

import type { Resource } from "@/lib/resources";

type Props = {
  resource: Resource;
};

export function ResourceCard({ resource }: Props) {
  const t = useTranslations("Resources");

  return (
    <a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex h-full flex-col overflow-hidden rounded-[var(--radius-lg)] border border-line bg-[rgb(20_16_12_/_0.6)] px-[22px] pt-5 pb-[18px] text-fg no-underline backdrop-blur-md transition-[border-color,background-color] duration-300 ease-out hover:border-[rgb(230_57_70_/_0.42)] hover:bg-[rgb(24_19_14_/_0.68)]"
    >
      <div className="absolute top-5 end-5 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-[rgb(255_255_255_/_0.04)] text-fg-mute transition-[background-color,color,transform] duration-300 ease-out group-hover:translate-x-px group-hover:-translate-y-px group-hover:bg-[rgb(230_57_70_/_0.88)] group-hover:text-white rtl:group-hover:-translate-x-px">
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          className="rtl-mirror"
        >
          <path d="M3 11L11 3M5 3h6v6" />
        </svg>
      </div>
      <div className="relative z-10 mb-3 pe-12 text-[18px] leading-[1.25] font-semibold tracking-[-0.01em] text-fg">
        {t(`items.${resource.id}.title` as const)}
      </div>
      <p className="relative z-10 mb-3 text-sm leading-[1.5] text-fg-dim">
        {t(`items.${resource.id}.blurb` as const)}
      </p>
      {resource.languageCount !== undefined && (
        <div className="relative z-10 mt-auto font-mono text-[10px] tracking-[0.16em] text-fg-mute uppercase">
          {t("languageCountLabel", { count: resource.languageCount })}
        </div>
      )}
    </a>
  );
}

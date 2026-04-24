import { useTranslations } from "next-intl";

import { BackCrumb } from "@/components/back-crumb";
import type { Region } from "@/lib/regions";

type Props = {
  region: Region;
};

export function RegionHero({ region }: Props) {
  const t = useTranslations("Region");

  return (
    <section className="mx-auto max-w-[980px] px-0 pt-4 pb-10 text-center sm:pt-6 sm:pb-14">
      <div className="hero-transition-item hero-transition-item-0">
        <div className="mb-5 flex justify-center">
          <BackCrumb href="/" label={t("allRegions")} />
        </div>
      </div>
      <div className="hero-transition-item hero-transition-item-1">
        <span className="inline-block font-mono text-[12px] font-semibold tracking-[0.22em] text-white/80 uppercase">
          {region.name}
        </span>
      </div>
      <div className="hero-transition-item hero-transition-item-2">
        <h1 className="mx-auto mt-4 mb-6 max-w-[1100px] font-display text-[clamp(42px,6vw,72px)] leading-[0.96] font-extrabold tracking-[-0.04em] text-accent">
          {t("title")}
        </h1>
      </div>
      <div className="hero-transition-item hero-transition-item-3">
        <p className="mx-auto max-w-[780px] text-balance text-[18px] leading-[1.6] text-white/88 sm:text-[20px]">
          {t("description")}
        </p>
      </div>
    </section>
  );
}

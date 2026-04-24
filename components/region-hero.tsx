import { useTranslations } from "next-intl";

import { BackCrumb } from "@/components/back-crumb";
import type { Region } from "@/lib/regions";

type Props = {
  region: Region;
};

export function RegionHero({ region }: Props) {
  const t = useTranslations("Region");

  return (
    <section className="mx-auto max-w-[760px] px-0 pt-12 pb-7 text-center">
      <div className="hero-transition-item hero-transition-item-0">
        <div className="mb-6 flex justify-center">
          <BackCrumb href="/" label={t("allRegions")} />
        </div>
      </div>
      <div className="hero-transition-item hero-transition-item-1">
        <span className="inline-block font-mono text-[11px] font-semibold tracking-[0.18em] text-accent uppercase">
          {region.name}
        </span>
      </div>
      <div className="hero-transition-item hero-transition-item-2">
        <h1 className="mx-auto my-1.5 mb-5 max-w-[820px] font-display text-[clamp(36px,5vw,56px)] leading-[1.05] font-extrabold tracking-[-0.02em]">
          {t("title")}
        </h1>
      </div>
      <div className="hero-transition-item hero-transition-item-3">
        <p className="mx-auto max-w-[520px] text-base leading-[1.7] text-fg-dim">
          {t("description")}
        </p>
      </div>
    </section>
  );
}

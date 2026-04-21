import { useTranslations } from "next-intl";

import { BackCrumb } from "@/components/back-crumb";
import { RegionFlags } from "@/components/region-flags";
import type { Region } from "@/lib/regions";

type Props = {
  countryCountLabel: string;
  journeyCount: number;
  region: Region;
};

export function RegionHero({ countryCountLabel, journeyCount, region }: Props) {
  const t = useTranslations("Region");

  return (
    <section className="px-0 pt-12 pb-9 text-center">
      <div className="hero-transition-item hero-transition-item-0">
        <div className="mb-6 flex justify-center">
          <BackCrumb href="/" label={t("allRegions")} />
        </div>
      </div>
      <div className="hero-transition-item hero-transition-item-1">
        <span className="inline-block font-mono text-[11px] font-semibold tracking-[0.18em] text-accent uppercase">
          {t("eyebrow", { regionCode: region.displayCode })}
        </span>
      </div>
      <div className="hero-transition-item hero-transition-item-2">
        <p className="mx-0 my-2.5 mb-1 font-serif text-[clamp(16px,1.4vw,20px)] font-medium text-fg-dim italic">
          {t("tagline")}
        </p>
      </div>
      <div className="hero-transition-item hero-transition-item-3">
        <h1 className="mx-auto my-1.5 mb-5 max-w-[820px] font-display text-[clamp(36px,5vw,56px)] leading-[1.05] font-extrabold tracking-[-0.02em]">
          {t("title", { regionName: region.name })}
        </h1>
      </div>
      <div className="hero-transition-item hero-transition-item-4">
        <p className="mx-auto max-w-[600px] text-base leading-[1.6] text-fg-dim">
          {t("description", { regionBlurb: region.blurb })}
        </p>
      </div>
      <div className="hero-transition-item hero-transition-item-5">
        <div className="mt-[22px] flex flex-col items-center justify-center gap-3 font-mono text-[11px] tracking-[0.12em] text-fg-mute uppercase sm:flex-row sm:gap-[18px]">
          <div className="flex items-center gap-1.5">
            <RegionFlags flagCodes={region.flagCodes} size="lg" />
          </div>
          <span className="hidden h-1.5 w-1.5 rounded-full bg-line-strong sm:block" />
          <div className="flex items-center justify-center gap-[18px]">
            <div>
              <strong className="me-1.5 font-display text-[18px] font-bold tracking-[-0.01em] text-fg not-italic">
                {countryCountLabel}
              </strong>
              {t("countriesLabel", { count: Number(countryCountLabel) || 0 })}
            </div>
            <span className="h-1.5 w-1.5 rounded-full bg-line-strong" />
            <div>
              <strong className="me-1.5 font-display text-[18px] font-bold tracking-[-0.01em] text-fg not-italic">
                {journeyCount}
              </strong>
              {t("languagesLabel", { count: journeyCount })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

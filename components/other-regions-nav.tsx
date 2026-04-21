import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import type { Region } from "@/lib/regions";

type Props = {
  currentRegionId: string;
  regions: Region[];
};

export function OtherRegionsNav({ currentRegionId, regions }: Props) {
  const t = useTranslations("Region");
  const otherRegions = regions.filter(
    (region) => region.id !== currentRegionId,
  );

  return (
    <nav
      aria-labelledby="other-regions-heading"
      className="border-t border-line py-10"
    >
      <h2
        id="other-regions-heading"
        className="mb-4 text-center font-display text-[24px] font-bold tracking-[-0.01em]"
      >
        {t("otherRegionsHeading")}
      </h2>
      <div className="mx-auto flex max-w-[900px] flex-wrap justify-center gap-2">
        {otherRegions.map((region) => (
          <Link
            key={region.id}
            href={`/${region.id}`}
            className="rounded-[var(--radius-md)] border border-line-strong bg-[rgb(12_10_8_/_0.42)] px-3 py-2 font-mono text-[10px] tracking-[0.12em] text-fg-dim uppercase no-underline backdrop-blur-md transition-colors hover:border-accent hover:text-fg"
          >
            {region.displayCode}
            <span className="sr-only"> {region.name}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

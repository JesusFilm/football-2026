import { getTranslations } from "next-intl/server";

import type { Locale } from "@/i18n/routing";
import { getRegionById, REGIONS, type Region } from "@/lib/regions";

export async function getLocalizedRegions(locale: Locale): Promise<Region[]> {
  const t = await getTranslations({ locale, namespace: "Regions" });

  return REGIONS.map((region) => ({
    ...region,
    name: t(`${region.id}.name`),
    blurb: t(`${region.id}.blurb`),
    seoDescription: t(`${region.id}.seoDescription`),
    flagCodes: region.flagCodes.map((flag) => ({
      ...flag,
      label: t(`${region.id}.flags.${flag.countryCode}`),
    })),
  }));
}

export async function getLocalizedRegion(
  locale: Locale,
  id: string,
): Promise<Region | undefined> {
  if (!getRegionById(id)) return undefined;
  const regions = await getLocalizedRegions(locale);
  return regions.find((region) => region.id === id);
}

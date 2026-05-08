"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { HomeCountryViewsReveal } from "@/components/home-country-views-reveal";
import { HomeCountryViewsInteractiveLoader } from "@/components/home-country-views-interactive-loader";
import { CountryViewsSummary } from "@/components/country-views-summary";
import type { CountryView } from "@/lib/country-views";
import { aggregateByCountry } from "@/lib/map-utils";
import type { Region } from "@/lib/regions";

type DataSource = "original" | "live";

type Props = {
  regions: Region[];
  jsonbinCountries: CountryView[];
  plausibleCountries: CountryView[];
};

export function HomeCountryViewsSection({
  regions,
  jsonbinCountries,
  plausibleCountries,
}: Props) {
  const t = useTranslations("CountryViews");
  const showToggle =
    jsonbinCountries.length > 0 && plausibleCountries.length > 0;
  const [source, setSource] = useState<DataSource>("original");
  const countries =
    source === "live" && plausibleCountries.length > 0
      ? plausibleCountries
      : jsonbinCountries;

  return (
    <HomeCountryViewsReveal
      summary={
        <>
          {showToggle && (
            <DataSourceToggle source={source} onChange={setSource} />
          )}
          <CountryViewsSummary
            countries={aggregateByCountry(countries)}
            heading={t("topCountriesHeading")}
            listLabel={t("globalRankingLabel")}
            limit={10}
          />
        </>
      }
      interactive={
        <HomeCountryViewsInteractiveLoader
          regions={regions}
          countries={countries}
        />
      }
    />
  );
}

function DataSourceToggle({
  source,
  onChange,
}: {
  source: DataSource;
  onChange: (s: DataSource) => void;
}) {
  const t = useTranslations("CountryViews");
  return (
    <div className="mb-4 flex justify-end gap-1">
      <SourceButton
        active={source === "original"}
        onClick={() => onChange("original")}
      >
        {t("sourceOriginal")}
      </SourceButton>
      <SourceButton active={source === "live"} onClick={() => onChange("live")}>
        {t("sourceLive")}
      </SourceButton>
    </div>
  );
}

function SourceButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-[var(--radius-md)] border px-2.5 py-1 font-mono text-[10px] tracking-[0.1em] uppercase transition-colors ${
        active
          ? "border-accent bg-[rgb(230_57_70_/_0.82)] text-white"
          : "border-line-strong bg-[rgb(12_10_8_/_0.42)] text-fg-dim hover:border-accent hover:text-fg"
      }`}
    >
      {children}
    </button>
  );
}

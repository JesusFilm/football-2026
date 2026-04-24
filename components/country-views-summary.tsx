import { useLocale, useTranslations } from "next-intl";

import type { CountryView } from "@/lib/country-views";
import { getCountryDisplayName } from "@/lib/country-display";
import { formatViewsForLocale } from "@/lib/map-utils";

type Props = {
  countries: CountryView[];
  heading: string;
  listLabel: string;
  limit?: number;
  totalViewsLabel?: string;
};

export function CountryViewsSummary({
  countries,
  heading,
  listLabel,
  limit = 10,
  totalViewsLabel,
}: Props) {
  const locale = useLocale();
  const t = useTranslations("CountryViews");
  const totalViews = countries.reduce(
    (sum, country) => sum + country.journeyViews,
    0,
  );
  const topCountry = countries[0]
    ? getCountryDisplayName(locale, countries[0])
    : "-";
  const visibleCountries = countries.slice(0, limit);

  return (
    <div className="mb-6 rounded-none border-0 bg-transparent p-0 md:rounded-[var(--radius-lg)] md:border md:border-line md:bg-[rgb(12_10_8_/_0.54)] md:p-5 md:backdrop-blur-md">
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <SummaryMetric label={t("topCountry")} value={topCountry} />
        <SummaryMetric
          label={totalViewsLabel ?? t("totalViews")}
          value={formatViewsForLocale(totalViews, locale)}
        />
      </div>

      <div className="mb-2 font-mono text-[10px] tracking-[0.14em] text-fg-mute uppercase">
        {heading}
      </div>
      <ol
        className="m-0 grid list-none grid-cols-1 gap-1.5 p-0 md:grid-cols-2"
        aria-label={listLabel}
      >
        {visibleCountries.map((country, index) => (
          <li
            key={`${country.regionCode}-${country.countryName}`}
            className="grid min-h-9 grid-cols-[32px_minmax(0,1fr)_auto] items-center gap-3 rounded-[var(--radius-md)] border border-line bg-[rgb(12_10_8_/_0.42)] px-3 py-2 backdrop-blur-md"
          >
            <span className="font-mono text-[11px] text-fg-mute">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="min-w-0 truncate text-sm font-semibold text-fg">
              {getCountryDisplayName(locale, country)}
            </span>
            <strong className="font-mono text-[12px] text-fg">
              {formatViewsForLocale(country.journeyViews, locale)}
            </strong>
          </li>
        ))}
      </ol>
    </div>
  );
}

function SummaryMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-[var(--radius-md)] border border-line bg-[rgb(12_10_8_/_0.42)] px-4 py-3 backdrop-blur-md">
      <div className="mb-1 font-mono text-[10px] tracking-[0.14em] text-fg-mute uppercase">
        {label}
      </div>
      <div className="truncate font-display text-[24px] font-bold tracking-[-0.01em] text-fg">
        {value}
      </div>
    </div>
  );
}

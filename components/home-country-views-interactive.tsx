"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import WorldMap from "react-svg-worldmap";

import type { CountryView } from "@/lib/country-views";
import { REGION_FOCUS } from "@/lib/map-focus";
import {
  countryFill,
  formatViews,
  supportedCountryCodes,
  toMapData,
} from "@/lib/map-utils";
import type { JsonbinRegionCode, Region } from "@/lib/regions";

type Props = {
  regions: Region[];
  countries: CountryView[];
  initialSelection?: Selection;
};

type Selection = JsonbinRegionCode | "All";
const ROTATION_INTERVAL_MS = 6000;
const COUNTRY_LIST_LIMIT = 10;
const CONTENT_TRANSITION_MS = 1150;

function supportsDesktopHover(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(min-width: 768px) and (hover: hover)").matches
  );
}

export function HomeCountryViewsInteractive({
  regions,
  countries,
  initialSelection = "All",
}: Props) {
  const [selection, setSelection] = useState<Selection>(initialSelection);
  const [displaySelection, setDisplaySelection] =
    useState<Selection>(initialSelection);
  const [outgoingSelection, setOutgoingSelection] = useState<Selection | null>(
    null,
  );
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [highlightedCountryCode, setHighlightedCountryCode] = useState<
    string | null
  >(null);

  const selectionOrder = useMemo<Selection[]>(
    () => ["All", ...regions.map((region) => region.code)],
    [regions],
  );
  const selectedCountries = useMemo(
    () =>
      selection === "All"
        ? countries
        : countries.filter((country) => country.regionCode === selection),
    [countries, selection],
  );
  const mapData = useMemo(
    () => toMapData(selectedCountries),
    [selectedCountries],
  );
  const displayCountries = useMemo(
    () =>
      displaySelection === "All"
        ? countries
        : countries.filter(
            (country) => country.regionCode === displaySelection,
          ),
    [countries, displaySelection],
  );
  const outgoingCountries = useMemo(
    () =>
      outgoingSelection === null
        ? []
        : outgoingSelection === "All"
          ? countries
          : countries.filter(
              (country) => country.regionCode === outgoingSelection,
            ),
    [countries, outgoingSelection],
  );
  const maxViews = Math.max(...mapData.map((country) => country.value), 0);
  const focus =
    selection === "All" ? REGION_FOCUS.NAmOceania : REGION_FOCUS[selection];
  const totalViews = displayCountries.reduce(
    (sum, country) => sum + country.journeyViews,
    0,
  );
  const topCountry = displayCountries[0]?.countryName ?? "-";
  const displayedCountries = displayCountries.slice(0, COUNTRY_LIST_LIMIT);
  const outgoingTopCountry = outgoingCountries[0]?.countryName;
  const outgoingTotalViews = outgoingCountries.reduce(
    (sum, country) => sum + country.journeyViews,
    0,
  );
  const outgoingDisplayedCountries = outgoingCountries.slice(
    0,
    COUNTRY_LIST_LIMIT,
  );
  const visibleRowCount = Math.max(
    displayedCountries.length,
    outgoingDisplayedCountries.length,
  );

  useEffect(() => {
    if (selection === displaySelection) return;

    let transitionTimeoutId: number | undefined;
    const startTimeoutId = window.setTimeout(() => {
      setOutgoingSelection(displaySelection);
      setDisplaySelection(selection);

      transitionTimeoutId = window.setTimeout(() => {
        setOutgoingSelection(null);
      }, CONTENT_TRANSITION_MS);
    }, 0);

    return () => {
      window.clearTimeout(startTimeoutId);
      if (transitionTimeoutId !== undefined) {
        window.clearTimeout(transitionTimeoutId);
      }
    };
  }, [displaySelection, selection]);

  useEffect(() => {
    if (!autoAdvance || selectionOrder.length < 2) return;

    const intervalId = window.setInterval(() => {
      setSelection((currentSelection) => {
        const currentIndex = selectionOrder.indexOf(currentSelection);
        const nextIndex =
          currentIndex === -1 ? 0 : (currentIndex + 1) % selectionOrder.length;

        return selectionOrder[nextIndex];
      });
    }, ROTATION_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [autoAdvance, selectionOrder]);

  const selectRegion = (nextSelection: Selection) => {
    setAutoAdvance(false);
    setSelection(nextSelection);
  };

  const highlightCountry = (country: CountryView) => {
    if (
      country.countryCode &&
      supportedCountryCodes.has(country.countryCode) &&
      supportsDesktopHover()
    ) {
      setHighlightedCountryCode(country.countryCode);
    }
  };

  return (
    <div className="rounded-none border-0 bg-transparent p-0 backdrop-blur-none md:rounded-[var(--radius-lg)] md:border md:border-line md:bg-[rgb(12_10_8_/_0.65)] md:p-7 md:backdrop-blur-md">
      <div className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.8fr)] lg:items-stretch lg:gap-7">
        <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-3">
          <Metric
            animationKey={`${displaySelection}-top-country`}
            animationOrder={0}
            label="Top country"
            outgoingKey={
              outgoingSelection ? `${outgoingSelection}-top-country` : undefined
            }
            outgoingValue={outgoingTopCountry}
            value={topCountry}
          />
          <Metric
            animationKey={`${displaySelection}-total-views`}
            animationOrder={1}
            label="Total views"
            outgoingKey={
              outgoingSelection ? `${outgoingSelection}-total-views` : undefined
            }
            outgoingValue={
              outgoingSelection ? formatViews(outgoingTotalViews) : undefined
            }
            value={formatViews(totalViews)}
          />
          <Metric
            animationKey={`${displaySelection}-countries`}
            animationOrder={2}
            label="Countries"
            outgoingKey={
              outgoingSelection ? `${outgoingSelection}-countries` : undefined
            }
            outgoingValue={
              outgoingSelection ? String(outgoingCountries.length) : undefined
            }
            value={String(displayCountries.length)}
          />
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:h-full lg:w-full lg:grid-rows-2">
          <RegionButton
            active={selection === "All"}
            autoAdvancing={autoAdvance}
            label="All"
            onClick={() => selectRegion("All")}
          />
          {regions.map((region) => (
            <RegionButton
              key={region.id}
              active={selection === region.code}
              autoAdvancing={autoAdvance}
              label={region.displayCode}
              onClick={() => selectRegion(region.code)}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-7 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.8fr)] lg:items-start">
        <div className="min-w-0">
          <div className="flex overflow-hidden rounded-[var(--radius-md)] border border-line bg-[rgb(12_10_8_/_0.42)] px-2 py-4 backdrop-blur-md md:h-[440px] md:items-center">
            <div
              className="w-full origin-center transition-transform duration-700 ease-out"
              style={{
                transform: `scale(${focus.scale})`,
                transformOrigin: `${focus.x}% ${focus.y}%`,
              }}
            >
              <WorldMap
                data={mapData}
                color="#e63946"
                backgroundColor="transparent"
                borderColor="rgba(245, 241, 232, 0.24)"
                tooltipBgColor="#141009"
                tooltipTextColor="#f5f1e8"
                frame={false}
                richInteraction
                size="responsive"
                valueSuffix=" views"
                styleFunction={({ countryCode, countryValue }) => {
                  const code = String(countryCode).toUpperCase();
                  const highlighted = highlightedCountryCode === code;

                  return {
                    fill: countryFill(Number(countryValue ?? 0), maxViews),
                    stroke: highlighted
                      ? "rgba(255, 255, 255, 0.95)"
                      : "rgba(245, 241, 232, 0.2)",
                    strokeWidth: highlighted ? 1.8 : 0.6,
                    outline: "none",
                    transition:
                      "fill 160ms ease, stroke 160ms ease, stroke-width 160ms ease",
                  };
                }}
                tooltipTextFunction={({ countryName, countryValue }) =>
                  `${countryName}: ${formatViews(Number(countryValue ?? 0))} views`
                }
              />
            </div>
          </div>
        </div>

        <ol className="m-0 list-none p-0" aria-label="Country ranking">
          {Array.from({ length: visibleRowCount }, (_, index) => {
            const country = displayedCountries[index];
            const outgoingCountry = outgoingDisplayedCountries[index];

            return (
              <li
                key={`${displaySelection}-${outgoingSelection ?? "none"}-${index}`}
                className="relative mb-1.5 min-h-10 overflow-hidden rounded-[var(--radius-md)] border border-line bg-[rgb(12_10_8_/_0.42)] px-3 py-2 backdrop-blur-md transition-colors hover:border-[rgb(230_57_70_/_0.45)] hover:bg-[rgb(230_57_70_/_0.08)] md:h-[38.6px] md:min-h-0"
                onMouseEnter={() => {
                  if (country) highlightCountry(country);
                }}
                onMouseLeave={() => setHighlightedCountryCode(null)}
              >
                {outgoingCountry ? (
                  <CountryRowContent
                    animation="exit"
                    country={outgoingCountry}
                    rank={index + 1}
                    style={{
                      animationDelay: `${Math.min(index, 9) * 70}ms`,
                    }}
                  />
                ) : null}
                {country ? (
                  <CountryRowContent
                    animation="enter"
                    country={country}
                    rank={index + 1}
                    style={{
                      animationDelay: `${Math.min(index, 9) * 70 + (outgoingSelection ? 170 : 0)}ms`,
                    }}
                  />
                ) : null}
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

function Metric({
  animationKey,
  animationOrder,
  label,
  outgoingKey,
  outgoingValue,
  value,
}: {
  animationKey: string;
  animationOrder: number;
  label: string;
  outgoingKey?: string;
  outgoingValue?: string;
  value: string;
}) {
  const exitDelay = `${animationOrder * 90}ms`;
  const enterDelay = `${animationOrder * 90 + (outgoingValue ? 170 : 0)}ms`;

  return (
    <div className="min-w-0 rounded-[var(--radius-md)] border border-line bg-[rgb(12_10_8_/_0.42)] px-4 py-3 backdrop-blur-md">
      <div className="mb-1 font-mono text-[10px] tracking-[0.14em] text-fg-mute uppercase">
        {label}
      </div>
      <div className="relative overflow-hidden truncate font-display text-[24px] font-bold tracking-[-0.01em] text-fg">
        {outgoingValue ? (
          <span
            key={outgoingKey}
            className="metric-value-exit absolute inset-x-0 top-0 block truncate"
            style={{ animationDelay: exitDelay }}
          >
            {outgoingValue}
          </span>
        ) : null}
        <span
          key={animationKey}
          className="metric-value-enter block truncate"
          style={{ animationDelay: enterDelay }}
        >
          {value}
        </span>
      </div>
    </div>
  );
}

function CountryRowContent({
  animation,
  country,
  rank,
  style,
}: {
  animation: "enter" | "exit";
  country: CountryView;
  rank: number;
  style: CSSProperties;
}) {
  return (
    <div
      className={`${animation === "exit" ? "country-row-exit absolute inset-y-0 inset-x-3" : "country-row-enter h-full"} grid grid-cols-[32px_minmax(0,1fr)_auto] items-center gap-3`}
      style={style}
    >
      <span className="font-mono text-[11px] text-fg-mute">
        {String(rank).padStart(2, "0")}
      </span>
      <span className="min-w-0 truncate text-sm font-semibold text-fg">
        {country.countryName}
      </span>
      <strong className="font-mono text-[12px] text-fg">
        {formatViews(country.journeyViews)}
      </strong>
    </div>
  );
}

function RegionButton({
  active,
  autoAdvancing,
  label,
  onClick,
}: {
  active: boolean;
  autoAdvancing: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative min-w-0 overflow-hidden rounded-[var(--radius-md)] border px-2 py-2 font-mono text-[10px] tracking-[0.08em] whitespace-nowrap uppercase transition-colors lg:h-full ${
        active
          ? "border-accent bg-[rgb(230_57_70_/_0.82)] text-white backdrop-blur-md"
          : "border-line-strong bg-[rgb(12_10_8_/_0.42)] text-fg-dim backdrop-blur-md hover:border-accent hover:text-fg"
      }`}
    >
      {active && autoAdvancing ? (
        <span
          key={label}
          aria-hidden="true"
          data-testid="auto-advance-progress"
          className="absolute inset-y-0 left-0 w-full origin-left bg-[rgb(255_255_255_/_0.18)]"
          style={{
            animation: `auto-advance-progress ${ROTATION_INTERVAL_MS}ms linear forwards`,
          }}
        />
      ) : null}
      <span className="relative z-10">{label}</span>
    </button>
  );
}

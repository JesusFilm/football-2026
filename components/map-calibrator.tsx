"use client";

import { useMemo, useRef, useState } from "react";
import WorldMap, {
  regions as worldMapRegions,
  type DataItem,
  type ISOCode,
} from "react-svg-worldmap";

import type { CountryView } from "@/lib/country-views";
import { REGION_FOCUS, type RegionFocus } from "@/lib/map-focus";
import type { JsonbinRegionCode, Region } from "@/lib/regions";

type Props = {
  regions: Region[];
  countries: CountryView[];
};

const supportedCountryCodes = new Set(
  worldMapRegions.map((region) => region.code.toUpperCase()),
);

const numberFormatter = new Intl.NumberFormat("en-US");

function formatViews(value: number): string {
  return numberFormatter.format(value);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function toMapData(countries: CountryView[]): DataItem<number>[] {
  return countries
    .filter(
      (country) =>
        country.countryCode && supportedCountryCodes.has(country.countryCode),
    )
    .map((country) => ({
      country: country.countryCode!.toLowerCase() as ISOCode,
      value: country.journeyViews,
    }));
}

function viewIntensity(value: number, maxValue: number): number {
  if (value <= 0 || maxValue <= 0) return 0;
  return Math.log1p(value) / Math.log1p(maxValue);
}

function countryFill(value: number, maxValue: number) {
  const intensity = viewIntensity(value, maxValue);
  if (intensity === 0) return "rgba(245, 241, 232, 0.1)";
  const opacity = 0.24 + intensity * 0.76;
  return `rgba(230, 57, 70, ${opacity.toFixed(2)})`;
}

function formatFocus(focus: RegionFocus) {
  return `{ scale: ${focus.scale.toFixed(2)}, x: ${Math.round(focus.x)}, y: ${Math.round(focus.y)} }`;
}

export function MapCalibrator({ regions, countries }: Props) {
  const [regionCode, setRegionCode] = useState<JsonbinRegionCode>(
    regions[0]?.code ?? "NAmOceania",
  );
  const [focusByRegion, setFocusByRegion] =
    useState<Record<JsonbinRegionCode, RegionFocus>>(REGION_FOCUS);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    focus: RegionFocus;
  } | null>(null);

  const focus = focusByRegion[regionCode];
  const regionCountries = useMemo(
    () => countries.filter((country) => country.regionCode === regionCode),
    [countries, regionCode],
  );
  const mapData = useMemo(() => toMapData(regionCountries), [regionCountries]);
  const maxViews = Math.max(...mapData.map((country) => country.value), 0);
  const output = `${regionCode}: ${formatFocus(focus)},`;

  const setFocus = (next: RegionFocus) => {
    setFocusByRegion((current) => ({
      ...current,
      [regionCode]: {
        scale: Number(next.scale.toFixed(2)),
        x: Number(next.x.toFixed(1)),
        y: Number(next.y.toFixed(1)),
      },
    }));
  };

  const copy = async () => {
    await navigator.clipboard.writeText(output);
  };

  return (
    <main className="mx-auto max-w-[1280px] px-6 py-8 text-fg">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="m-0 font-mono text-[11px] tracking-[0.16em] text-accent uppercase">
            Temporary map calibration
          </p>
          <h1 className="m-0 mt-2 font-display text-[38px] font-bold tracking-[-0.02em]">
            Tune Region Focus
          </h1>
        </div>
        <label className="flex flex-col gap-2 font-mono text-[11px] tracking-[0.14em] text-fg-mute uppercase">
          Region
          <select
            value={regionCode}
            onChange={(event) =>
              setRegionCode(event.target.value as JsonbinRegionCode)
            }
            className="rounded-[var(--radius-md)] border border-line-strong bg-ink-2 px-3 py-2 font-sans text-sm tracking-normal text-fg normal-case"
          >
            {regions.map((candidate) => (
              <option key={candidate.id} value={candidate.code}>
                {candidate.name} / {candidate.code}
              </option>
            ))}
          </select>
        </label>
      </div>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div
          className="relative flex h-[560px] touch-none items-center overflow-hidden rounded-[var(--radius-lg)] border border-line bg-[rgb(12_10_8_/_0.72)] px-2 py-4"
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId);
            dragRef.current = {
              pointerId: event.pointerId,
              startX: event.clientX,
              startY: event.clientY,
              focus,
            };
          }}
          onPointerMove={(event) => {
            const drag = dragRef.current;
            if (!drag || drag.pointerId !== event.pointerId) return;
            setFocus({
              ...focus,
              x: clamp(
                drag.focus.x + (event.clientX - drag.startX) / 8,
                0,
                100,
              ),
              y: clamp(
                drag.focus.y + (event.clientY - drag.startY) / 8,
                0,
                100,
              ),
            });
          }}
          onPointerUp={(event) => {
            if (dragRef.current?.pointerId === event.pointerId) {
              dragRef.current = null;
            }
          }}
        >
          <div
            className="w-full origin-center"
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
              styleFunction={({ countryValue }) => ({
                fill: countryFill(Number(countryValue ?? 0), maxViews),
                stroke: countryValue
                  ? "rgba(255, 255, 255, 0.7)"
                  : "rgba(245, 241, 232, 0.14)",
                strokeWidth: countryValue ? 1 : 0.5,
                outline: "none",
              })}
              tooltipTextFunction={({ countryName, countryValue }) =>
                `${countryName}: ${formatViews(Number(countryValue ?? 0))} views`
              }
            />
          </div>
        </div>

        <aside className="rounded-[var(--radius-lg)] border border-line bg-[rgb(12_10_8_/_0.72)] p-5">
          <div className="mb-5 grid grid-cols-2 gap-3">
            <Metric label="Countries" value={String(regionCountries.length)} />
            <Metric label="Mapped" value={String(mapData.length)} />
          </div>

          <Control
            label="Scale"
            min={0.8}
            max={4}
            step={0.05}
            value={focus.scale}
            onChange={(scale) => setFocus({ ...focus, scale })}
          />
          <Control
            label="X origin"
            min={0}
            max={100}
            step={1}
            value={focus.x}
            onChange={(x) => setFocus({ ...focus, x })}
          />
          <Control
            label="Y origin"
            min={0}
            max={100}
            step={1}
            value={focus.y}
            onChange={(y) => setFocus({ ...focus, y })}
          />

          <button
            type="button"
            onClick={copy}
            className="mt-4 w-full rounded-[var(--radius-md)] border border-accent-deep bg-accent-deep px-4 py-3 font-mono text-[11px] tracking-[0.14em] text-white uppercase transition-colors hover:bg-accent"
          >
            Copy focus config
          </button>

          <pre className="mt-4 overflow-x-auto rounded-[var(--radius-md)] border border-line bg-ink-2 p-3 font-mono text-xs text-fg-dim">
            {output}
          </pre>

          <ol className="mt-5 max-h-[260px] list-none overflow-y-auto p-0 pr-1">
            {regionCountries.map((country, index) => (
              <li
                key={`${country.countryName}-${country.countryCode ?? "list"}`}
                className="mb-2 grid grid-cols-[34px_minmax(0,1fr)_auto] gap-3 rounded-[var(--radius-md)] border border-line bg-[rgb(255_255_255_/_0.035)] px-3 py-2 text-sm"
              >
                <span className="font-mono text-[11px] text-fg-mute">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="truncate font-semibold">
                  {country.countryName}
                </span>
                <span className="font-mono text-xs">
                  {formatViews(country.journeyViews)}
                </span>
              </li>
            ))}
          </ol>
        </aside>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--radius-md)] border border-line bg-[rgb(255_255_255_/_0.04)] px-3 py-2">
      <div className="font-mono text-[10px] tracking-[0.14em] text-fg-mute uppercase">
        {label}
      </div>
      <div className="font-display text-[24px] font-bold">{value}</div>
    </div>
  );
}

function Control({
  label,
  min,
  max,
  step,
  value,
  onChange,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="mb-4 block">
      <div className="mb-2 flex items-center justify-between font-mono text-[11px] tracking-[0.14em] text-fg-mute uppercase">
        <span>{label}</span>
        <span>{value.toFixed(step < 1 ? 2 : 0)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full accent-[var(--color-accent)]"
      />
    </label>
  );
}

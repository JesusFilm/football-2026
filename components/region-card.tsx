"use client";

import { useRef } from "react";
import type { MouseEvent } from "react";

import { RegionFlags } from "@/components/region-flags";
import { Link } from "@/i18n/navigation";
import type { Region } from "@/lib/regions";

type Props = {
  region: Region;
};

export function RegionCard({ region }: Props) {
  const cardRef = useRef<HTMLAnchorElement>(null);

  const updateSpotlight = (event: MouseEvent<HTMLAnchorElement>) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    card.style.setProperty("--spotlight-x", `${event.clientX - rect.left}px`);
    card.style.setProperty("--spotlight-y", `${event.clientY - rect.top}px`);
  };

  return (
    <Link
      ref={cardRef}
      href={`/${region.id}`}
      className="group relative isolate flex h-full flex-col overflow-hidden rounded-[var(--radius-lg)] border border-line bg-[rgb(20_16_12_/_0.6)] px-[22px] pt-5 pb-[18px] text-fg no-underline backdrop-blur-md transition-[border-color,background-color] duration-300 ease-out hover:border-[rgb(230_57_70_/_0.42)] hover:bg-[rgb(24_19_14_/_0.68)]"
      onMouseMove={updateSpotlight}
    >
      <span
        className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(220px circle at var(--spotlight-x, 50%) var(--spotlight-y, 50%), rgba(230,57,70,0.18), transparent 62%)",
        }}
      />
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
      <div className="relative z-10 mb-3 pe-12 font-mono text-[10px] tracking-[0.16em] text-accent">
        {region.displayCode}
      </div>
      <div className="relative z-10 mb-1 pe-8 text-[19px] font-semibold tracking-[-0.01em]">
        {region.name}
      </div>
      <div className="relative z-10 mb-[18px] min-h-[38px] text-[13px] leading-[1.5] text-fg-dim">
        {region.blurb}
      </div>
      <div className="relative z-10 mt-auto flex items-center gap-1.5">
        <RegionFlags flagCodes={region.flagCodes} />
      </div>
    </Link>
  );
}

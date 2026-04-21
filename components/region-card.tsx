import Link from "next/link";

import type { Region } from "@/lib/regions";

type Props = {
  region: Region;
};

export function RegionCard({ region }: Props) {
  return (
    <Link
      href={`/${region.id}`}
      className="group relative block h-full overflow-hidden rounded-[var(--radius-lg)] border border-line bg-[rgb(20_16_12_/_0.6)] px-[22px] pt-5 pb-[18px] text-fg no-underline backdrop-blur-md transition-[transform,border-color,background] duration-[220ms] ease-out hover:-translate-y-0.5 hover:border-[rgb(230_57_70_/_0.5)] hover:bg-[rgb(28_22_16_/_0.7)]"
    >
      <span
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-[220ms] group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(500px 150px at 0% 0%, rgba(230,57,70,0.14), transparent 60%)",
        }}
      />
      <div className="absolute top-[18px] right-[18px] flex h-7 w-7 items-center justify-center rounded-full bg-[rgb(255_255_255_/_0.04)] text-fg-mute transition-all duration-[220ms] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:bg-accent group-hover:text-white">
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        >
          <path d="M3 11L11 3M5 3h6v6" />
        </svg>
      </div>
      <div className="mb-1.5 font-mono text-[10px] tracking-[0.16em] text-accent">
        {region.displayCode}
      </div>
      <div className="mb-1 text-[19px] font-semibold tracking-[-0.01em]">
        {region.name}
      </div>
      <div className="mb-[18px] min-h-[38px] text-[13px] leading-[1.5] text-fg-dim">
        {region.blurb}
      </div>
      <div className="flex items-center gap-1.5 text-xl">
        {region.flags.map((flag) => (
          <span key={flag}>{flag}</span>
        ))}
      </div>
    </Link>
  );
}

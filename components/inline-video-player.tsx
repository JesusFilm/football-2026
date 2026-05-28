"use client";

import { useState, useRef } from "react";

type Props = {
  /** Thumbnail URL — shown until the user clicks Play. */
  thumbnailUrl: string;
  /** Direct MP4 URL — used as the <video> src once Play is clicked. */
  videoUrl: string;
  /** Accessible play-button label (e.g. "Play Praying Hands"). */
  playLabel: string;
  /** Visible duration text ("0:51") rendered as a chip until play starts. */
  duration: string;
};

/**
 * Tiny client wrapper inside each video card. Renders the thumbnail with a
 * play affordance until clicked, then swaps to a native <video> element
 * with controls. Native browser playback — no JS video library, no HLS
 * polyfill. The MP4 source is a 720p MUX URL from Arclight.
 *
 * Kept as a focused client boundary so the surrounding card and section
 * stay server components.
 */
export function InlineVideoPlayer({
  thumbnailUrl,
  videoUrl,
  playLabel,
  duration,
}: Props) {
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  if (playing) {
    return (
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-[rgb(11_8_6_/_0.9)]">
        <video
          ref={videoRef}
          src={videoUrl}
          controls
          autoPlay
          playsInline
          preload="metadata"
          className="absolute inset-0 h-full w-full object-contain"
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        // Prevent the surrounding <a> (if any) from also navigating.
        e.preventDefault();
        e.stopPropagation();
        setPlaying(true);
      }}
      aria-label={playLabel}
      className="group/play relative block aspect-[16/9] w-full cursor-pointer overflow-hidden border-0 bg-transparent p-0"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={thumbnailUrl}
        alt=""
        loading="lazy"
        className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover/play:scale-[1.02]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[rgb(20_16_12_/_0.85)] to-transparent"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[rgb(255_255_255_/_0.4)] bg-[rgb(0_0_0_/_0.35)] text-white backdrop-blur-sm transition-all duration-300 ease-out group-hover/play:scale-105 group-hover/play:border-white group-hover/play:bg-[rgb(230_57_70_/_0.85)]">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M8 5v14l11-7L8 5z" />
          </svg>
        </span>
      </span>
      <span className="absolute bottom-3 start-3 z-10 inline-flex items-center rounded-full bg-[rgb(0_0_0_/_0.65)] px-2 py-0.5 font-mono text-[10px] tracking-[0.08em] text-white tabular-nums backdrop-blur-sm">
        {duration}
      </span>
    </button>
  );
}

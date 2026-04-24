"use client";

export function SectionChevron() {
  return (
    <div
      aria-hidden="true"
      className="flex justify-center py-12 text-fg-mute/80"
    >
      <svg
        width="30"
        height="40"
        viewBox="0 0 24 32"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="animate-bob"
      >
        <path d="M7 6l5 5 5-5" />
        <path d="M7 13l5 5 5-5" />
        <path d="M7 20l5 5 5-5" />
      </svg>
    </div>
  );
}

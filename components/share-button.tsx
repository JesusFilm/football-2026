"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  /** Multi-line text written to clipboard on click. */
  text: string;
  /** Default button label. */
  shareLabel: string;
  /** Replaces shareLabel briefly after a successful copy. */
  copiedLabel: string;
  /** Inline SVG (passed from server) shown left of the label. */
  icon: React.ReactNode;
};

/**
 * Tiny client component that copies a pre-built share message to the
 * clipboard. Used in HomeLaunchEvent's tertiary action row. Server
 * components can compose this freely — only the button itself needs
 * to run on the client because navigator.clipboard does.
 */
export function ShareButton({ text, shareLabel, copiedLabel, icon }: Props) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Always clear any pending timeout when the component unmounts.
  useEffect(
    () => () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    },
    [],
  );

  const onClick = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Older browsers / non-HTTPS contexts may not have navigator.clipboard.
      // Fall through to the same UX so users at least see we tried.
    }
    setCopied(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setCopied(false), 2400);
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-live="polite"
      className="inline-flex cursor-pointer items-center gap-1.5 border-0 bg-transparent p-0 text-[13px] text-fg-dim no-underline transition-colors hover:text-fg"
    >
      <span className="text-fg-mute">{icon}</span>
      {copied ? copiedLabel : shareLabel}
    </button>
  );
}

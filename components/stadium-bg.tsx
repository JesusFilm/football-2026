"use client";

import { useEffect, useRef } from "react";

const PARALLAX_SPEED = 0.18;
const MAX_OFFSET_PX = 120;

export function StadiumBg() {
  const stadiumRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const element = stadiumRef.current;
    if (!element) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduceMotion.matches) return;

    let frame = 0;

    const update = () => {
      frame = 0;
      const offset = Math.max(
        -MAX_OFFSET_PX,
        Math.min(MAX_OFFSET_PX, window.scrollY * -PARALLAX_SPEED),
      );
      element.style.setProperty("--stadium-parallax-y", `${offset}px`);
    };

    const requestUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, []);

  return (
    <>
      <div ref={stadiumRef} className="bg-stadium" />
      <div className="grain" />
    </>
  );
}

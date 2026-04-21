"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const TRANSITION_MS = 760;

export function RouteTransitionState() {
  const pathname = usePathname();
  const hasMounted = useRef(false);

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }

    const root = document.documentElement;
    root.dataset.routeTransition = "true";

    const timeout = window.setTimeout(() => {
      delete root.dataset.routeTransition;
    }, TRANSITION_MS);

    return () => {
      window.clearTimeout(timeout);
      delete root.dataset.routeTransition;
    };
  }, [pathname]);

  return null;
}

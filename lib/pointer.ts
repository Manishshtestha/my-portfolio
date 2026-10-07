"use client";

import { useEffect, useState } from "react";

/**
 * Shared, mutation-only pointer/tilt state written by a single passive
 * window listener and read inside R3F render loops. Deliberately lives
 * outside React so it never triggers re-renders.
 */
export const pointer = {
  /** Normalised device coords, -1 … 1, smoothed target. */
  ndcX: 0,
  ndcY: 0,
  /** Raw pixel position for the custom cursor. */
  px: -100,
  py: -100,
  /** Device-orientation contribution (mobile), already normalised. */
  tiltX: 0,
  tiltY: 0,
  /** Pointer speed in px/frame — drives cursor particle emission. */
  speed: 0,
  /** Fine pointer (mouse/trackpad) — custom cursor only makes sense here. */
  fine: false,
};

export function initPointerTracking(): () => void {
  if (typeof window === "undefined") return () => {};

  pointer.fine = window.matchMedia("(pointer: fine)").matches;

  let lastX = 0;
  let lastY = 0;

  const onPointerMove = (e: PointerEvent) => {
    pointer.px = e.clientX;
    pointer.py = e.clientY;
    pointer.speed = Math.hypot(e.clientX - lastX, e.clientY - lastY);
    lastX = e.clientX;
    lastY = e.clientY;
    pointer.ndcX = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.ndcY = -((e.clientY / window.innerHeight) * 2 - 1);
  };

  const onOrientation = (e: DeviceOrientationEvent) => {
    if (e.beta == null || e.gamma == null) return;
    // Clamp + normalise: beta (front-back) ±45° → -1…1, gamma (left-right) ±45°.
    pointer.tiltY = Math.max(-1, Math.min(1, (e.beta - 45) / 45));
    pointer.tiltX = Math.max(-1, Math.min(1, e.gamma / 45));
  };

  const onLeave = () => {
    pointer.px = -100;
    pointer.py = -100;
  };

  window.addEventListener("pointermove", onPointerMove, { passive: true });
  window.addEventListener("deviceorientation", onOrientation, { passive: true });
  document.documentElement.addEventListener("pointerleave", onLeave, {
    passive: true,
  });

  return () => {
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("deviceorientation", onOrientation);
    document.documentElement.removeEventListener("pointerleave", onLeave);
  };
}

/** Client-only mount guard — prevents SSR/hydration mismatches. */
export function useMounted(): boolean {
  const [mounted, setMounted] =
    useState<boolean>(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

/** Reactive prefers-reduced-motion. */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

"use client";

import { useEffect } from "react";
import SpatialCursor from "@/components/chrome/SpatialCursor";
import NavDock from "@/components/chrome/NavDock";
import Terminal from "@/components/chrome/Terminal";
import Toaster from "@/components/chrome/Toaster";
import { audio, SOUND_STORAGE_KEY } from "@/lib/audio";
import { initPointerTracking } from "@/lib/pointer";
import { useUIStore } from "@/store/useUIStore";

/**
 * Global client chrome: ambience layers, spatial cursor, dock, terminal,
 * toasts — plus one-time bootstrapping (pointer tracking, dimension sync,
 * sound preference restore, audio-context unlock on first gesture).
 */
export default function ExperienceLayer() {
  const dimension = useUIStore((s) => s.dimension);
  const setSoundEnabled = useUIStore((s) => s.setSoundEnabled);

  // Mirror the dimension into <html data-dimension> so CSS + shaders follow.
  useEffect(() => {
    document.documentElement.dataset.dimension = dimension;
  }, [dimension]);

  useEffect(() => {
    const disposePointer = initPointerTracking();

    // Restore the visitor's last preferences (stores default to graphite/off
    // to keep SSR/hydration deterministic).
    const savedDimension = window.localStorage.getItem("pf.dimension");
    if (
      savedDimension === "graphite" ||
      savedDimension === "bone" ||
      savedDimension === "slate"
    ) {
      useUIStore.getState().setDimension(savedDimension);
    }
    if (window.localStorage.getItem(SOUND_STORAGE_KEY) === "on") {
      setSoundEnabled(true);
    }

    // AudioContexts need a user gesture to start — resume on first interaction.
    const unlock = () => audio.unlock();
    window.addEventListener("pointerdown", unlock, { once: true, passive: true });
    window.addEventListener("keydown", unlock, { once: true, passive: true });

    return () => {
      disposePointer();
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, [setSoundEnabled]);

  return (
    <>
      {/* Ambience layers sit at the root so they span every section */}
      <div className="grid-backdrop" aria-hidden="true" />
      <div className="noise-overlay" aria-hidden="true" />
      <SpatialCursor />
      <NavDock />
      <Terminal />
      <Toaster />
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { audio } from "@/lib/audio";
import { useUIStore } from "@/store/useUIStore";
import { DIMENSIONS, DIMENSION_ORDER } from "@/lib/data";

/** Speaker on/off switch wired to the Web Audio synth engine. */
export function SoundToggle({ className = "" }: { className?: string }) {
  const enabled = useUIStore((s) => s.soundEnabled);
  const toggle = useUIStore((s) => s.toggleSound);

  return (
    <button
      type="button"
      data-magnetic
      aria-pressed={enabled}
      aria-label={enabled ? "Mute interface sounds" : "Enable interface sounds"}
      title={enabled ? "Sound: on" : "Sound: off"}
      onMouseEnter={() => audio.hover()}
      onClick={toggle}
      className={`glass relative flex h-10 w-10 items-center justify-center rounded-full text-muted transition-colors hover:text-accent ${className}`}
    >
      {enabled ? (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M11 5 6 9H3v6h3l5 4V5Z" />
          <path d="M15.5 8.5a5 5 0 0 1 0 7" />
          <path d="M18.5 5.5a9.5 9.5 0 0 1 0 13" />
        </svg>
      ) : (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M11 5 6 9H3v6h3l5 4V5Z" />
          <path d="m16 9 6 6M22 9l-6 6" />
        </svg>
      )}
      <span
        aria-hidden="true"
        className={`absolute right-0.5 top-0.5 h-1.5 w-1.5 rounded-full transition-opacity ${
          enabled ? "bg-accent opacity-100" : "opacity-0"
        }`}
        style={{ boxShadow: "0 0 8px var(--glow)" }}
      />
    </button>
  );
}

/** Dimension (theme) selector — three glowing world-dots. */
export function DimensionDots({ className = "" }: { className?: string }) {
  const dimension = useUIStore((s) => s.dimension);
  const setDimension = useUIStore((s) => s.setDimension);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div
      role="radiogroup"
      aria-label="Select dimension"
      className={`glass flex h-10 items-center gap-2.5 rounded-full px-3.5 ${className}`}
    >
      {DIMENSION_ORDER.map((key) => {
        const palette = DIMENSIONS[key];
        const active = mounted && dimension === key;
        return (
          <motion.button
            key={key}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={`${palette.label} dimension`}
            title={`${palette.label} dimension`}
            onMouseEnter={() => audio.hover()}
            onClick={() => {
              if (key === dimension) return;
              setDimension(key);
              audio.dimensionShift();
            }}
            whileHover={{ scale: 1.25 }}
            whileTap={{ scale: 0.9 }}
            className="relative h-3 w-3 rounded-full"
            style={{
              background: palette.accent,
              boxShadow: active
                ? `0 0 12px ${palette.accent}, 0 0 0 3px ${palette.accent}33`
                : `0 0 6px ${palette.accent}66`,
              opacity: active ? 1 : 0.55,
            }}
          />
        );
      })}
    </div>
  );
}

/** Small terminal trigger chip (hero hint + dock fallback). */
export function TerminalHint({ className = "" }: { className?: string }) {
  const toggle = useUIStore((s) => s.toggleTerminal);
  const isMac =
    typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);

  return (
    <button
      type="button"
      data-magnetic
      onMouseEnter={() => audio.hover()}
      onClick={toggle}
      className={`glass group flex items-center gap-2.5 rounded-full px-4 py-2 font-mono text-[11px] tracking-widest text-muted transition-colors hover:text-accent ${className}`}
      aria-label="Open command terminal"
    >
      <span aria-hidden="true" className="text-accent">
        ❯_
      </span>
      <span className="hidden sm:inline">TERMINAL</span>
      <kbd className="rounded border border-line px-1.5 py-0.5 text-[10px] text-faint">
        {isMac ? "⌘K" : "Ctrl K"}
      </kbd>
    </button>
  );
}

"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import ScrambleText from "@/components/fx/ScrambleText";
import { DimensionDots, SoundToggle, TerminalHint } from "@/components/chrome/Controls";
import { audio } from "@/lib/audio";
import { useReducedMotion } from "@/lib/pointer";
import { useUIStore } from "@/store/useUIStore";
import { SITE } from "@/lib/data";

/** Heavy WebGL chunk — loaded async after hydration; container is pre-sized so CLS = 0. */
const HeroCanvas = dynamic(() => import("@/components/three/HeroScene"), {
  ssr: false,
});

/** Name with periodic + hover-triggered glitch bursts. */
function GlitchWord({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    let timeout: number;
    const schedule = () => {
      timeout = window.setTimeout(() => {
        const el = ref.current;
        if (el) {
          el.classList.add("glitching");
          window.setTimeout(() => el.classList.remove("glitching"), 340);
        }
        schedule();
      }, 4200 + Math.random() * 4600);
    };
    schedule();
    return () => window.clearTimeout(timeout);
  }, [reduced]);

  return (
    <span
      ref={ref}
      className={`glitch ${className ?? ""}`}
      data-text={text}
      onMouseEnter={() => {
        if (reduced) return;
        const el = ref.current;
        if (!el) return;
        el.classList.add("glitching");
        window.setTimeout(() => el.classList.remove("glitching"), 340);
      }}
    >
      {text}
    </span>
  );
}

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef);
  const reduced = useReducedMotion();
  const [pageVisible, setPageVisible] = useState(true);
  const [sceneReady, setSceneReady] = useState(false);

  // Suspend the WebGL loop whenever the tab is hidden.
  useEffect(() => {
    const onVis = () => setPageVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVis, { passive: true });
    return () =>
      document.removeEventListener("visibilitychange", onVis);
  }, []);

  const active = inView && pageVisible && !reduced;

  return (
    <section
      id="deck"
      ref={sectionRef}
      className="relative flex min-h-[100svh] items-center overflow-hidden"
    >
      {/* ── 3D layer (pre-sized container = zero layout shift) ─────────── */}
      <div className="absolute inset-0" aria-hidden="true">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: sceneReady ? 1 : 0 }}
          transition={{ duration: 1.4, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <HeroCanvas
            active={active}
            reduced={reduced}
            onInit={() => setSceneReady(true)}
          />
        </motion.div>
        {/* Legibility vignette behind copy */}
        <div className="absolute inset-0 bg-[radial-gradient(58rem_36rem_at_22%_50%,var(--void)_0%,transparent_62%)] opacity-90" />
      </div>

      {/* ── Floating controls ──────────────────────────────────────────── */}
      <div className="absolute right-6 top-6 z-20 flex items-center gap-3 sm:right-10 sm:top-8">
        <DimensionDots />
        <SoundToggle />
      </div>

      {/* ── Copy ───────────────────────────────────────────────────────── */}
      <div className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-28 pt-24 sm:px-10">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="mono-label flex items-center gap-3 text-muted"
        >
          <span className="status-dot" aria-hidden="true" />
          {SITE.availability}
        </motion.p>

        <h1 className="mt-7 font-sans text-[clamp(3.4rem,10vw,8.5rem)] font-bold leading-[0.92] tracking-[-0.05em]">
          <motion.span
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="block text-ink"
          >
            <ScrambleText text={SITE.firstName.toUpperCase()} duration={1200} delay={200} />
          </motion.span>
          <motion.span
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="block"
          >
            <GlitchWord
              text={SITE.lastName}
              className="accent-gradient bg-clip-text text-transparent"
            />
          </motion.span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.65 }}
          className="mt-8 max-w-xl text-lg leading-relaxed text-muted"
        >
          <span className="text-ink">{SITE.role}</span> — {SITE.tagline}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-10 flex flex-wrap items-center gap-5"
        >
          <motion.a
            href="#work"
            data-magnetic
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onMouseEnter={() => audio.hover()}
            onClick={() => audio.click()}
            className="accent-gradient group relative inline-flex items-center gap-3 overflow-hidden rounded-full px-7 py-3.5 font-mono text-xs font-semibold tracking-[0.18em] text-black"
          >
            VIEW TRANSMISSIONS
            <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </motion.a>
          <motion.a
            href="#contact"
            data-magnetic
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onMouseEnter={() => audio.hover()}
            onClick={() => audio.click()}
            className="glass inline-flex items-center gap-3 rounded-full px-7 py-3.5 font-mono text-xs tracking-[0.18em] text-ink transition-colors hover:text-accent"
          >
            OPEN CHANNEL
            <span aria-hidden="true">↗</span>
          </motion.a>
          <TerminalHint />
        </motion.div>
      </div>

      {/* ── Scroll cue ─────────────────────────────────────────────────── */}
      <motion.a
        href="#work"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 1 }}
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2"
        aria-label="Scroll to selected work"
        onClick={() => audio.click()}
      >
        <span className="mono-label flex flex-col items-center gap-3 text-faint transition-colors hover:text-accent">
          SCROLL
          <span className="relative block h-10 w-px overflow-hidden bg-line">
            <motion.span
              className="absolute inset-x-0 top-0 h-4 bg-accent"
              animate={reduced ? undefined : { y: [-16, 40] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            />
          </span>
        </span>
      </motion.a>

      {/* ── Corner meta ────────────────────────────────────────────────── */}
      <p className="mono-label pointer-events-none absolute bottom-8 left-6 z-10 hidden text-faint sm:left-10 lg:block">
        {"// PORTFOLIO.SYS v2.0 — "}
        {SITE.location.toUpperCase()}
      </p>
    </section>
  );
}

"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { audio } from "@/lib/audio";
import { useUIStore } from "@/store/useUIStore";
import { PROJECTS, type Project } from "@/lib/data";

/* ── Device-frame media previews (pure CSS/JSX, zero image assets) ────────── */

function LaptopFrame({ project }: { project: Project }) {
  return (
    <div className="relative mx-auto w-full max-w-md">
      <div
        className="rounded-t-2xl border border-line bg-panel-solid p-2 pb-0"
        style={{ boxShadow: `0 0 90px -22px ${project.accent}` }}
      >
        <div className="device-screen relative aspect-[16/10] rounded-t-lg">
          {/* Fake chrome bar */}
          <div className="relative z-10 flex items-center gap-1.5 px-3 pt-2.5">
            <span className="h-1.5 w-1.5 rounded-full bg-red-400/70" />
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400/70" />
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/70" />
            <span className="ml-3 rounded-full border border-line bg-black/30 px-3 py-0.5 font-mono text-[8px] tracking-widest text-muted">
              {project.id}.app
            </span>
          </div>
          {/* Fake dashboard UI */}
          <div className="relative z-10 grid grid-cols-3 gap-2 p-3 pt-3">
            <div className="col-span-2 space-y-2">
              <div
                className="h-14 rounded-md border"
                style={{ borderColor: `${project.accent}33`, background: `${project.accent}14` }}
              />
              <div className="flex items-end gap-1">
                {[42, 68, 30, 84, 55, 74, 38].map((h, i) => (
                  <motion.span
                    key={i}
                    className="w-full rounded-sm"
                    style={{ background: `${project.accent}88` }}
                    initial={{ height: 4 }}
                    animate={{ height: h * 0.5 }}
                    transition={{ delay: 0.3 + i * 0.08, duration: 0.7, ease: "easeOut" }}
                  />
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <div
                className="rounded-md border p-2"
                style={{ borderColor: `${project.accent}33` }}
              >
                <p className="font-mono text-[7px] tracking-widest text-muted">FPS</p>
                <p className="font-mono text-sm" style={{ color: project.accent }}>
                  60
                </p>
              </div>
              <div
                className="rounded-md border p-2"
                style={{ borderColor: `${project.accent}33` }}
              >
                <p className="font-mono text-[7px] tracking-widest text-muted">STATUS</p>
                <p className="font-mono text-[10px] text-ink">● LIVE</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mx-auto h-2.5 w-[112%] max-w-none -translate-x-[5.4%] rounded-b-2xl border border-t-0 border-line bg-gradient-to-b from-white/12 to-white/4" />
    </div>
  );
}

function PhoneFrame({ project }: { project: Project }) {
  return (
    <div className="relative mx-auto w-44">
      <div
        className="rounded-[2.2rem] border border-line bg-panel-solid p-2"
        style={{ boxShadow: `0 0 90px -18px ${project.accent}` }}
      >
        <div className="device-screen relative aspect-[9/18.5] rounded-[1.7rem]">
          <span className="absolute left-1/2 top-2 z-10 h-4 w-16 -translate-x-1/2 rounded-full bg-black/70" />
          <div className="relative z-10 flex h-full flex-col gap-2 px-3 pb-3 pt-9">
            <div
              className="rounded-xl border p-2.5"
              style={{ borderColor: `${project.accent}33`, background: `${project.accent}12` }}
            >
              <p className="font-mono text-[7px] tracking-widest text-muted">TODAY</p>
              <p className="mt-0.5 font-mono text-xs" style={{ color: project.accent }}>
                {project.metrics[0]?.value ?? "—"}
              </p>
            </div>
            {[76, 54, 88].map((pct, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between font-mono text-[7px] text-muted">
                  <span>SET {i + 1}</span>
                  <span>{pct}%</span>
                </div>
                <div className="h-1 overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: project.accent }}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ delay: 0.35 + i * 0.15, duration: 0.8, ease: "easeOut" }}
                  />
                </div>
              </div>
            ))}
            <div className="mt-auto flex justify-between rounded-xl border border-line px-3 py-2">
              {["◍", "◎", "◌"].map((dot, i) => (
                <span
                  key={i}
                  className="font-mono text-xs"
                  style={{ color: i === 0 ? project.accent : "var(--muted)" }}
                >
                  {dot}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Modal ────────────────────────────────────────────────────────────────── */

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

export default function ProjectModal() {
  const activeProjectId = useUIStore((s) => s.activeProjectId);
  const close = useUIStore((s) => s.closeProject);
  const step = useUIStore((s) => s.stepProject);
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  const project = PROJECTS.find((p) => p.id === activeProjectId) ?? null;

  // Scroll lock + focus management + keyboard controls.
  useEffect(() => {
    if (!project) return;
    restoreFocusRef.current = document.activeElement as HTMLElement;
    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";

    const panel = panelRef.current;
    panel?.querySelector<HTMLElement>("[data-autofocus]")?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      } else if (e.key === "ArrowRight") {
        step(1);
      } else if (e.key === "ArrowLeft") {
        step(-1);
      } else if (e.key === "Tab" && panel) {
        const nodes = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
          (el) => el.offsetParent !== null
        );
        if (nodes.length === 0) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
      restoreFocusRef.current?.focus?.();
    };
  }, [project, close, step]);

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          key="project-modal"
          className="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          role="dialog"
          aria-modal="true"
          aria-label={`${project.title} deep dive`}
        >
          {/* Backdrop */}
          <motion.button
            type="button"
            aria-label="Close deep dive"
            onClick={close}
            className="absolute inset-0 bg-black/75 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: 60, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
            className="glass relative z-10 max-h-[88vh] w-full max-w-5xl overflow-y-auto rounded-3xl"
            style={{ ["--project-accent" as string]: project.accent }}
          >
            {/* Top bar */}
            <div className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-line bg-panel-solid/80 px-6 py-4 backdrop-blur-xl sm:px-8">
              <p className="mono-label text-faint">
                DEEP DIVE — {project.index} / {project.year}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => step(-1)}
                  onMouseEnter={() => audio.hover()}
                  aria-label="Previous project"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-muted transition-colors hover:border-accent hover:text-accent"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => step(1)}
                  onMouseEnter={() => audio.hover()}
                  aria-label="Next project"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-muted transition-colors hover:border-accent hover:text-accent"
                >
                  →
                </button>
                <button
                  type="button"
                  data-autofocus
                  onClick={close}
                  onMouseEnter={() => audio.hover()}
                  aria-label="Close deep dive"
                  className="ml-2 flex h-9 w-9 items-center justify-center rounded-full border border-line text-muted transition-colors hover:border-red-400 hover:text-red-400"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="grid gap-10 p-6 sm:p-8 lg:grid-cols-[1.05fr_1fr] lg:p-10">
              {/* Media column */}
              <div className="flex flex-col justify-center gap-8">
                {project.category === "mobile" ? (
                  <PhoneFrame project={project} />
                ) : (
                  <LaptopFrame project={project} />
                )}

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-3">
                  {project.metrics.map((m) => (
                    <div
                      key={m.label}
                      className="glass rounded-xl px-4 py-3 text-center"
                    >
                      <p
                        className="font-mono text-lg font-semibold"
                        style={{ color: project.accent }}
                      >
                        {m.value}
                      </p>
                      <p className="mono-label mt-1 text-faint">{m.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Detail column */}
              <div>
                <p className="mono-label" style={{ color: project.accent }}>
                  {project.role.toUpperCase()}
                </p>
                <h3 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                  {project.title}
                </h3>
                <p className="mt-1.5 text-base text-muted">{project.tagline}</p>
                <p className="mt-5 text-sm leading-relaxed text-muted">
                  {project.description}
                </p>

                <h4 className="mono-label mt-8 text-faint">SYSTEM DESIGN HIGHLIGHTS</h4>
                <ul className="mt-3 space-y-2.5">
                  {project.highlights.map((h) => (
                    <li key={h} className="flex gap-3 text-sm leading-relaxed text-muted">
                      <span
                        className="mt-0.5 font-mono text-xs"
                        style={{ color: project.accent }}
                        aria-hidden="true"
                      >
                        ▸
                      </span>
                      {h}
                    </li>
                  ))}
                </ul>

                <h4 className="mono-label mt-8 text-faint">ARCHITECTURE / STACK</h4>
                <div className="mt-3 flex flex-wrap gap-2">
                  {project.stack.map((tech) => (
                    <span
                      key={tech}
                      className="rounded-full border px-3 py-1.5 font-mono text-[11px] tracking-wide text-ink"
                      style={{
                        borderColor: `${project.accent}44`,
                        background: `${project.accent}0f`,
                      }}
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                <div className="mt-9 flex flex-wrap gap-4">
                  {project.links.map((link) =>
                    link.kind === "live" ? (
                      <motion.a
                        key={link.label}
                        href={link.url}
                        target="_blank"
                        rel="noreferrer noopener"
                        data-magnetic
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        onMouseEnter={() => audio.hover()}
                        onClick={() => audio.click()}
                        className="accent-gradient inline-flex items-center gap-2.5 rounded-full px-6 py-3 font-mono text-[11px] font-semibold tracking-[0.16em] text-black"
                      >
                        {link.label.toUpperCase()}
                        <span aria-hidden="true">↗</span>
                      </motion.a>
                    ) : (
                      <motion.a
                        key={link.label}
                        href={link.url}
                        target="_blank"
                        rel="noreferrer noopener"
                        data-magnetic
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        onMouseEnter={() => audio.hover()}
                        onClick={() => audio.click()}
                        className="glass inline-flex items-center gap-2.5 rounded-full px-6 py-3 font-mono text-[11px] tracking-[0.16em] text-ink transition-colors hover:text-accent"
                      >
                        {link.label.toUpperCase()}
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M16 18 22 12 16 6" />
                          <path d="M8 6 2 12l6 6" />
                        </svg>
                      </motion.a>
                    )
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

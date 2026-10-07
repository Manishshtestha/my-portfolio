"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import SectionHeader from "@/components/fx/SectionHeader";
import { audio } from "@/lib/audio";
import { useReducedMotion } from "@/lib/pointer";
import {
  SKILLS,
  SKILL_CATEGORIES,
  type Skill,
  type SkillCategory,
} from "@/lib/data";

type FilterId = (typeof SKILL_CATEGORIES)[number]["id"];

const CATEGORY_COLORS: Record<SkillCategory, string> = {
  core: "var(--accent)",
  web: "var(--accent-2)",
  webgl: "#d4d4d0",
  mobile: "#a8a29e",
  systems: "#8b8f8a",
  design: "#6f7378",
};

const ORBIT_RADIUS_PCT = [34, 66, 96] as const; // per orbit (1..3), of half-width
const ORBIT_OFFSET = [0, 0.9, 1.9] as const; // stagger rings radially

interface NodeLayout {
  skill: Skill;
  xPct: number;
  yPct: number;
  active: boolean;
}

/** Deterministic radial layout: filtered skills snap onto their orbit rings. */
function computeLayout(filter: FilterId): NodeLayout[] {
  const activeSkills =
    filter === "all"
      ? SKILLS
      : SKILLS.filter((s) => s.category === (filter as SkillCategory));

  return SKILLS.map((skill) => {
    const isActive = activeSkills.includes(skill);
    if (!isActive) {
      // Ghosted cluster near the core.
      const idx = SKILLS.indexOf(skill);
      const angle = idx * 2.399; // golden-angle scatter
      const r = 6 + (idx % 3) * 5;
      return {
        skill,
        xPct: 50 + Math.cos(angle) * r,
        yPct: 50 + Math.sin(angle) * r,
        active: false,
      };
    }
    const ring = skill.orbit - 1;
    const ringPeers = activeSkills.filter((s) => s.orbit === skill.orbit);
    const slot = ringPeers.indexOf(skill);
    const angle =
      (slot / ringPeers.length) * Math.PI * 2 +
      ORBIT_OFFSET[ring] +
      Math.PI * 1.5; // start at top
    const r = ORBIT_RADIUS_PCT[ring];
    return {
      skill,
      xPct: 50 + Math.cos(angle) * r,
      yPct: 50 + Math.sin(angle) * r,
      active: true,
    };
  });
}

export default function Skills() {
  const [filter, setFilter] = useState<FilterId>("all");
  const [selectedId, setSelectedId] = useState<string>("TypeScript");
  const reduced = useReducedMotion();

  const layout = useMemo(() => computeLayout(filter), [filter]);
  const selected =
    layout.find((n) => n.skill.name === selectedId)?.skill ??
    layout[0]?.skill ??
    SKILLS[0];

  return (
    <section id="engine" className="relative z-10 py-28 sm:py-36">
      <div className="mx-auto w-full max-w-6xl px-6 sm:px-10">
        <SectionHeader
          index="02"
          eyebrow="The engine room"
          title={<>Instruments of <span className="accent-gradient bg-clip-text text-transparent">the craft.</span></>}
          description="A live radar of the toolkit. Filter by discipline, select a node to inspect proficiency."
        />

        <div className="mt-14 grid items-center gap-14 lg:grid-cols-[1.15fr_1fr]">
          {/* ── Radar ─────────────────────────────────────────────────── */}
          <div>
            {/* Filters */}
            <div
              role="tablist"
              aria-label="Filter skills by discipline"
              className="mb-8 flex flex-wrap gap-2"
            >
              {SKILL_CATEGORIES.map((c) => {
                const active = filter === c.id;
                return (
                  <button
                    key={c.id}
                    role="tab"
                    aria-selected={active}
                    type="button"
                    onMouseEnter={() => audio.hover()}
                    onClick={() => {
                      setFilter(c.id);
                      audio.click();
                    }}
                    className={`relative rounded-full border px-4 py-1.5 font-mono text-[11px] tracking-[0.14em] transition-colors ${
                      active
                        ? "border-accent text-accent"
                        : "border-line text-muted hover:text-ink"
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="skill-filter-glow"
                        className="absolute inset-0 rounded-full bg-accent-soft"
                        style={{ boxShadow: "0 0 24px -4px var(--glow)" }}
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      />
                    )}
                    <span className="relative">{c.label.toUpperCase()}</span>
                  </button>
                );
              })}
            </div>

            <div
              className="relative mx-auto aspect-square w-full max-w-[520px]"
              role="img"
              aria-label={`Holographic radar of skills, filtered: ${filter}`}
            >
              {/* Rings + crosshairs (r is the radius as % of container width) */}
              {ORBIT_RADIUS_PCT.map((r) => (
                <div
                  key={r}
                  className="radar-ring"
                  style={{ width: `${r}%`, height: `${r}%` }}
                  aria-hidden="true"
                />
              ))}
              <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-line" aria-hidden="true" />
              <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-line" aria-hidden="true" />

              {/* Sweep */}
              {!reduced && <div className="radar-sweep" aria-hidden="true" />}

              {/* Core */}
              <div
                className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent"
                style={{ boxShadow: "0 0 20px var(--glow)" }}
                aria-hidden="true"
              />

              {/* Nodes */}
              {layout.map(({ skill, xPct, yPct, active }) => {
                const isSelected = selected.name === skill.name;
                const color = CATEGORY_COLORS[skill.category];
                return (
                  <motion.button
                    key={skill.name}
                    type="button"
                    aria-pressed={isSelected}
                    onMouseEnter={() => audio.hover()}
                    onClick={() => {
                      setSelectedId(skill.name);
                      audio.click();
                    }}
                    className="absolute z-10 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2"
                    initial={false}
                    animate={{
                      left: `${xPct}%`,
                      top: `${yPct}%`,
                      opacity: active ? 1 : 0.14,
                      scale: active ? 1 : 0.72,
                    }}
                    transition={
                      reduced
                        ? { duration: 0 }
                        : { type: "spring", stiffness: 120, damping: 20 }
                    }
                  >
                    <motion.span
                      className="block rounded-full"
                      style={{
                        width: 7 + (skill.level / 100) * 6,
                        height: 7 + (skill.level / 100) * 6,
                        background: color,
                        boxShadow: active
                          ? `0 0 ${isSelected ? 22 : 12}px ${color}`
                          : "none",
                      }}
                      animate={isSelected && !reduced ? { scale: [1, 1.5, 1] } : { scale: 1 }}
                      transition={{ duration: 1.6, repeat: isSelected ? Infinity : 0 }}
                    />
                    <span
                      className={`whitespace-nowrap font-mono text-[10px] tracking-wider transition-colors ${
                        isSelected ? "text-ink" : "text-muted"
                      }`}
                      style={isSelected ? { textShadow: "0 0 12px var(--glow)" } : undefined}
                    >
                      {skill.name.toUpperCase()}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* ── Detail panel ──────────────────────────────────────────── */}
          <motion.div
            key={selected.name}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="glass rounded-2xl p-8"
            aria-live="polite"
          >
            <p className="mono-label flex items-center justify-between text-faint">
              <span style={{ color: CATEGORY_COLORS[selected.category] }}>
                {selected.category.toUpperCase()}
              </span>
              <span>ORBIT {selected.orbit}</span>
            </p>
            <h3 className="mt-4 text-3xl font-semibold tracking-tight text-ink">
              {selected.name}
            </h3>
            <p className="mt-4 min-h-16 text-sm leading-relaxed text-muted">
              {selected.blurb}
            </p>

            <div className="mt-7">
              <div className="mono-label flex justify-between text-faint">
                <span>PROFICIENCY</span>
                <span className="text-ink">{selected.level}%</span>
              </div>
              <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-white/8">
                <motion.div
                  className="accent-gradient h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${selected.level}%` }}
                  transition={
                    reduced
                      ? { duration: 0 }
                      : { duration: 0.9, ease: [0.22, 1, 0.36, 1] }
                  }
                  style={{ boxShadow: "0 0 16px var(--glow)" }}
                />
              </div>
            </div>

            <p className="mono-label mt-8 border-t border-line pt-5 text-faint">
              {"// HOVER THE RADAR — EVERY NODE IS LIVE"}
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

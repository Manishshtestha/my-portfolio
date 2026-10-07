"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import TiltCard from "@/components/fx/TiltCard";
import SectionHeader from "@/components/fx/SectionHeader";
import ProjectModal from "@/components/sections/ProjectModal";
import { audio } from "@/lib/audio";
import { useUIStore } from "@/store/useUIStore";
import {
  PROJECTS,
  PROJECT_FILTERS,
  type Project,
  type ProjectCategory,
} from "@/lib/data";

type FilterId = (typeof PROJECT_FILTERS)[number]["id"];

/** Category label for the card badge. */
function categoryLabel(c: ProjectCategory) {
  return { web: "WEB", webgl: "WEBGL", mobile: "NATIVE", systems: "SYSTEMS" }[c];
}

function ProjectCard({ project, onOpen }: { project: Project; onOpen: () => void }) {
  return (
    <motion.button
      layout
      type="button"
      onClick={onOpen}
      onMouseEnter={() => audio.hover()}
      whileTap={{ scale: 0.985 }}
      className="group relative block w-full text-left"
      style={{ ["--project-accent" as string]: project.accent }}
      aria-label={`Open deep dive: ${project.title}`}
    >
      <TiltCard
        glow={project.accent}
        className="glass relative overflow-hidden rounded-2xl transition-colors duration-300 group-hover:border-[color-mix(in_srgb,var(--project-accent)_45%,transparent)] group-hover:shadow-[0_0_60px_-12px_var(--project-accent)]"
      >
        {/* Preview screen */}
        <div className="device-screen relative aspect-[16/10]">
          <span className="mono-label absolute left-5 top-5 text-faint">
            {project.index} / {categoryLabel(project.category)}
          </span>
          <span className="mono-label absolute right-5 top-5 text-faint">
            {project.year}
          </span>

          {/* Abstract brand mark */}
          <div
            className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-90 blur-[0.5px] transition-transform duration-700 group-hover:scale-110"
            style={{
              background: `radial-gradient(circle at 32% 28%, ${project.accent}, transparent 68%)`,
              boxShadow: `0 0 80px -10px ${project.accent}`,
            }}
          />
          <div
            aria-hidden="true"
            className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border transition-transform duration-700 group-hover:rotate-45"
            style={{ borderColor: `${project.accent}44` }}
          />
          <div
            aria-hidden="true"
            className="absolute left-1/2 top-1/2 h-52 w-52 -translate-x-1/2 -translate-y-1/2 rounded-full border opacity-60 transition-transform duration-700 group-hover:-rotate-45"
            style={{ borderColor: `${project.accent}22` }}
          />

          <span className="absolute bottom-5 left-5 font-mono text-[11px] tracking-widest text-muted">
            {project.tagline.toUpperCase()}
          </span>
          <span
            className="absolute bottom-5 right-5 flex h-8 w-8 items-center justify-center rounded-full border text-sm transition-all duration-300 group-hover:rotate-45"
            style={{ borderColor: `${project.accent}55`, color: project.accent }}
            aria-hidden="true"
          >
            ↗
          </span>
        </div>

        {/* Meta */}
        <div className="flex items-start justify-between gap-4 px-6 py-5">
          <div>
            <h3 className="text-lg font-semibold tracking-tight text-ink">
              {project.title}
            </h3>
            <p className="mt-1 text-sm text-muted">{project.tagline}</p>
          </div>
        </div>

        {/* Stack strip */}
        <div className="flex flex-wrap gap-1.5 px-6 pb-6">
          {project.stack.slice(0, 4).map((tech) => (
            <span
              key={tech}
              className="rounded-full border border-line px-2.5 py-1 font-mono text-[10px] tracking-wider text-muted"
            >
              {tech}
            </span>
          ))}
          {project.stack.length > 4 && (
            <span className="rounded-full border border-line px-2.5 py-1 font-mono text-[10px] tracking-wider text-faint">
              +{project.stack.length - 4}
            </span>
          )}
        </div>
      </TiltCard>
    </motion.button>
  );
}

export default function Projects() {
  const [filter, setFilter] = useState<FilterId>("all");
  const openProject = useUIStore((s) => s.openProject);

  const visible =
    filter === "all"
      ? PROJECTS
      : PROJECTS.filter((p) => p.category === (filter as ProjectCategory));

  return (
    <section id="work" className="relative z-10 py-28 sm:py-36">
      <div className="mx-auto w-full max-w-6xl px-6 sm:px-10">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <SectionHeader
            index="01"
            eyebrow="Selected transmissions"
            title={<>Work that <span className="accent-gradient bg-clip-text text-transparent">resonates.</span></>}
            description="Four systems built end-to-end — from shader math to store listings. Open a card for the full architecture breakdown."
          />

          {/* Filters */}
          <div
            role="tablist"
            aria-label="Filter projects"
            className="glass flex flex-wrap gap-1 rounded-full p-1.5"
          >
            {PROJECT_FILTERS.map((f) => {
              const active = filter === f.id;
              return (
                <button
                  key={f.id}
                  role="tab"
                  aria-selected={active}
                  type="button"
                  onMouseEnter={() => audio.hover()}
                  onClick={() => {
                    setFilter(f.id);
                    audio.click();
                  }}
                  className={`relative rounded-full px-4 py-2 font-mono text-[11px] tracking-[0.14em] transition-colors ${
                    active ? "text-black" : "text-muted hover:text-ink"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="project-filter-pill"
                      className="accent-gradient absolute inset-0 rounded-full"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  <span className="relative">{f.label.toUpperCase()}</span>
                </button>
              );
            })}
          </div>
        </div>

        <motion.div layout className="mt-14 grid gap-6 sm:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {visible.map((project, i) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, y: 40, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.25 } }}
                transition={{
                  duration: 0.55,
                  delay: i * 0.07,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <ProjectCard
                  project={project}
                  onOpen={() => openProject(project)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      <ProjectModal />
    </section>
  );
}

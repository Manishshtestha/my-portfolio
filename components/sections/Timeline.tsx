"use client";

import { useEffect, useRef } from "react";
import SectionHeader from "@/components/fx/SectionHeader";
import { useReducedMotion } from "@/lib/pointer";
import { MILESTONES } from "@/lib/data";

/**
 * Scroll-linked chronology: a GSAP ScrollTrigger scrub draws the central rail
 * while a glowing head tracks progress; milestones ignite as the rail passes.
 * GSAP is dynamically imported so it never blocks first paint.
 */
export default function Timeline() {
  const rootRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    let cancelled = false;
    let cleanup: (() => void) | undefined;

    (async () => {
      const [gsapMod, stMod] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (cancelled || !rootRef.current) return;

      const gsap = gsapMod.default ?? gsapMod;
      const ScrollTrigger = stMod.ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);

      const ctx = gsap.context(() => {
        if (reduced) {
          gsap.set(".rail-progress", { scaleY: 1 });
          gsap.set(".milestone", { opacity: 1, y: 0 });
          rootRef.current
            ?.querySelectorAll(".m-dot")
            .forEach((el) => el.classList.add("lit"));
          return;
        }

        // Rail draw + progress head.
        gsap.fromTo(
          ".rail-progress",
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: {
              trigger: rootRef.current,
              start: "top 68%",
              end: "bottom 58%",
              scrub: 0.6,
              onUpdate: (self) => {
                if (headRef.current) {
                  headRef.current.style.top = `${self.progress * 100}%`;
                }
              },
            },
          }
        );

        // Milestones ignite.
        gsap.utils.toArray<HTMLElement>(".milestone").forEach((el) => {
          const dot = el.querySelector(".m-dot");
          gsap.fromTo(
            el,
            { opacity: 0.14, y: 46 },
            {
              opacity: 1,
              y: 0,
              duration: 0.75,
              ease: "power2.out",
              scrollTrigger: {
                trigger: el,
                start: "top 80%",
                toggleActions: "play none none reverse",
                onEnter: () => dot?.classList.add("lit"),
                onLeaveBack: () => dot?.classList.remove("lit"),
              },
            }
          );
        });
      }, rootRef);

      ScrollTrigger.refresh();
      cleanup = () => ctx.revert();
    })();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [reduced]);

  return (
    <section id="chrono" className="relative z-10 py-28 sm:py-36">
      <div className="mx-auto w-full max-w-6xl px-6 sm:px-10">
        <SectionHeader
          index="03"
          eyebrow="The chronology"
          title={<>Signal <span className="accent-gradient bg-clip-text text-transparent">history.</span></>}
          description="Five years of compounding craft — every stop left the toolkit heavier."
        />

        <div ref={rootRef} className="relative mt-20">
          {/* Rail */}
          <div
            className="absolute bottom-0 left-[11px] top-0 w-px md:left-1/2"
            aria-hidden="true"
          >
            <div className="absolute inset-0 bg-line" />
            <div
              className="rail-progress absolute inset-0 origin-top"
              style={{
                background:
                  "linear-gradient(to bottom, var(--accent), var(--accent-2))",
                boxShadow: "0 0 12px var(--glow)",
              }}
            />
            <div ref={headRef} className="rail-head" style={{ top: "0%" }} />
          </div>

          {/* Milestones */}
          <div className="space-y-16 md:space-y-24">
            {MILESTONES.map((m, i) => {
              const leftSide = i % 2 === 0;
              return (
                <article
                  key={m.year}
                  className="milestone relative pl-14 md:grid md:grid-cols-2 md:gap-24 md:pl-0"
                >
                  {/* Node */}
                  <span
                    className="m-dot absolute left-[11px] top-9 z-10 h-[15px] w-[15px] -translate-x-1/2 rounded-full md:left-1/2"
                    aria-hidden="true"
                  />

                  {leftSide ? (
                    <>
                      <div className="md:pr-4 md:text-right">
                        <TimelineCard milestone={m} align="right" />
                      </div>
                      <div className="hidden md:block" />
                    </>
                  ) : (
                    <>
                      <div className="hidden md:block" />
                      <div className="md:pl-4">
                        <TimelineCard milestone={m} align="left" />
                      </div>
                    </>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function TimelineCard({
  milestone,
  align,
}: {
  milestone: (typeof MILESTONES)[number];
  align: "left" | "right";
}) {
  const right = align === "right";
  return (
    <div
      className={`glass group relative overflow-hidden rounded-2xl p-7 ${
        right ? "md:items-end" : ""
      }`}
    >
      <p
        className={`pointer-events-none select-none font-mono text-6xl font-bold leading-none text-transparent ${
          right ? "md:text-left" : ""
        }`}
        style={{ WebkitTextStroke: "1px var(--line)" }}
        aria-hidden="true"
      >
        {milestone.year}
      </p>
      <p className="mono-label mt-4 flex items-center gap-3 text-faint">
        <span
          className={`inline-block h-px w-6 bg-accent ${right ? "md:order-2" : ""}`}
          aria-hidden="true"
        />
        {milestone.tag.toUpperCase()}
      </p>
      <h3 className="mt-3 text-xl font-semibold tracking-tight text-ink">
        {milestone.title}
      </h3>
      <p className="mono-label mt-1.5 text-accent">{milestone.org}</p>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        {milestone.description}
      </p>
    </div>
  );
}

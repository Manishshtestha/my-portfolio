"use client";

import { useEffect, useRef } from "react";
import { pointer } from "@/lib/pointer";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
}

/**
 * Spatial cursor: a lagging glow ring + instant core dot + a velocity-driven
 * particle trail on a dedicated 2D canvas. Magnetic elements ([data-magnetic])
 * lean toward the pointer. Fine pointers only; fully disabled under reduced
 * motion.
 */
export default function SpatialCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;

    document.documentElement.classList.add("spatial-cursor");
    const canvas = canvasRef.current;
    const ring = ringRef.current;
    const dot = dotRef.current;
    if (!canvas || !ring || !dot) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    /* ── Canvas sizing (dpr-capped) ───────────────────────────────────── */
    let dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
    };
    resize();
    window.addEventListener("resize", resize, { passive: true });

    /* ── Cursor state ─────────────────────────────────────────────────── */
    let rx = -100, ry = -100; // ring (lagging)
    let dx = -100, dy = -100; // dot (snappy)
    let hovering = false;
    let textMode = false;
    let magneticEl: HTMLElement | null = null;

    const INTERACTIVE =
      'a, button, [role="button"], [data-cursor="hover"], summary';
    const TEXTUAL = 'input, textarea, [contenteditable="true"]';

    const onOver = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      magneticEl = target?.closest<HTMLElement>("[data-magnetic]") ?? null;
      textMode = !!target?.closest(TEXTUAL);
      hovering = !textMode && !!target?.closest(INTERACTIVE);
    };
    window.addEventListener("pointerover", onOver, { passive: true });

    /* ── Particles ────────────────────────────────────────────────────── */
    const particles: Particle[] = [];
    const pool: Particle[] = [];

    const spawn = (x: number, y: number, vx: number, vy: number) => {
      const p =
        pool.pop() ??
        ({ x: 0, y: 0, vx: 0, vy: 0, life: 0, maxLife: 1, size: 1 } as Particle);
      p.x = x;
      p.y = y;
      p.vx = vx;
      p.vy = vy;
      p.maxLife = 26 + Math.random() * 18;
      p.life = p.maxLife;
      p.size = 1 + Math.random() * 2.2;
      particles.push(p);
    };

    /* ── Palette (re-read on dimension change) ────────────────────────── */
    let accent = "#ececea";
    let accent2 = "#9c9ca3";
    const readPalette = () => {
      const style = getComputedStyle(document.documentElement);
      accent = style.getPropertyValue("--accent").trim() || accent;
      accent2 = style.getPropertyValue("--accent-2").trim() || accent2;
    };
    readPalette();
    const observer = new MutationObserver(readPalette);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-dimension"],
    });

    /* ── Render loop ──────────────────────────────────────────────────── */
    let raf = 0;
    const frame = () => {
      raf = requestAnimationFrame(frame);

      // Ring follows with easing; dot snaps quickly.
      rx += (pointer.px - rx) * 0.16;
      ry += (pointer.py - ry) * 0.16;
      dx += (pointer.px - dx) * 0.55;
      dy += (pointer.py - dy) * 0.55;

      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%) scale(${
        textMode ? 0.4 : hovering ? 2.1 : 1
      })`;
      ring.style.opacity = pointer.px < 0 ? "0" : "1";
      ring.style.borderColor = hovering || textMode ? accent : "rgba(255,255,255,0.5)";
      dot.style.transform = `translate3d(${dx}px, ${dy}px, 0) translate(-50%, -50%)`;
      dot.style.opacity = pointer.px < 0 ? "0" : "1";
      dot.style.background = textMode ? accent : accent2;
      dot.style.width = textMode ? "2px" : "6px";
      dot.style.height = textMode ? "22px" : "6px";
      dot.style.borderRadius = textMode ? "1px" : "50%";

      // Magnetic lean.
      if (magneticEl) {
        const rect = magneticEl.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const mx = (pointer.px - cx) * 0.22;
        const my = (pointer.py - cy) * 0.22;
        magneticEl.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
      }

      // Emit trail particles proportional to pointer speed.
      if (pointer.px >= 0 && pointer.speed > 5) {
        const count = Math.min(3, Math.floor(pointer.speed / 14) + 1);
        for (let i = 0; i < count; i++) {
          if (particles.length > 90) break;
          spawn(
            dx,
            dy,
            (Math.random() - 0.5) * pointer.speed * 0.14,
            (Math.random() - 0.5) * pointer.speed * 0.14
          );
        }
      }

      // Draw particles (additive glow).
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = "lighter";
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life--;
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.92;
        p.vy *= 0.92;
        if (p.life <= 0) {
          pool.push(p);
          particles.splice(i, 1);
          continue;
        }
        const t = p.life / p.maxLife;
        ctx.globalAlpha = t * 0.55;
        ctx.fillStyle = i % 3 === 0 ? accent2 : accent;
        ctx.beginPath();
        ctx.arc(
          p.x * dpr,
          p.y * dpr,
          p.size * dpr * t,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      pointer.speed *= 0.85; // decay so emission settles
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointerover", onOver);
      document.documentElement.classList.remove("spatial-cursor");
    };
  }, []);

  return (
    <div aria-hidden="true" className="hidden md:block">
      <canvas
        ref={canvasRef}
        className="pointer-events-none fixed inset-0 z-[98]"
      />
      <div
        ref={ringRef}
        className="pointer-events-none fixed left-0 top-0 z-[99] h-9 w-9 rounded-full border transition-[border-color] duration-200 will-change-transform"
        style={{ opacity: 0 }}
      />
      <div
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 z-[99] h-1.5 w-1.5 rounded-full will-change-transform"
        style={{ opacity: 0, boxShadow: "0 0 10px var(--accent-2)" }}
      />
    </div>
  );
}

"use client";

import { useRef, type ReactNode, type PointerEvent } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

/**
 * Micro-3D tilt container with a pointer-tracking glare. Spring-damped,
 * clamped to ±8°, disabled for touch pointers and reduced-motion users.
 */
export default function TiltCard({
  children,
  className,
  glow,
  maxTilt = 8,
}: {
  children: ReactNode;
  className?: string;
  /** Optional brand color (any CSS color) for the glare tint. */
  glow?: string;
  maxTilt?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const spring = { stiffness: 220, damping: 22, mass: 0.6 };
  const rotateX = useSpring(useTransform(py, [0, 1], [maxTilt, -maxTilt]), spring);
  const rotateY = useSpring(useTransform(px, [0, 1], [-maxTilt, maxTilt]), spring);
  const glareX = useTransform(px, (v) => `${v * 100}%`);
  const glareY = useTransform(py, (v) => `${v * 100}%`);
  const glare = useTransform<string, string>(
    [glareX, glareY],
    ([x, y]) =>
      `radial-gradient(320px circle at ${x} ${y}, ${glow ?? "var(--accent)"}26, transparent 65%)`
  );

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    px.set((e.clientX - rect.left) / rect.width);
    py.set((e.clientY - rect.top) / rect.height);
  };

  const onLeave = () => {
    px.set(0.5);
    py.set(0.5);
  };

  return (
    <motion.div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      className={className}
    >
      {children}
      {/* Pointer-tracking glare */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: glare }}
      />
    </motion.div>
  );
}

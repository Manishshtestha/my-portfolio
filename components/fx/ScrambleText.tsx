"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

const GLYPHS = "!<>-_\\/[]{}—=+*^?#░▒▓01";

/**
 * Cyber "decode" text effect: characters resolve left → right when the
 * element scrolls into view. Falls back to static text under reduced motion.
 */
export default function ScrambleText({
  text,
  className,
  duration = 1100,
  delay = 0,
}: {
  text: string;
  className?: string;
  duration?: number;
  delay?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const [output, setOutput] = useState(text);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return; // keep static
    if (!inView || started) return;
    setStarted(true);

    let raf = 0;
    let start: number | null = null;
    const chars = GLYPHS;

    const tick = (t: number) => {
      if (start === null) start = t + delay;
      const elapsed = t - start;
      if (elapsed < 0) {
        raf = requestAnimationFrame(tick);
        return;
      }
      const progress = Math.min(elapsed / duration, 1);
      const resolved = Math.floor(progress * text.length);
      let out = text.slice(0, resolved);
      for (let i = resolved; i < text.length; i++) {
        out += text[i] === " " ? " " : chars[(Math.random() * chars.length) | 0];
      }
      setOutput(out);
      if (progress < 1) raf = requestAnimationFrame(tick);
      else setOutput(text);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, started, text, duration, delay]);

  return (
    <span ref={ref} className={className} aria-label={text}>
      <span aria-hidden="true">{output}</span>
    </span>
  );
}

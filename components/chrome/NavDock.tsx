"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { audio } from "@/lib/audio";
import { useUIStore } from "@/store/useUIStore";
import { SoundToggle } from "@/components/chrome/Controls";

const NAV_ITEMS = [
  {
    href: "#deck",
    label: "Deck",
    icon: (
      <>
        <path d="m3 10 9-7 9 7" />
        <path d="M5 9v11h14V9M9 20v-7h6v7" />
      </>
    ),
  },
  {
    href: "#work",
    label: "Work",
    icon: (
      <>
        <rect x="3" y="3" width="8" height="8" rx="2" />
        <rect x="13" y="3" width="8" height="8" rx="2" />
        <rect x="3" y="13" width="8" height="8" rx="2" />
        <rect x="13" y="13" width="8" height="8" rx="2" />
      </>
    ),
  },
  {
    href: "#engine",
    label: "Engine",
    icon: (
      <>
        <circle cx="12" cy="12" r="3.2" />
        <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1" />
      </>
    ),
  },
  {
    href: "#chrono",
    label: "Chrono",
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3.5 2" />
      </>
    ),
  },
  {
    href: "#contact",
    label: "Contact",
    icon: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="3" />
        <path d="m4 7 8 6 8-6" />
      </>
    ),
  },
] as const;

export default function NavDock() {
  const [active, setActive] = useState("#deck");
  const toggleTerminal = useUIStore((s) => s.toggleTerminal);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(`#${entry.target.id}`);
        }
      },
      // A slim horizontal band around the viewport centre decides the
      // "current" section.
      { rootMargin: "-42% 0px -42% 0px", threshold: 0 }
    );
    NAV_ITEMS.forEach(({ href }) => {
      const el = document.getElementById(href.slice(1));
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <nav
      aria-label="Primary"
      className="glass fixed bottom-5 left-1/2 z-[86] flex -translate-x-1/2 items-center gap-1 rounded-2xl px-2.5 py-2"
    >
      {NAV_ITEMS.map(({ href, label, icon }) => {
        const isActive = active === href;
        return (
          <a
            key={href}
            href={href}
            data-magnetic
            aria-current={isActive ? "page" : undefined}
            aria-label={label}
            onMouseEnter={() => audio.hover()}
            onClick={() => audio.click()}
            className={`group relative flex h-11 w-11 items-center justify-center rounded-xl transition-colors ${
              isActive ? "text-black" : "text-muted hover:text-ink"
            }`}
          >
            {isActive && (
              <motion.span
                layoutId="dock-active"
                className="accent-gradient absolute inset-0 rounded-xl"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <span
              className="pointer-events-none absolute bottom-full left-1/2 mb-3 -translate-x-1/2 rounded-md border border-line bg-panel-solid px-2.5 py-1.5 font-mono text-[10px] tracking-widest text-ink opacity-0 transition-opacity duration-150 group-hover:opacity-100"
              aria-hidden="true"
            >
              {label.toUpperCase()}
            </span>
            <svg
              width="19"
              height="19"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="relative"
            >
              {icon}
            </svg>
          </a>
        );
      })}

      <span className="mx-1.5 h-6 w-px bg-line" aria-hidden="true" />

      <button
        type="button"
        data-magnetic
        aria-label="Open terminal (Ctrl+K)"
        onMouseEnter={() => audio.hover()}
        onClick={toggleTerminal}
        className="group relative flex h-11 w-11 items-center justify-center rounded-xl text-muted transition-colors hover:text-accent"
      >
        <span
          className="pointer-events-none absolute bottom-full left-1/2 mb-3 -translate-x-1/2 whitespace-nowrap rounded-md border border-line bg-panel-solid px-2.5 py-1.5 font-mono text-[10px] tracking-widest text-ink opacity-0 transition-opacity duration-150 group-hover:opacity-100"
          aria-hidden="true"
        >
          TERMINAL · ⌘K
        </span>
        <svg
          width="19"
          height="19"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m5 8 4 4-4 4" />
          <path d="M12 17h7" />
        </svg>
      </button>

      <SoundToggle />
    </nav>
  );
}

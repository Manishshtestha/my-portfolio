"use client";

import { motion } from "framer-motion";
import { audio } from "@/lib/audio";
import { SITE } from "@/lib/data";

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-line">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-6 px-6 py-10 sm:px-10">
        <p className="mono-label text-faint">
          © {new Date().getFullYear()} {SITE.name.toUpperCase()} — CRAFTED IN THE VOID
        </p>

        <p className="mono-label text-faint">
          NEXT.JS · R3F · WEB AUDIO{" "}
          <span className="text-accent" aria-hidden="true">
            ▮
          </span>
        </p>

        <motion.a
          href="#deck"
          data-magnetic
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onMouseEnter={() => audio.hover()}
          onClick={() => audio.click()}
          className="mono-label flex items-center gap-2.5 text-muted transition-colors hover:text-accent"
        >
          BACK TO DECK
          <span aria-hidden="true">↑</span>
        </motion.a>
      </div>
    </footer>
  );
}

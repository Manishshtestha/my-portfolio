"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import ScrambleText from "@/components/fx/ScrambleText";

/** Shared section header: mono eyebrow with index, scramble title, reveal. */
export default function SectionHeader({
  index,
  eyebrow,
  title,
  description,
  align = "left",
}: {
  index: string;
  eyebrow: string;
  title: ReactNode;
  description?: string;
  align?: "left" | "center";
}) {
  const centered = align === "center";
  return (
    <div className={centered ? "text-center" : ""}>
      <motion.p
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-12% 0px" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`mono-label flex items-center gap-3 text-muted ${
          centered ? "justify-center" : ""
        }`}
      >
        <span className="inline-block h-px w-8 bg-accent" aria-hidden="true" />
        {index} / {eyebrow}
        {centered && (
          <span className="inline-block h-px w-8 bg-accent" aria-hidden="true" />
        )}
      </motion.p>
      <motion.h2
        initial={{ opacity: 0, y: 26, filter: "blur(6px)" }}
        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        viewport={{ once: true, margin: "-12% 0px" }}
        transition={{ duration: 0.8, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
        className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.04] tracking-[-0.04em] text-ink sm:text-5xl lg:text-6xl"
      >
        <ScrambleText
          text={typeof title === "string" ? title : ""}
          className={typeof title === "string" ? "" : "hidden"}
        />
        {typeof title !== "string" ? title : null}
      </motion.h2>
      {description && (
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-12% 0px" }}
          transition={{ duration: 0.7, delay: 0.18 }}
          className={`mt-5 max-w-xl text-base leading-relaxed text-muted ${
            centered ? "mx-auto" : ""
          }`}
        >
          {description}
        </motion.p>
      )}
    </div>
  );
}

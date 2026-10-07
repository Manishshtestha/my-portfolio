"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useUIStore, type ToastTone } from "@/store/useUIStore";

const TONE_STYLES: Record<ToastTone, { dot: string; label: string }> = {
  info: { dot: "bg-accent-2", label: "text-accent-2" },
  success: { dot: "bg-accent", label: "text-accent" },
  error: { dot: "bg-red-400", label: "text-red-400" },
};

export default function Toaster() {
  const toasts = useUIStore((s) => s.toasts);
  const dismiss = useUIStore((s) => s.dismissToast);

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-24 z-[92] flex flex-col items-center gap-2 px-4"
    >
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.button
            key={toast.id}
            layout
            initial={{ opacity: 0, y: 24, scale: 0.92, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 12, scale: 0.95, filter: "blur(4px)" }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            onClick={() => dismiss(toast.id)}
            className="glass pointer-events-auto flex max-w-sm items-center gap-3 rounded-full px-5 py-2.5 text-left"
          >
            <span
              className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                TONE_STYLES[toast.tone].dot
              }`}
              style={{ boxShadow: "0 0 10px var(--glow)" }}
            />
            <span
              className={`font-mono text-xs tracking-wide ${
                TONE_STYLES[toast.tone].label
              }`}
            >
              {toast.message}
            </span>
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );
}

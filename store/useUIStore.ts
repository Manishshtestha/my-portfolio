"use client";

import { create } from "zustand";
import {
  DIMENSIONS,
  DIMENSION_ORDER,
  type Dimension,
  type Project,
} from "@/lib/data";

export type ToastTone = "info" | "success" | "error";

export interface Toast {
  id: number;
  message: string;
  tone: ToastTone;
}

interface UIState {
  /** Master switch for the Web Audio synth engine. */
  soundEnabled: boolean;
  /** Active dimension — drives CSS palette vars + shader uniforms. */
  dimension: Dimension;
  /** Terminal drawer visibility. */
  terminalOpen: boolean;
  /** Currently open project in the deep-dive modal (null = closed). */
  activeProjectId: string | null;
  toasts: Toast[];

  toggleSound: () => void;
  setSoundEnabled: (on: boolean) => void;
  setDimension: (d: Dimension) => void;
  cycleDimension: () => void;
  setTerminalOpen: (open: boolean) => void;
  toggleTerminal: () => void;
  openProject: (project: Project) => void;
  closeProject: () => void;
  stepProject: (dir: 1 | -1) => void;
  pushToast: (message: string, tone?: ToastTone) => void;
  dismissToast: (id: number) => void;
}

let toastId = 0;

export const useUIStore = create<UIState>((set, get) => ({
  soundEnabled: false,
  dimension: "graphite",
  terminalOpen: false,
  activeProjectId: null,
  toasts: [],

  toggleSound: () => get().setSoundEnabled(!get().soundEnabled),

  setSoundEnabled: (on) => {
    set({ soundEnabled: on });
    void import("@/lib/audio").then(({ audio, SOUND_STORAGE_KEY }) => {
      audio.setEnabled(on);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(SOUND_STORAGE_KEY, on ? "on" : "off");
      }
    });
  },

  setDimension: (d) => {
    set({ dimension: d });
    if (typeof window !== "undefined") {
      window.localStorage.setItem("pf.dimension", d);
    }
  },

  cycleDimension: () => {
    const next =
      DIMENSION_ORDER[
        (DIMENSION_ORDER.indexOf(get().dimension) + 1) % DIMENSION_ORDER.length
      ];
    set({ dimension: next });
    void import("@/lib/audio").then(({ audio }) => audio.dimensionShift());
  },

  setTerminalOpen: (open) => set({ terminalOpen: open }),

  toggleTerminal: () => {
    const open = !get().terminalOpen;
    set({ terminalOpen: open });
    void import("@/lib/audio").then(({ audio }) =>
      open ? audio.rumble() : audio.click()
    );
  },

  openProject: (project) => {
    set({ activeProjectId: project.id });
    void import("@/lib/audio").then(({ audio }) => audio.rumble());
  },

  closeProject: () => {
    set({ activeProjectId: null });
    void import("@/lib/audio").then(({ audio }) => audio.click());
  },

  stepProject: (dir) => {
    void import("@/lib/data").then(({ PROJECTS }) => {
      const current = PROJECTS.findIndex(
        (p) => p.id === get().activeProjectId
      );
      if (current === -1) return;
      const next =
        PROJECTS[(current + dir + PROJECTS.length) % PROJECTS.length];
      set({ activeProjectId: next.id });
      void import("@/lib/audio").then(({ audio }) => audio.swoosh());
    });
  },

  pushToast: (message, tone = "info") => {
    const id = ++toastId;
    set((s) => ({ toasts: [...s.toasts.slice(-3), { id, message, tone }] }));
    void import("@/lib/audio").then(({ audio }) => {
      if (tone === "success") audio.success();
      else if (tone === "error") audio.error();
      else audio.click();
    });
    // Auto-dismiss handled here so producers can't leak timers.
    setTimeout(() => get().dismissToast(id), 3200);
  },

  dismissToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

/** Convenience getter for the current palette (non-reactive contexts). */
export function currentPalette() {
  return DIMENSIONS[useUIStore.getState().dimension];
}

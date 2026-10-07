"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { audio } from "@/lib/audio";
import { useUIStore } from "@/store/useUIStore";
import {
  DIMENSIONS,
  DIMENSION_ORDER,
  PROJECTS,
  SITE,
  SKILLS,
  type Dimension,
} from "@/lib/data";

interface Line {
  id: number;
  kind: "in" | "out" | "sys" | "err" | "ok";
  text: string;
}

let lineId = 0;
const mkLine = (text: string, kind: Line["kind"] = "out"): Line => ({
  id: ++lineId,
  kind,
  text,
});

const COMMANDS = [
  "help",
  "whoami",
  "about",
  "skills",
  "projects",
  "open",
  "goto",
  "theme",
  "sound",
  "contact",
  "socials",
  "date",
  "echo",
  "clear",
  "sudo",
  "coffee",
  "exit",
] as const;

const BOOT_LINES = [
  ["PORTFOLIO.SYS v2.0 — bootstrapped in 42ms", "sys"],
  ["WebGL: shader core online · Audio: synth armed · Radar: sweeping", "sys"],
  ["Type 'help' for the command manifest.", "ok"],
] as const;

const HELP_TEXT = [
  "AVAILABLE COMMANDS",
  "  help              this manifest",
  "  whoami            identify the operator",
  "  about             mission briefing",
  "  skills [filter]   dump the skills matrix",
  "  projects          list transmissions",
  "  open <n|id>       deep-dive a project (1-4)",
  "  goto <section>    deck | work | engine | chrono | contact",
  "  theme <name>      graphite | bone | slate",
  "  sound <on|off>    arm / silence the synth",
  "  contact           direct frequencies",
  "  socials           external links",
  "  date              local ship-time",
  "  echo <text>       repeat after me",
  "  clear             wipe the buffer",
  "  sudo              attempt privilege escalation",
  "  exit              close the terminal",
];

export default function Terminal() {
  const open = useUIStore((s) => s.terminalOpen);
  const setOpen = useUIStore((s) => s.setTerminalOpen);

  const [lines, setLines] = useState<Line[]>([]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [booted, setBooted] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bootedRef = useRef(false);

  const push = useCallback((newLines: Line[]) => {
    setLines((prev) => [...prev, ...newLines]);
  }, []);

  /* ── Global ⌘K / Ctrl+K ─────────────────────────────────────────────── */
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        useUIStore.getState().toggleTerminal();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* ── Boot sequence on first open ────────────────────────────────────── */
  useEffect(() => {
    if (!open || bootedRef.current) return;
    bootedRef.current = true;
    setBooted(true);
    BOOT_LINES.forEach(([text, kind], i) => {
      window.setTimeout(
        () => push([mkLine(text, kind as Line["kind"])]),
        180 * (i + 1)
      );
    });
  }, [open, push]);

  /* ── Focus + autoscroll + Escape ────────────────────────────────────── */
  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => inputRef.current?.focus(), 380);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [lines, open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  /* ── Command engine ─────────────────────────────────────────────────── */
  const execute = useCallback(
    (raw: string) => {
      const cmd = raw.trim();
      if (!cmd) return;
      const [name, ...args] = cmd.split(/\s+/);
      const arg = args.join(" ").toLowerCase();

      const out: Line[] = [mkLine(`❯ ${cmd}`, "in")];

      switch (name.toLowerCase()) {
        case "help":
          HELP_TEXT.forEach((t) => out.push(mkLine(t, t === HELP_TEXT[0] ? "sys" : "out")));
          break;

        case "whoami":
          out.push(
            mkLine(`${SITE.name} — ${SITE.role}`, "ok"),
            mkLine(SITE.location, "out"),
            mkLine("STATUS: shipping & available for select work", "out")
          );
          break;

        case "about":
          out.push(
            mkLine(
              "Engineer obsessed with the space where design, motion and code collide. Builds immersive, high-performance experiences across web and native — and sweats the 4ms.",
              "out"
            )
          );
          break;

        case "skills": {
          const filtered = arg
            ? SKILLS.filter((s) => s.category === arg)
            : SKILLS;
          if (arg && filtered.length === 0) {
            out.push(
              mkLine(
                `no stack for '${arg}' — try: core, web, webgl, mobile, systems, design`,
                "err"
              )
            );
            break;
          }
          out.push(mkLine(`SKILLS MATRIX${arg ? ` — ${arg.toUpperCase()}` : ""}`, "sys"));
          filtered.forEach((s) =>
            out.push(
              mkLine(
                `  ${s.name.padEnd(18, " ")} ${"█".repeat(Math.round(s.level / 8)).padEnd(13, "░")} ${s.level}%`,
                "out"
              )
            )
          );
          break;
        }

        case "projects":
          out.push(mkLine("TRANSMISSION LOG", "sys"));
          PROJECTS.forEach((p, i) =>
            out.push(mkLine(`  [${i + 1}] ${p.title.padEnd(18, " ")} ${p.tagline}`, "out"))
          );
          out.push(mkLine("run 'open <n>' to deep-dive", "ok"));
          break;

        case "open": {
          const idx = parseInt(arg, 10);
          const project = Number.isNaN(idx)
            ? PROJECTS.find((p) => p.id === arg)
            : PROJECTS[idx - 1];
          if (!project) {
            out.push(mkLine("usage: open <1-4> or open <project-id>", "err"));
            break;
          }
          out.push(mkLine(`deep-diving ${project.title}…`, "ok"));
          window.setTimeout(() => {
            useUIStore.getState().openProject(project);
          }, 350);
          break;
        }

        case "goto": {
          const sections = ["deck", "work", "engine", "chrono", "contact"];
          if (!sections.includes(arg)) {
            out.push(mkLine(`usage: goto <${sections.join(" | ")}>`, "err"));
            break;
          }
          out.push(mkLine(`navigating to #${arg}…`, "ok"));
          document
            .getElementById(arg)
            ?.scrollIntoView({ behavior: "smooth", block: "start" });
          break;
        }

        case "theme": {
          if (!DIMENSION_ORDER.includes(arg as Dimension)) {
            out.push(
              mkLine(
                `current: ${useUIStore.getState().dimension} — usage: theme <${DIMENSION_ORDER.join(" | ")}>`,
                "err"
              )
            );
            break;
          }
          useUIStore.getState().setDimension(arg as Dimension);
          audio.dimensionShift();
          out.push(mkLine(`dimension shifted → ${DIMENSIONS[arg as Dimension].label}`, "ok"));
          break;
        }

        case "sound": {
          if (arg !== "on" && arg !== "off") {
            out.push(mkLine("usage: sound <on|off>", "err"));
            break;
          }
          useUIStore.getState().setSoundEnabled(arg === "on");
          out.push(mkLine(`synth ${arg === "on" ? "armed 🔊" : "silenced 🔇"}`, "ok"));
          break;
        }

        case "contact":
        case "socials":
          out.push(mkLine(`EMAIL: ${SITE.email}`, "ok"));
          SITE.socials.forEach((s) =>
            out.push(mkLine(`${s.label.padEnd(10, " ")} ${s.url}`, "out"))
          );
          out.push(mkLine(`CAL: ${SITE.calendarUrl}`, "out"));
          break;

        case "date":
          out.push(mkLine(new Date().toString(), "out"));
          break;

        case "echo":
          out.push(mkLine(args.join(" "), "out"));
          break;

        case "clear":
          setLines([]);
          return;

        case "sudo":
          out.push(
            mkLine("nice try. this terminal is read-only for visitors.", "err"),
            mkLine("…but I like your ambition. try 'coffee' instead.", "sys")
          );
          break;

        case "coffee":
          out.push(mkLine("        ((", "ok"), mkLine("       { }", "ok"));
          out.push(mkLine("     ┌─┴─┐", "ok"), mkLine("     │ ☕ │ brewing…", "ok"));
          out.push(mkLine("     └───┘ fuel at 100%. back to work.", "sys"));
          break;

        case "exit":
          out.push(mkLine("closing channel…", "sys"));
          window.setTimeout(() => setOpen(false), 300);
          break;

        default:
          out.push(
            mkLine(`command not found: ${name}`, "err"),
            mkLine("type 'help' for the manifest", "sys")
          );
      }

      push(out);
    },
    [push, setOpen]
  );

  /* ── Input handling ─────────────────────────────────────────────────── */
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setHistory((h) => [...h, input]);
    setHistoryIdx(-1);
    execute(input);
    setInput("");
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    audio.key();

    if (e.key === "Enter") {
      // Explicit submit — don't rely on implicit form submission.
      e.preventDefault();
      if (!input.trim()) return;
      setHistory((h) => [...h, input]);
      setHistoryIdx(-1);
      execute(input);
      setInput("");
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length === 0) return;
      const next = historyIdx === -1 ? history.length - 1 : Math.max(0, historyIdx - 1);
      setHistoryIdx(next);
      setInput(history[next]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIdx === -1) return;
      const next = historyIdx + 1;
      if (next >= history.length) {
        setHistoryIdx(-1);
        setInput("");
      } else {
        setHistoryIdx(next);
        setInput(history[next]);
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      const matches = COMMANDS.filter((c) => c.startsWith(input.toLowerCase()));
      if (matches.length === 1) {
        setInput(matches[0] + " ");
      } else if (matches.length > 1) {
        push([mkLine(`❯ ${input}`, "in"), mkLine(matches.join("  "), "sys")]);
      }
    }
  };

  const lineClass: Record<Line["kind"], string> = {
    in: "text-ink",
    out: "text-muted",
    sys: "text-accent-2",
    err: "text-red-400",
    ok: "text-accent",
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.button
            type="button"
            aria-label="Close terminal"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[84] bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Interactive terminal"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 34 }}
            className="glass fixed inset-x-0 bottom-0 z-[85] mx-auto flex max-h-[68vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-2xl border-b-0 sm:bottom-6 sm:max-h-[62vh] sm:rounded-2xl sm:border-b"
          >
            <div className="crt-scanlines" aria-hidden="true" />

            {/* Title bar */}
            <div className="flex items-center justify-between border-b border-line px-5 py-3">
              <div className="flex items-center gap-3">
                <span className="flex gap-1.5" aria-hidden="true">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
                </span>
                <p className="font-mono text-[11px] tracking-widest text-muted">
                  manish@portfolio — zsh
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close terminal"
                onMouseEnter={() => audio.hover()}
                className="flex h-7 w-7 items-center justify-center rounded-md text-muted transition-colors hover:bg-white/8 hover:text-red-400"
              >
                ✕
              </button>
            </div>

            {/* Scrollback */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-5 py-4 font-mono text-[12.5px] leading-relaxed"
              aria-live="polite"
              aria-label="Terminal output"
            >
              {lines.map((line) => (
                <motion.p
                  key={line.id}
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.18 }}
                  className={`whitespace-pre-wrap break-words ${lineClass[line.kind]}`}
                >
                  {line.text}
                </motion.p>
              ))}
              {!booted && (
                <p className="text-faint">initialising…</p>
              )}
            </div>

            {/* Prompt */}
            <form onSubmit={onSubmit} className="border-t border-line px-5 py-3.5">
              <div className="flex items-center gap-2.5 font-mono text-[12.5px]">
                <span className="text-accent" aria-hidden="true">
                  ➜
                </span>
                <span className="text-accent-2">~</span>
                <span className="text-muted" aria-hidden="true">
                  ❯
                </span>
                <label htmlFor="term-input" className="sr-only">
                  Terminal command input
                </label>
                <input
                  id="term-input"
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKeyDown}
                  autoComplete="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  className="w-full bg-transparent text-ink caret-[var(--accent)] outline-none"
                  placeholder="type 'help'…"
                />
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

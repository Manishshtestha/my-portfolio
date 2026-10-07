"use client";

import { useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import SectionHeader from "@/components/fx/SectionHeader";
import { audio } from "@/lib/audio";
import { useReducedMotion } from "@/lib/pointer";
import { useUIStore } from "@/store/useUIStore";
import { SITE } from "@/lib/data";

type Status = "idle" | "sending" | "sent";

interface FieldErrors {
  name?: string;
  email?: string;
  message?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Decorative holographic portal ring. */
function Portal() {
  const reduced = useReducedMotion();
  return (
    <div className="relative mx-auto h-40 w-40" aria-hidden="true">
      <div
        className="absolute inset-0 rounded-full border border-line"
        style={{ boxShadow: "inset 0 0 40px var(--accent-soft)" }}
      />
      <div
        className="absolute inset-5 rounded-full border"
        style={{ borderColor: `${"var(--accent)"}33` }}
      />
      <div
        className="absolute inset-10 rounded-full"
        style={{
          background:
            "radial-gradient(circle at 38% 32%, var(--accent-2), var(--accent) 55%, transparent 78%)",
          opacity: 0.5,
          filter: "blur(6px)",
        }}
      />
      {!reduced && (
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0deg, var(--accent-soft) 70deg, transparent 140deg)",
            animation: "radar-spin 5.5s linear infinite",
          }}
        />
      )}
      <div
        className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-2"
        style={{ boxShadow: "0 0 18px var(--glow)" }}
      />
    </div>
  );
}

function Field({
  id,
  label,
  type = "text",
  value,
  error,
  textarea,
  onChange,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  error?: string;
  textarea?: boolean;
  onChange: (v: string) => void;
}) {
  const [focused, setFocused] = useState(false);
  const filled = value.trim().length > 0;
  const shared =
    "field peer w-full bg-transparent pb-3 pt-6 text-sm text-ink outline-none placeholder:text-transparent";

  return (
    <div>
      <div className={`relative ${focused || filled ? "filled" : ""}`}>
        <label
          htmlFor={id}
          className={`pointer-events-none absolute left-0 font-mono uppercase tracking-[0.18em] transition-all duration-300 ${
            focused || filled
              ? "top-0 text-[9px] text-accent"
              : "top-6 text-[11px] text-faint"
          }`}
        >
          {label}
        </label>
        {textarea ? (
          <textarea
            id={id}
            rows={4}
            value={value}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onChange={(e) => onChange(e.target.value)}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : undefined}
            className={`${shared} resize-none`}
          />
        ) : (
          <input
            id={id}
            type={type}
            value={value}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onChange={(e) => onChange(e.target.value)}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : undefined}
            className={shared}
          />
        )}
        <span className="field-line" aria-hidden="true" />
      </div>
      {error && (
        <p id={`${id}-error`} className="mt-2 font-mono text-[10px] tracking-wider text-red-400">
          ⚠ {error}
        </p>
      )}
    </div>
  );
}

export default function Contact() {
  const pushToast = useUIStore((s) => s.pushToast);
  const [status, setStatus] = useState<Status>("idle");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(SITE.email);
      pushToast(`${SITE.email} copied to clipboard`, "success");
    } catch {
      pushToast("Clipboard blocked — email shown on screen", "error");
    }
  };

  const validate = (): boolean => {
    const next: FieldErrors = {};
    if (name.trim().length < 2) next.name = "Callsign needs at least 2 characters";
    if (!EMAIL_RE.test(email)) next.email = "That frequency doesn't parse — check the email";
    if (message.trim().length < 10) next.message = "Give the message at least 10 characters";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (status !== "idle") return;
    if (!validate()) {
      audio.error();
      pushToast("Transmission blocked — fix the fields marked ⚠", "error");
      return;
    }
    setStatus("sending");
    audio.swoosh();

    window.setTimeout(() => {
      const subject = encodeURIComponent(`Portfolio transmission from ${name}`);
      const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
      window.location.href = `mailto:${SITE.email}?subject=${subject}&body=${body}`;
      setStatus("sent");
      pushToast("Signal launched — opening your mail client", "success");
      setName("");
      setEmail("");
      setMessage("");
      setErrors({});
      window.setTimeout(() => setStatus("idle"), 3200);
    }, 900);
  };

  return (
    <section id="contact" className="relative z-10 py-28 sm:py-36">
      <div className="mx-auto grid w-full max-w-6xl gap-16 px-6 sm:px-10 lg:grid-cols-[1fr_1.15fr]">
        {/* ── Portal side ─────────────────────────────────────────────── */}
        <div className="flex flex-col items-start justify-center">
          <SectionHeader
            index="04"
            eyebrow="Open channel"
            title={<>Initiate <span className="accent-gradient bg-clip-text text-transparent">contact.</span></>}
            description="One signal is all it takes. Lay out the mission and I'll respond within 48 hours — usually much faster."
          />
          <div className="mt-12 w-full">
            <Portal />
          </div>

          {/* Quick actions */}
          <div className="mt-12 flex flex-wrap items-center gap-3">
            <motion.button
              type="button"
              data-magnetic
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onMouseEnter={() => audio.hover()}
              onClick={copyEmail}
              className="glass inline-flex items-center gap-2.5 rounded-full px-5 py-3 font-mono text-[11px] tracking-[0.14em] text-ink transition-colors hover:text-accent"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="9" y="9" width="12" height="12" rx="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              COPY EMAIL
            </motion.button>
            <motion.a
              href={SITE.calendarUrl}
              target="_blank"
              rel="noreferrer noopener"
              data-magnetic
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onMouseEnter={() => audio.hover()}
              onClick={() => audio.click()}
              className="glass inline-flex items-center gap-2.5 rounded-full px-5 py-3 font-mono text-[11px] tracking-[0.14em] text-ink transition-colors hover:text-accent"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="4" width="18" height="18" rx="3" />
                <path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
              SCHEDULE A CALL
            </motion.a>
          </div>

          {/* Socials */}
          <ul className="mt-10 flex flex-wrap gap-x-8 gap-y-3">
            {SITE.socials.map((s) => (
              <li key={s.label}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  data-magnetic
                  onMouseEnter={() => audio.hover()}
                  onClick={() => audio.click()}
                  className="group flex items-baseline gap-2 text-sm text-muted transition-colors hover:text-accent"
                >
                  <span className="font-medium text-ink transition-colors group-hover:text-accent">
                    {s.label}
                  </span>
                  <span className="font-mono text-[11px] text-faint">{s.handle}</span>
                  <span aria-hidden="true" className="text-xs transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
                    ↗
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* ── Form side ───────────────────────────────────────────────── */}
        <motion.form
          onSubmit={onSubmit}
          noValidate
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="glass relative overflow-hidden rounded-3xl p-8 sm:p-10"
        >
          <p className="mono-label flex items-center justify-between text-faint">
            <span>TRANSMISSION FORM</span>
            <span className="flex items-center gap-2">
              <span className="status-dot" aria-hidden="true" />
              CHANNEL OPEN
            </span>
          </p>

          <div className="mt-8 space-y-7">
            <div className="grid gap-7 sm:grid-cols-2">
              <Field id="ct-name" label="Callsign / Name" value={name} error={errors.name} onChange={setName} />
              <Field id="ct-email" label="Frequency / Email" type="email" value={email} error={errors.email} onChange={setEmail} />
            </div>
            <Field id="ct-message" label="Mission brief" textarea value={message} error={errors.message} onChange={setMessage} />
          </div>

          <motion.button
            type="submit"
            data-magnetic
            whileHover={{ scale: status === "idle" ? 1.02 : 1 }}
            whileTap={{ scale: status === "idle" ? 0.97 : 1 }}
            onMouseEnter={() => audio.hover()}
            disabled={status !== "idle"}
            className={`mt-10 flex w-full items-center justify-center gap-3 rounded-full py-4 font-mono text-xs font-semibold tracking-[0.2em] transition-colors ${
              status === "idle"
                ? "accent-gradient text-black"
                : status === "sent"
                  ? "border border-accent text-accent"
                  : "border border-line text-muted"
            }`}
          >
            <AnimatePresence mode="wait" initial={false}>
              {status === "idle" && (
                <motion.span
                  key="idle"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="flex items-center gap-3"
                >
                  LAUNCH TRANSMISSION <span aria-hidden="true">⟶</span>
                </motion.span>
              )}
              {status === "sending" && (
                <motion.span
                  key="sending"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="flex items-center gap-3"
                >
                  <motion.span
                    className="inline-block h-3 w-3 rounded-full border-2 border-current border-t-transparent"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                  />
                  ROUTING THROUGH THE VOID…
                </motion.span>
              )}
              {status === "sent" && (
                <motion.span
                  key="sent"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                >
                  SIGNAL SENT ✓
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>

          <p className="mt-4 text-center font-mono text-[10px] tracking-wider text-faint">
            {"// SUBMISSION OPENS YOUR MAIL CLIENT PRE-FILLED — NO DATA IS STORED"}
          </p>
        </motion.form>
      </div>
    </section>
  );
}

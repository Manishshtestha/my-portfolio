"use client";

/**
 * Zero-asset Web Audio synth engine.
 * Every sound is synthesised on the fly — no audio files, no network cost.
 * The context is created lazily on the first user gesture and every playhead
 * respects the global `soundEnabled` flag in the UI store.
 */

type Wave = OscillatorType;

export const SOUND_STORAGE_KEY = "pf.sound";

class AudioEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private enabled = false;

  /** True when the engine will actually emit sound. */
  get isEnabled() {
    return this.enabled;
  }

  /**
   * Create the context and resume it. Safe to call repeatedly; should be
   * invoked from inside a user gesture so browsers allow playback.
   */
  unlock() {
    if (typeof window === "undefined" || !this.enabled) return;
    if (!this.ctx) {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!Ctor) return;
      this.ctx = new Ctor();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.5;
      this.master.connect(this.ctx.destination);
      this.noiseBuffer = this.createNoiseBuffer();
    }
    void this.ctx.resume();
  }

  /** Sync the engine's arm state with the UI store (the source of truth). */
  setEnabled(on: boolean) {
    this.enabled = on;
    if (on) this.unlock();
  }

  /* ── Primitives ──────────────────────────────────────────────────────── */

  private tone(
    wave: Wave,
    from: number,
    to: number,
    duration: number,
    peak: number,
    delay = 0,
    filterHz?: number
  ) {
    if (!this.ctx || !this.master || !this.enabled) return;
    const t0 = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = wave;
    osc.frequency.setValueAtTime(from, t0);
    osc.frequency.exponentialRampToValueAtTime(Math.max(to, 1), t0 + duration);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(peak, t0 + duration * 0.18);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    let head: AudioNode = gain;
    if (filterHz) {
      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = filterHz;
      gain.connect(filter);
      head = filter;
    }
    osc.connect(gain);
    head.connect(this.master);
    osc.start(t0);
    osc.stop(t0 + duration + 0.05);
  }

  private noise(
    fromHz: number,
    toHz: number,
    duration: number,
    peak: number,
    q = 1.2
  ) {
    if (!this.ctx || !this.master || !this.noiseBuffer || !this.enabled) return;
    const t0 = this.ctx.currentTime;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.Q.value = q;
    filter.frequency.setValueAtTime(fromHz, t0);
    filter.frequency.exponentialRampToValueAtTime(toHz, t0 + duration);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(peak, t0 + duration * 0.3);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    src.connect(filter).connect(gain).connect(this.master);
    src.start(t0);
    src.stop(t0 + duration + 0.05);
  }

  private createNoiseBuffer(): AudioBuffer {
    const seconds = 1;
    const buffer = this.ctx!.createBuffer(
      1,
      this.ctx!.sampleRate * seconds,
      this.ctx!.sampleRate
    );
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    return buffer;
  }

  /* ── Public cues ─────────────────────────────────────────────────────── */

  /** Soft resonant chime for hovers. Deliberately near-silent. */
  hover() {
    this.tone("sine", 1240, 1860, 0.09, 0.012);
  }

  /** Low-pitch tactile click for presses & toggles. */
  click() {
    this.tone("triangle", 220, 90, 0.07, 0.05, 0, 900);
  }

  /** Airy sweep for card opens / dimension shifts. */
  swoosh() {
    this.noise(420, 2600, 0.32, 0.035);
  }

  /** Deep spatial rumble for modal / drawer transitions. */
  rumble() {
    this.tone("sine", 130, 42, 0.5, 0.09);
    this.noise(120, 60, 0.4, 0.02, 0.8);
  }

  /** Rising two-note confirm for toasts / form success. */
  success() {
    this.tone("sine", 660, 660, 0.12, 0.04);
    this.tone("sine", 990, 990, 0.16, 0.04, 0.09);
  }

  /** Descending buzz for validation errors. */
  error() {
    this.tone("sawtooth", 170, 110, 0.18, 0.035, 0, 700);
  }

  /** Special cue when the dimension (theme) shifts. */
  dimensionShift() {
    this.swoosh();
    this.tone("sine", 330, 880, 0.35, 0.025, 0.05);
  }

  /** Keyboard tick for the terminal. */
  key() {
    this.tone("square", 1400 + Math.random() * 400, 1200, 0.015, 0.006, 0, 2400);
  }
}

export const audio = new AudioEngine();

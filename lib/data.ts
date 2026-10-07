/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  SITE CONFIG — single source of truth for every piece of portfolio content.
 *  Edit this file to make the portfolio yours; no component changes needed.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const SITE = {
  name: "Manish Shrestha",
  firstName: "Manish",
  lastName: "SHRESTHA",
  role: "Creative Technologist",
  tagline:
    "Engineering immersive, high-performance experiences across the web and native.",
  location: "Kathmandu, NP · Remote worldwide",
  // ⚠ Replace with your real email — used by the copy button, CTAs and the
  // contact form's mailto handoff.
  email: "hello@example.com",
  // ⚠ Point this at your real scheduling link (Cal.com, Calendly, SavvyCal…).
  calendarUrl: "https://cal.com/",
  availability: "Available for select projects & roles",
  socials: [
    { label: "GitHub", handle: "@manishshrestha", url: "https://github.com/manishshrestha" },
    { label: "LinkedIn", handle: "in/manishshrestha", url: "https://www.linkedin.com/in/manishshrestha" },
    { label: "X", handle: "@manishbuilds", url: "https://x.com/manishbuilds" },
  ],
} as const;

/* ── Projects ─────────────────────────────────────────────────────────────── */

export type ProjectCategory = "web" | "mobile" | "webgl" | "systems";

export interface ProjectLink {
  label: string;
  url: string;
  kind: "live" | "repo";
}

export interface Project {
  id: string;
  index: string;
  title: string;
  tagline: string;
  description: string;
  category: ProjectCategory;
  accent: string; // brand glow color (hex)
  year: string;
  role: string;
  stack: string[];
  highlights: string[];
  metrics: { label: string; value: string }[];
  links: ProjectLink[];
}

export const PROJECTS: Project[] = [
  {
    id: "orbital",
    index: "01",
    title: "Orbital",
    tagline: "Real-time WebGL product configurator",
    description:
      "A fully interactive 3D configurator that lets customers customise materials, finishes and environments for a furniture line — rendered entirely in the browser with custom GLSL shaders and physically-based lighting. Streams optimised glTF assets progressively and holds 60fps on mid-tier mobile hardware.",
    category: "webgl",
    accent: "#e8e8e6",
    year: "2026",
    role: "Lead Interactive Engineer",
    stack: ["React Three Fiber", "Three.js", "GLSL", "TypeScript", "Draco", "Zustand"],
    highlights: [
      "Custom vertex-displacement shader for real-time fabric & metal material blends",
      "Progressive glTF + Draco pipeline cut initial payload by 72%",
      "Deterministic render state encoded in shareable URLs",
      "Adaptive DPR + offscreen render suspension keeps battery drain minimal",
    ],
    metrics: [
      { label: "Frame rate", value: "60fps" },
      { label: "Payload cut", value: "72%" },
      { label: "Conversion lift", value: "+31%" },
    ],
    links: [
      { label: "Live configurator", url: "https://github.com/manishshrestha", kind: "live" },
      { label: "Source code", url: "https://github.com/manishshrestha", kind: "repo" },
    ],
  },
  {
    id: "aurora-commerce",
    index: "02",
    title: "Aurora Commerce",
    tagline: "Edge-rendered headless storefront",
    description:
      "A headless commerce storefront built on Next.js with edge rendering, streaming product pages and a design system tuned for sub-second perceived loads. Cart, checkout and inventory sync run through a typed GraphQL layer with optimistic UI throughout.",
    category: "web",
    accent: "#b9bec6",
    year: "2025",
    role: "Full-stack Engineer",
    stack: ["Next.js", "TypeScript", "GraphQL", "Tailwind CSS", "Stripe", "Vercel Edge"],
    highlights: [
      "Streaming SSR + partial prerendering for instant product-page paints",
      "Optimistic cart mutations with rollback-safe error recovery",
      "Zero-CLS image pipeline with responsive art direction",
      "Lighthouse 98+ across every core template",
    ],
    metrics: [
      { label: "LCP", value: "0.9s" },
      { label: "Lighthouse", value: "98" },
      { label: "SKU count", value: "4.2k" },
    ],
    links: [
      { label: "Visit storefront", url: "https://github.com/manishshrestha", kind: "live" },
      { label: "Source code", url: "https://github.com/manishshrestha", kind: "repo" },
    ],
  },
  {
    id: "pulsefit",
    index: "03",
    title: "PulseFit",
    tagline: "Offline-first native workout companion",
    description:
      "A React Native training companion with offline-first workout logging, watch companionship and adaptive rest timers. Local writes land in a SQLite queue that reconciles with a sync engine the moment connectivity returns — no lost sets, ever.",
    category: "mobile",
    accent: "#c7c0b2",
    year: "2025",
    role: "Mobile Engineer",
    stack: ["React Native", "TypeScript", "SQLite", "Reanimated", "Node.js", "PostgreSQL"],
    highlights: [
      "CRDT-style sync queue resolves conflicts without user input",
      "60fps gesture-driven rest timer built on Reanimated worklets",
      "Haptic micro-feedback system tuned per interaction type",
      "Background audio session integration for gym environments",
    ],
    metrics: [
      { label: "Store rating", value: "4.8★" },
      { label: "Sync conflicts lost", value: "0" },
      { label: "Cold start", value: "1.1s" },
    ],
    links: [
      { label: "App Store listing", url: "https://github.com/manishshrestha", kind: "live" },
      { label: "Source code", url: "https://github.com/manishshrestha", kind: "repo" },
    ],
  },
  {
    id: "nebula-ops",
    index: "04",
    title: "Nebula Ops",
    tagline: "Realtime infrastructure observability",
    description:
      "An operations dashboard streaming thousands of telemetry events per second over WebSockets into a virtualised, canvas-accelerated charting layer. Alert rules compile to a small DSL evaluated at the edge, paging the right on-call engineer in under a second.",
    category: "systems",
    accent: "#a4a9a3",
    year: "2024",
    role: "Systems Engineer",
    stack: ["Node.js", "WebSockets", "Canvas 2D", "Redis", "Docker", "Grafana"],
    highlights: [
      "Custom virtualised canvas charts render 50k points without dropping frames",
      "Backpressure-aware WebSocket fan-out over Redis pub/sub",
      "Alert DSL compiles to sandboxed edge evaluators (sub-50ms p99)",
      "Full OpenTelemetry traces across the ingest pipeline",
    ],
    metrics: [
      { label: "Events / sec", value: "12k" },
      { label: "p99 alert lag", value: "<1s" },
      { label: "Uptime", value: "99.98%" },
    ],
    links: [
      { label: "Product tour", url: "https://github.com/manishshrestha", kind: "live" },
      { label: "Source code", url: "https://github.com/manishshrestha", kind: "repo" },
    ],
  },
];

export const PROJECT_FILTERS = [
  { id: "all", label: "All systems" },
  { id: "web", label: "Web" },
  { id: "webgl", label: "WebGL" },
  { id: "mobile", label: "Native" },
  { id: "systems", label: "Systems" },
] as const;

/* ── Skills ───────────────────────────────────────────────────────────────── */

export type SkillCategory = "core" | "web" | "mobile" | "webgl" | "systems" | "design";

export interface Skill {
  name: string;
  category: SkillCategory;
  level: number; // 0–100 proficiency
  orbit: 1 | 2 | 3; // 1 = innermost ring
  blurb: string;
}

export const SKILL_CATEGORIES = [
  { id: "all", label: "All" },
  { id: "core", label: "Core" },
  { id: "web", label: "Web" },
  { id: "webgl", label: "WebGL" },
  { id: "mobile", label: "Mobile" },
  { id: "systems", label: "Systems" },
  { id: "design", label: "Design" },
] as const;

export const SKILLS: Skill[] = [
  { name: "TypeScript", category: "core", level: 95, orbit: 1, blurb: "The lingua franca of everything I ship — strict mode, generics, the works." },
  { name: "React", category: "core", level: 95, orbit: 1, blurb: "Server components, suspense boundaries, concurrent features — React is home." },
  { name: "Next.js", category: "web", level: 92, orbit: 1, blurb: "App Router, streaming SSR, edge runtime. My default web chassis." },
  { name: "Three.js / R3F", category: "webgl", level: 88, orbit: 1, blurb: "Declarative 3D scenes, custom shaders, and the performance work to keep them at 60fps." },
  { name: "GLSL", category: "webgl", level: 80, orbit: 2, blurb: "Vertex displacement, fragment glow, particle systems — shader-first visuals." },
  { name: "React Native", category: "mobile", level: 84, orbit: 1, blurb: "Offline-first apps, gesture worklets, and native module bridges." },
  { name: "Framer Motion", category: "design", level: 90, orbit: 2, blurb: "Layout animations and springs that make interfaces feel alive." },
  { name: "Tailwind CSS", category: "web", level: 93, orbit: 2, blurb: "Design systems in utility form — tokens, themes and zero specificity wars." },
  { name: "Node.js", category: "systems", level: 86, orbit: 2, blurb: "APIs, streaming pipelines, realtime fan-out — the server side of the house." },
  { name: "PostgreSQL", category: "systems", level: 78, orbit: 2, blurb: "Schema design, window functions, and the occasional cursed CTE." },
  { name: "GSAP", category: "webgl", level: 82, orbit: 3, blurb: "Scroll choreography and timeline orchestration for complex narratives." },
  { name: "Web Audio API", category: "webgl", level: 70, orbit: 3, blurb: "Synthesised UI soundscapes with zero audio assets." },
  { name: "System Design", category: "systems", level: 80, orbit: 3, blurb: "Event-driven architecture, caching strategy, failure-first thinking." },
  { name: "Figma", category: "design", level: 76, orbit: 3, blurb: "Design-to-code with the respect the designer deserves." },
  { name: "Docker / CI", category: "systems", level: 74, orbit: 3, blurb: "Reproducible builds and pipelines that fail loudly, early." },
];

/* ── Timeline ─────────────────────────────────────────────────────────────── */

export interface Milestone {
  year: string;
  title: string;
  org: string;
  description: string;
  tag: string;
}

export const MILESTONES: Milestone[] = [
  {
    year: "2021",
    title: "First line of consequence",
    org: "Self-taught → CS fundamentals",
    description:
      "Wrote the first programs that other people actually used. Fell for the moment code leaves the editor and becomes something someone touches.",
    tag: "origin",
  },
  {
    year: "2022",
    title: "Freelance circuits",
    org: "Independent",
    description:
      "Shipped sites and tools for small businesses — learned that deadlines, communication and details like 404 pages matter as much as the code.",
    tag: "growth",
  },
  {
    year: "2023",
    title: "First native ship",
    org: "PulseFit · App Store",
    description:
      "Took a mobile product from prototype to the App Store. Offline sync, haptics, and the humbling education of real users on real devices.",
    tag: "launch",
  },
  {
    year: "2024",
    title: "Systems depth",
    org: "Nebula Ops",
    description:
      "Built realtime infrastructure tooling — WebSockets at scale, observability, and the discipline of designing for failure before success.",
    tag: "depth",
  },
  {
    year: "2025",
    title: "The WebGL gravity well",
    org: "Aurora Commerce · Orbital",
    description:
      "Went all-in on the expressive web: custom shaders, R3F scenes, scroll choreography. Discovered that performance budgets and beauty are the same discipline.",
    tag: "signature",
  },
  {
    year: "2026",
    title: "Now — open channel",
    org: "Available for select work",
    description:
      "Collaborating with teams who care about craft. If you're building something that should feel impossible until someone uses it — we should talk.",
    tag: "present",
  },
];

/* ── Dimension themes (drive CSS vars + shader palettes) ──────────────────── */

export type Dimension = "graphite" | "bone" | "slate";

export interface DimensionPalette {
  label: string;
  accent: string; // primary
  accent2: string; // secondary
  colorA: string; // particle base
  colorB: string; // particle tip
  colorC: string; // core fresnel
}

export const DIMENSIONS: Record<Dimension, DimensionPalette> = {
  graphite: {
    label: "Graphite",
    accent: "#ececea",
    accent2: "#9c9ca3",
    colorA: "#2e2e33",
    colorB: "#cfcfd2",
    colorC: "#ececea",
  },
  bone: {
    label: "Bone",
    accent: "#e6e1d5",
    accent2: "#b3a892",
    colorA: "#35302a",
    colorB: "#d9d2c2",
    colorC: "#e6e1d5",
  },
  slate: {
    label: "Slate",
    accent: "#dfe5ec",
    accent2: "#8fa0b3",
    colorA: "#2b323b",
    colorB: "#c3cedd",
    colorC: "#dfe5ec",
  },
};

export const DIMENSION_ORDER: Dimension[] = ["graphite", "bone", "slate"];

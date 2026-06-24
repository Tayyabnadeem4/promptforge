"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import SiteNav from "@/components/site/SiteNav";
import SiteFooter from "@/components/site/SiteFooter";
import ScrollProgress from "@/components/site/ScrollProgress";
import ScrollThread from "@/components/site/ScrollThread";
import InteractiveNeural from "@/components/site/InteractiveNeural";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

export default function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <ScrollProgress />
      <ScrollThread />
      <Blobs />
      <SiteNav />
      <Hero />
      <TrustBar />
      <Features />
      <HowItWorks />
      <Providers />
      <CTA />
      <SiteFooter />
    </div>
  );
}

/* ---------------------------------------------------------------- Hero */
function Hero() {
  return (
    <section className="relative pb-16 pt-16 sm:pt-24">
      {/* interactive neural canvas behind the hero — reacts to the cursor */}
      <div className="absolute inset-0 -z-10">
        <InteractiveNeural />
      </div>

      <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-12 px-5 lg:grid-cols-[1.05fr_0.95fr]">
        <motion.div initial="hidden" animate="show" variants={stagger}>
          <motion.div
            variants={fadeUp}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-forge-green" />
            Now multi-provider — Claude + free Groq models
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-6xl"
          >
            Engineer prompts like
            <br />
            <span className="gradient-text">a pro, in real time.</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mt-5 max-w-xl text-lg text-slate-400"
          >
            PromptForge is the AI prompt IDE. Describe a goal and get a
            structured, production-ready prompt — then test and compare it across
            models side by side, with live tokens and cost.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/login?mode=signup"
              className="rounded-xl bg-gradient-to-r from-brand to-forge-cyan px-6 py-3 font-semibold text-white shadow-glow transition hover:brightness-110"
            >
              Start free — 20 credits
            </Link>
            <Link
              href="/playground"
              className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 font-semibold text-slate-200 transition hover:bg-white/10"
            >
              Open the playground →
            </Link>
          </motion.div>

          <motion.p variants={fadeUp} className="mt-4 text-xs text-slate-500">
            No credit card. Test free with open models.
          </motion.p>
        </motion.div>

        <HeroPreview />
      </div>
    </section>
  );
}

/* A stylized, animated mock of the app — not functional, just delightful. */
function HeroPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, rotate: 2 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
      className="relative"
    >
      <div className="rounded-2xl glass-strong p-4 shadow-glow">
        <div className="mb-3 flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-forge-pink/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-forge-amber/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-forge-green/70" />
          <span className="ml-2 text-xs text-slate-500">promptforge / playground</span>
        </div>

        <div className="rounded-lg border border-white/5 bg-ink-900/60 p-3 font-mono text-xs text-slate-300">
          <span className="text-slate-500"># Role</span>
          <br />
          You are a senior copywriter…
          <br />
          <span className="text-slate-500"># Task</span> Write a{" "}
          <span className="rounded bg-brand/25 px-1 text-brand-glow">{`{{tone}}`}</span>{" "}
          description for{" "}
          <span className="rounded bg-brand/25 px-1 text-brand-glow">{`{{product}}`}</span>
          .
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <OutputCard label="Opus 4.8" accent="#7c5cff" delay={0.4} />
          <OutputCard label="Llama 3.3" accent="#f97316" delay={0.7} />
        </div>
      </div>

      {/* floating chips */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute -left-5 top-1/3 hidden rounded-xl glass px-3 py-2 text-xs text-slate-200 shadow-glow-sm sm:block"
      >
        ⚡ 1,240 tok · $0.004
      </motion.div>
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 5, repeat: Infinity }}
        className="absolute -right-4 bottom-8 hidden rounded-xl glass px-3 py-2 text-xs text-slate-200 shadow-glow-sm sm:block"
      >
        ✨ Prompt engineered
      </motion.div>
    </motion.div>
  );
}

function OutputCard({
  label,
  accent,
  delay,
}: {
  label: string;
  accent: string;
  delay: number;
}) {
  return (
    <div className="rounded-lg border border-white/5 bg-ink-900/60 p-3">
      <div className="mb-2 flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: accent }} />
        <span className="text-xs font-medium text-slate-200">{label}</span>
      </div>
      <div className="space-y-1.5">
        {[0.9, 0.7, 0.55].map((w, i) => (
          <motion.div
            key={i}
            initial={{ width: 0 }}
            animate={{ width: `${w * 100}%` }}
            transition={{
              duration: 1.1,
              delay: delay + i * 0.25,
              repeat: Infinity,
              repeatType: "reverse",
              repeatDelay: 1.5,
            }}
            className="h-1.5 rounded-full"
            style={{ backgroundColor: `${accent}66` }}
          />
        ))}
      </div>
    </div>
  );
}

/* ----------------------------------------------------------- Trust bar */
function TrustBar() {
  const stats = [
    { value: "7", label: "models" },
    { value: "2", label: "providers" },
    { value: "<1s", label: "to first token" },
    { value: "100%", label: "in your browser" },
  ];
  return (
    <section className="mx-auto max-w-5xl px-5 py-8">
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        variants={stagger}
        className="grid grid-cols-2 gap-4 sm:grid-cols-4"
      >
        {stats.map((s) => (
          <motion.div
            key={s.label}
            variants={fadeUp}
            className="rounded-xl glass px-4 py-5 text-center"
          >
            <div className="text-2xl font-bold gradient-text">{s.value}</div>
            <div className="text-xs text-slate-500">{s.label}</div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

/* ------------------------------------------------------------ Features */
const FEATURES = [
  {
    icon: "✨",
    title: "AI Prompt Engineer",
    desc: "Describe your goal in plain English and get a structured prompt with Role, Task, Requirements, and Output format — plus an explanation of what was engineered.",
  },
  {
    icon: "🆚",
    title: "Side-by-side comparison",
    desc: "Run one prompt across multiple models at once and read the outputs, tokens, latency, and cost side by side.",
  },
  {
    icon: "⚡",
    title: "Real-time streaming",
    desc: "Responses stream token-by-token from each model so you see results the moment they're generated.",
  },
  {
    icon: "🔢",
    title: "Live cost & tokens",
    desc: "An instant token estimate before you run, then exact usage and real cost per model after.",
  },
  {
    icon: "🧩",
    title: "Variables & templates",
    desc: "Turn any prompt into a reusable template with {{variables}} and smart example suggestions.",
  },
  {
    icon: "📚",
    title: "Library & versioning",
    desc: "Save prompts, keep a version history, and reload any of them — all synced to your account.",
  },
];

function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-20">
      <SectionHeading
        eyebrow="Features"
        title="Everything you need to ship better prompts"
        subtitle="A workbench that replaces juggling a chat window, a tokenizer tab, and a pricing page."
      />
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        variants={stagger}
        className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
      >
        {FEATURES.map((f) => (
          <motion.div
            key={f.title}
            variants={fadeUp}
            whileHover={{ y: -4 }}
            className="rounded-2xl glass p-6 transition hover:border-brand/30"
          >
            <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-brand/15 text-xl">
              {f.icon}
            </div>
            <h3 className="mb-2 text-lg font-semibold text-slate-100">
              {f.title}
            </h3>
            <p className="text-sm leading-relaxed text-slate-400">{f.desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

/* --------------------------------------------------------- How it works */
function HowItWorks() {
  const steps = [
    {
      n: "01",
      title: "Describe your goal",
      desc: "Write a sentence about what you need. The AI Prompt Engineer turns it into a structured, professional prompt.",
    },
    {
      n: "02",
      title: "Pick your models",
      desc: "Choose one model or several to compare — Claude for quality, Groq's open models for free, fast testing.",
    },
    {
      n: "03",
      title: "Run & compare",
      desc: "Stream responses side by side with live tokens and cost, then save the winning prompt to your library.",
    },
  ];
  return (
    <section id="how" className="relative scroll-mt-20 border-y border-white/5 bg-ink-900/40 py-20">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading
          eyebrow="How it works"
          title="From idea to tested prompt in three steps"
        />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              className="relative rounded-2xl glass p-6"
            >
              <div className="mb-4 text-3xl font-bold text-brand/40">{s.n}</div>
              <h3 className="mb-2 text-lg font-semibold text-slate-100">
                {s.title}
              </h3>
              <p className="text-sm leading-relaxed text-slate-400">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ Providers */
function Providers() {
  const models = [
    { label: "Opus 4.8", accent: "#7c5cff" },
    { label: "Sonnet 4.6", accent: "#54e3ff" },
    { label: "Haiku 4.5", accent: "#4ade80" },
    { label: "Fable 5", accent: "#ff9d54" },
    { label: "Llama 3.3 70B", accent: "#f97316" },
    { label: "Llama 3.1 8B", accent: "#14b8a6" },
    { label: "Gemma 2 9B", accent: "#eab308" },
  ];
  return (
    <section id="about" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-20 text-center">
      <SectionHeading
        eyebrow="Models"
        title="Claude quality, or free & fast — your call"
        subtitle="Switch providers without changing your workflow. Compare any of them in the same run."
      />
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        {models.map((m) => (
          <motion.span
            key={m.label}
            whileHover={{ y: -3 }}
            className="flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium"
            style={{
              borderColor: `${m.accent}55`,
              backgroundColor: `${m.accent}14`,
              color: m.accent,
            }}
          >
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: m.accent }} />
            {m.label}
          </motion.span>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ CTA */
function CTA() {
  return (
    <section className="mx-auto max-w-6xl px-5 pb-24">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="relative overflow-hidden rounded-3xl border border-brand/30 bg-gradient-to-br from-brand/20 via-ink-800 to-forge-cyan/10 px-8 py-16 text-center"
      >
        <h2 className="text-3xl font-bold text-white sm:text-4xl">
          Ready to forge better prompts?
        </h2>
        <p className="mx-auto mt-3 max-w-md text-slate-300">
          Create a free account and get 20 credits to start engineering,
          testing, and comparing today.
        </p>
        <Link
          href="/login?mode=signup"
          className="mt-8 inline-block rounded-xl bg-white px-7 py-3 font-semibold text-ink-900 shadow-glow transition hover:brightness-95"
        >
          Get started free
        </Link>
      </motion.div>
    </section>
  );
}

/* --------------------------------------------------------------- shared */
function SectionHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mx-auto max-w-2xl text-center"
    >
      <span className="text-xs font-semibold uppercase tracking-widest text-brand-soft">
        {eyebrow}
      </span>
      <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-100 sm:text-4xl">
        {title}
      </h2>
      {subtitle && <p className="mt-3 text-slate-400">{subtitle}</p>}
    </motion.div>
  );
}

function Blobs() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <motion.div
        animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
        transition={{ duration: 18, repeat: Infinity }}
        className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-brand/20 blur-[120px]"
      />
      <motion.div
        animate={{ x: [0, -30, 0], y: [0, 40, 0] }}
        transition={{ duration: 22, repeat: Infinity }}
        className="absolute right-0 top-40 h-96 w-96 rounded-full bg-forge-cyan/15 blur-[120px]"
      />
    </div>
  );
}

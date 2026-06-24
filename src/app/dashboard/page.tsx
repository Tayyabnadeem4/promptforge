"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, type Variants } from "framer-motion";
import Sidebar from "@/components/dashboard/Sidebar";
import PricingModal from "@/components/PricingModal";
import AuthModal from "@/components/AuthModal";
import CountUp from "@/components/CountUp";
import { useAccount } from "@/lib/account";
import { getPlan } from "@/lib/plans";

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

export default function DashboardPage() {
  const router = useRouter();
  const [navOpen, setNavOpen] = useState(false);
  const user = useAccount((s) => s.user);
  const ready = useAccount((s) => s.ready);
  const refresh = useAccount((s) => s.refresh);
  const openPricing = useAccount((s) => s.openPricing);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (ready && !user) router.replace("/login");
  }, [ready, user, router]);

  if (!ready || !user) {
    return (
      <div className="grid min-h-screen place-items-center">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-brand" />
      </div>
    );
  }

  const plan = getPlan(user.plan);
  const planCredits = plan?.credits ?? 20;
  const pct = Math.min(100, Math.round((user.credits / planCredits) * 100));

  return (
    <div className="min-h-screen">
      <PricingModal />
      <AuthModal />

      <Sidebar open={navOpen} onClose={() => setNavOpen(false)} />

      {/* content area is offset by the sidebar on large screens */}
      <div className="lg:pl-64">
        {/* mobile top bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/5 bg-ink-900/80 px-4 py-3 backdrop-blur-xl lg:hidden">
          <button
            onClick={() => setNavOpen(true)}
            aria-label="Open menu"
            className="grid h-9 w-9 place-items-center rounded-lg text-slate-300 hover:bg-white/5"
          >
            <MenuIcon />
          </button>
          <span className="text-base font-bold">
            <span className="gradient-text">Prompt</span>
            <span className="text-slate-100">Forge</span>
          </span>
          <button
            onClick={openPricing}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-sm"
          >
            <span className="font-mono text-slate-100">{user.credits}</span>
            <span className="text-xs text-slate-500">credits</span>
          </button>
        </header>

        <main className="mx-auto max-w-5xl px-5 py-8">
          {/* Welcome + open playground */}
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <motion.div initial="hidden" animate="show" variants={fadeUp}>
              <h1 className="text-2xl font-bold text-slate-100">Welcome back 👋</h1>
              <p className="text-sm text-slate-500">{user.email}</p>
            </motion.div>
            <Link
              href="/playground"
              className="rounded-lg bg-gradient-to-r from-brand to-forge-cyan px-4 py-2.5 text-sm font-semibold text-white shadow-glow-sm"
            >
              Open Playground →
            </Link>
          </div>

          {/* Credits hero */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="overflow-hidden rounded-2xl border border-brand/30 bg-gradient-to-br from-brand/15 to-forge-cyan/5 p-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-400">
                  Credits remaining
                </p>
                <p className="mt-1 text-4xl font-extrabold text-white">
                  <CountUp value={user.credits} />
                </p>
                <p className="mt-1 text-sm capitalize text-slate-400">
                  {user.plan} plan
                </p>
              </div>
              <button
                onClick={openPricing}
                className="rounded-xl bg-white px-5 py-2.5 font-semibold text-ink-900 transition hover:brightness-95"
              >
                Buy more credits
              </button>
            </div>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-ink-900/60">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-brand to-forge-cyan"
              />
            </div>
          </motion.div>

          {/* Stats grid */}
          <motion.div
            initial="hidden"
            animate="show"
            variants={stagger}
            className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            <StatCard label="Prompts run" value={user.runs} icon={<PlayIcon />} animate />
            <StatCard label="AI generations" value={user.generations} icon={<SparkIcon />} animate />
            <StatCard label="Credits spent" value={user.creditsSpent} icon={<CoinIcon />} animate />
            <StatCard
              label="Member since"
              value={new Date(user.createdAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
              icon={<CalendarIcon />}
            />
          </motion.div>

          {/* Plan + quick actions */}
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <motion.div variants={fadeUp} initial="hidden" animate="show" className="rounded-2xl glass p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                Your plan
              </h2>
              <div className="mt-3 flex items-end gap-2">
                <span className="text-2xl font-bold capitalize text-slate-100">
                  {plan?.name ?? user.plan}
                </span>
                <span className="mb-1 text-sm text-slate-500">${plan?.price ?? 0}/mo</span>
              </div>
              <ul className="mt-4 space-y-2">
                {(plan?.features ?? []).map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                    <span className="text-brand-soft">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={openPricing}
                className="mt-5 w-full rounded-lg bg-brand/20 py-2.5 text-sm font-medium text-brand-glow transition hover:bg-brand/30"
              >
                {user.plan === "max" ? "Manage plan" : "Upgrade plan"}
              </button>
            </motion.div>

            <motion.div variants={fadeUp} initial="hidden" animate="show" className="rounded-2xl glass p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                Quick actions
              </h2>
              <div className="mt-4 grid gap-3">
                <ActionLink href="/playground" title="Open the Playground" desc="Engineer, run, and compare prompts" accent="#7c5cff" />
                <ActionLink href="/pricing" title="View plans" desc="Compare Free, Pro, and Max" accent="#54e3ff" />
                <ActionLink href="/contact" title="Contact us" desc="Questions, feedback, or support" accent="#4ade80" />
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  animate = false,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  animate?: boolean;
}) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -3 }}
      className="rounded-2xl glass p-5 transition hover:border-brand/20"
    >
      <div className="mb-3 grid h-9 w-9 place-items-center rounded-lg bg-white/5 text-slate-300">
        {icon}
      </div>
      <p className="text-2xl font-bold text-slate-100">
        {animate && typeof value === "number" ? <CountUp value={value} /> : value}
      </p>
      <p className="text-xs text-slate-500">{label}</p>
    </motion.div>
  );
}

function ActionLink({
  href,
  title,
  desc,
  accent,
}: {
  href: string;
  title: string;
  desc: string;
  accent: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between rounded-xl border border-white/5 bg-ink-900/40 px-4 py-3 transition hover:border-white/10 hover:bg-ink-900/70"
    >
      <div className="flex items-center gap-3">
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: accent }} />
        <div>
          <p className="text-sm font-medium text-slate-100">{title}</p>
          <p className="text-xs text-slate-500">{desc}</p>
        </div>
      </div>
      <span className="text-slate-500 transition group-hover:translate-x-0.5 group-hover:text-white">
        →
      </span>
    </Link>
  );
}

/* ---- icons ---- */
const ic = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};
function MenuIcon() {
  return (
    <svg {...ic} width={20} height={20}>
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}
function PlayIcon() {
  return (
    <svg {...ic}>
      <path d="M6 4.5v15l13-7.5z" />
    </svg>
  );
}
function SparkIcon() {
  return (
    <svg {...ic} fill="currentColor" stroke="none">
      <path d="M12 2l1.7 5.3L19 9l-5.3 1.7L12 16l-1.7-5.3L5 9l5.3-1.7z" />
    </svg>
  );
}
function CoinIcon() {
  return (
    <svg {...ic}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v10M9.5 9.5h3.5a1.8 1.8 0 0 1 0 3.5H10a1.8 1.8 0 0 0 0 3.5h3.5" />
    </svg>
  );
}
function CalendarIcon() {
  return (
    <svg {...ic}>
      <rect x="3" y="4.5" width="18" height="16" rx="2" />
      <path d="M3 9h18M8 3v3M16 3v3" />
    </svg>
  );
}

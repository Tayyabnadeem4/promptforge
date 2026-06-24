"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import SiteNav from "@/components/site/SiteNav";
import SiteFooter from "@/components/site/SiteFooter";
import { useAccount } from "@/lib/account";
import { PLANS } from "@/lib/plans";

export default function PricingPage() {
  const router = useRouter();
  const user = useAccount((s) => s.user);
  const refresh = useAccount((s) => s.refresh);
  const upgrade = useAccount((s) => s.upgrade);
  const [busy, setBusy] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const choose = async (planId: string) => {
    if (planId === "free") {
      if (!user) router.push("/login?mode=signup");
      return;
    }
    if (!user) {
      router.push("/login?mode=signup");
      return;
    }
    setBusy(planId);
    try {
      await upgrade(planId);
      setDone(planId);
      setTimeout(() => setDone(null), 2500);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-brand/15 blur-[140px]" />
      </div>
      <SiteNav />

      <main className="mx-auto max-w-6xl px-5 py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <span className="text-xs font-semibold uppercase tracking-widest text-brand-soft">
            Pricing
          </span>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-100 sm:text-5xl">
            Simple, credit-based pricing
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-slate-400">
            Each model run or AI generation uses 1 credit. Start free, upgrade
            when you need more.{" "}
            <span className="text-slate-600">(Demo checkout — no real payment.)</span>
          </p>
        </motion.div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {PLANS.map((plan, i) => {
            const current = user?.plan === plan.id;
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -6 }}
                className="relative flex flex-col rounded-2xl border bg-ink-900/40 p-6"
                style={{
                  borderColor: plan.popular
                    ? `${plan.accent}80`
                    : "rgba(255,255,255,0.08)",
                  boxShadow: plan.popular
                    ? "0 0 50px -12px rgba(124,92,255,0.4)"
                    : "none",
                }}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-6 rounded-full bg-brand px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white">
                    Most popular
                  </span>
                )}
                <h3
                  className="text-xl font-semibold"
                  style={{ color: plan.accent }}
                >
                  {plan.name}
                </h3>
                <p className="text-sm text-slate-500">{plan.tagline}</p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-slate-100">
                    ${plan.price}
                  </span>
                  <span className="text-slate-500">/mo</span>
                </div>
                <p className="mt-1 text-sm text-brand-soft">
                  {plan.credits} credits
                </p>

                <ul className="mt-6 flex-1 space-y-2.5">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2 text-sm text-slate-300"
                    >
                      <span className="mt-0.5 text-brand-soft">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => choose(plan.id)}
                  disabled={busy !== null || current}
                  className="mt-7 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition disabled:opacity-60"
                  style={{
                    backgroundColor:
                      plan.id === "free" ? "rgba(255,255,255,0.06)" : plan.accent,
                    color: plan.id === "free" ? "#cbd5e1" : "#fff",
                  }}
                >
                  {busy === plan.id ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  ) : current ? (
                    "Current plan"
                  ) : done === plan.id ? (
                    "✓ Credits added!"
                  ) : plan.id === "free" ? (
                    user ? "Included" : "Start free"
                  ) : (
                    `Get ${plan.name}`
                  )}
                </button>
              </motion.div>
            );
          })}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

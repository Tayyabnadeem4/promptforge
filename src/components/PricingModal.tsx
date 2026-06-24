"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { useAccount } from "@/lib/account";
import { PLANS } from "@/lib/plans";

export default function PricingModal() {
  const open = useAccount((s) => s.pricingOpen);
  const close = useAccount((s) => s.closePricing);
  const user = useAccount((s) => s.user);
  const upgrade = useAccount((s) => s.upgrade);
  const [busy, setBusy] = useState<string | null>(null);

  const buy = async (planId: string) => {
    setBusy(planId);
    try {
      await upgrade(planId);
    } finally {
      setBusy(null);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />
          <div className="fixed inset-0 z-50 grid place-items-center overflow-auto p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="w-full max-w-4xl rounded-2xl glass-strong p-6"
            >
              <div className="mb-1 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-100">
                  Choose your plan
                </h2>
                <button
                  onClick={close}
                  className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/5 hover:text-white"
                >
                  <CloseIcon />
                </button>
              </div>
              <p className="mb-6 text-sm text-slate-500">
                You have{" "}
                <span className="font-mono text-brand-glow">
                  {user?.credits ?? 0}
                </span>{" "}
                credits. Each model run or AI generation uses 1 credit.{" "}
                <span className="text-slate-600">
                  (Demo checkout — no real payment.)
                </span>
              </p>

              <div className="grid gap-4 sm:grid-cols-3">
                {PLANS.map((plan) => {
                  const current = user?.plan === plan.id;
                  return (
                    <motion.div
                      key={plan.id}
                      whileHover={{ y: -4 }}
                      className="relative flex flex-col rounded-xl border bg-ink-900/40 p-5"
                      style={{
                        borderColor: plan.popular
                          ? `${plan.accent}80`
                          : "rgba(255,255,255,0.08)",
                      }}
                    >
                      {plan.popular && (
                        <span className="absolute -top-2.5 left-5 rounded-full bg-brand px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                          Popular
                        </span>
                      )}
                      <h3
                        className="text-lg font-semibold"
                        style={{ color: plan.accent }}
                      >
                        {plan.name}
                      </h3>
                      <p className="mb-3 text-xs text-slate-500">{plan.tagline}</p>
                      <div className="mb-4 flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-slate-100">
                          ${plan.price}
                        </span>
                        <span className="text-sm text-slate-500">/mo</span>
                      </div>
                      <ul className="mb-5 space-y-2 text-sm text-slate-300">
                        {plan.features.map((f) => (
                          <li key={f} className="flex items-start gap-2">
                            <CheckIcon accent={plan.accent} />
                            {f}
                          </li>
                        ))}
                      </ul>
                      <div className="mt-auto">
                        {plan.id === "free" || current ? (
                          <div className="rounded-lg border border-white/10 py-2.5 text-center text-sm text-slate-500">
                            {current ? "Current plan" : "Default"}
                          </div>
                        ) : (
                          <button
                            onClick={() => buy(plan.id)}
                            disabled={busy !== null}
                            className="flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold text-white shadow-glow-sm transition disabled:opacity-60"
                            style={{ backgroundColor: plan.accent }}
                          >
                            {busy === plan.id ? (
                              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                            ) : (
                              `Get ${plan.name} — +${plan.credits} credits`
                            )}
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

function CheckIcon({ accent }: { accent: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke={accent}
      strokeWidth="2.5"
      className="mt-0.5 shrink-0"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

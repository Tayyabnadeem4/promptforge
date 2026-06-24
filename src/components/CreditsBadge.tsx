"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAccount } from "@/lib/account";

export default function CreditsBadge() {
  const user = useAccount((s) => s.user);
  const ready = useAccount((s) => s.ready);
  const openAuth = useAccount((s) => s.openAuth);
  const openPricing = useAccount((s) => s.openPricing);
  const logout = useAccount((s) => s.logout);
  const [menuOpen, setMenuOpen] = useState(false);

  if (!ready) {
    return <div className="h-9 w-24 animate-pulse rounded-lg bg-white/5" />;
  }

  if (!user) {
    return (
      <button
        onClick={openAuth}
        className="rounded-lg bg-brand/20 px-3 py-2 text-sm font-medium text-brand-glow transition hover:bg-brand/30"
      >
        Sign in
      </button>
    );
  }

  const low = user.credits <= 3;

  return (
    <div className="flex items-center gap-2">
      {/* Credits pill */}
      <button
        onClick={openPricing}
        title="Buy more credits"
        className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-sm font-medium transition ${
          low
            ? "border-forge-pink/40 bg-forge-pink/10 text-forge-pink"
            : "border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
        }`}
      >
        <CoinIcon />
        <span className="font-mono">{user.credits}</span>
        <span className="text-xs text-slate-500">credits</span>
      </button>

      {/* Upgrade */}
      <button
        onClick={openPricing}
        className="hidden rounded-lg bg-gradient-to-r from-brand to-forge-cyan px-3 py-2 text-sm font-semibold text-white shadow-glow-sm transition sm:block"
      >
        Upgrade
      </button>

      {/* Account menu */}
      <div className="relative">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="grid h-9 w-9 place-items-center rounded-full bg-ink-600 text-sm font-semibold uppercase text-brand-glow ring-1 ring-white/10"
        >
          {user.email[0]}
        </button>
        <AnimatePresence>
          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setMenuOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-xl glass-strong p-2"
              >
                <div className="px-2 py-1.5">
                  <p className="truncate text-sm text-slate-200">{user.email}</p>
                  <p className="text-xs capitalize text-slate-500">
                    {user.plan} plan · {user.credits} credits
                  </p>
                </div>
                <div className="my-1 h-px bg-white/10" />
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    openPricing();
                  }}
                  className="block w-full rounded-lg px-2 py-1.5 text-left text-sm text-slate-300 transition hover:bg-brand/15"
                >
                  Plans & credits
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    logout();
                  }}
                  className="block w-full rounded-lg px-2 py-1.5 text-left text-sm text-slate-300 transition hover:bg-forge-pink/15 hover:text-forge-pink"
                >
                  Sign out
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function CoinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v10M9.5 9.5h3.5a1.8 1.8 0 0 1 0 3.5H10a1.8 1.8 0 0 0 0 3.5h3.5" />
    </svg>
  );
}

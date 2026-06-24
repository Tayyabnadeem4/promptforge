"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { useAccount } from "@/lib/account";

export default function AuthModal() {
  const open = useAccount((s) => s.authOpen);
  const close = useAccount((s) => s.closeAuth);
  const login = useAccount((s) => s.login);
  const signup = useAccount((s) => s.signup);

  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (mode === "signup") await signup(email, password);
      else await login(email, password);
      setEmail("");
      setPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
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
          <div className="fixed inset-0 z-50 grid place-items-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              className="w-full max-w-sm overflow-hidden rounded-2xl glass-strong p-6"
            >
              <div className="mb-1 flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-brand to-forge-cyan text-sm">
                  ⚒️
                </span>
                <h2 className="text-lg font-semibold text-slate-100">
                  {mode === "signup" ? "Create your account" : "Welcome back"}
                </h2>
              </div>
              <p className="mb-5 text-sm text-slate-500">
                {mode === "signup"
                  ? "Sign up free and get 20 credits to start forging."
                  : "Sign in to keep building and running prompts."}
              </p>

              <form onSubmit={submit} className="space-y-3">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="w-full rounded-lg border border-white/10 bg-ink-900/60 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus-ring"
                />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password (min 6 characters)"
                  className="w-full rounded-lg border border-white/10 bg-ink-900/60 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus-ring"
                />

                {error && <p className="text-xs text-forge-pink">{error}</p>}

                <button
                  type="submit"
                  disabled={busy}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-brand to-forge-cyan py-2.5 font-semibold text-white shadow-glow-sm disabled:opacity-60"
                >
                  {busy && (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  )}
                  {mode === "signup" ? "Create account" : "Sign in"}
                </button>
              </form>

              <p className="mt-4 text-center text-sm text-slate-500">
                {mode === "signup" ? "Already have an account?" : "New here?"}{" "}
                <button
                  onClick={() => {
                    setMode(mode === "signup" ? "login" : "signup");
                    setError(null);
                  }}
                  className="font-medium text-brand-glow hover:underline"
                >
                  {mode === "signup" ? "Sign in" : "Create one"}
                </button>
              </p>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

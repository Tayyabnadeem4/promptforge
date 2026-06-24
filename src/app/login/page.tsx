"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useAccount } from "@/lib/account";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const initialMode = params.get("mode") === "signup" ? "signup" : "login";

  const user = useAccount((s) => s.user);
  const ready = useAccount((s) => s.ready);
  const refresh = useAccount((s) => s.refresh);
  const login = useAccount((s) => s.login);
  const signup = useAccount((s) => s.signup);

  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Already signed in → straight to dashboard.
  useEffect(() => {
    if (ready && user) router.replace("/dashboard");
  }, [ready, user, router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (mode === "signup") await signup(email, password);
      else await login(email, password);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setBusy(false);
    }
  };

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden px-5">
      {/* ambient blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-20 top-10 h-80 w-80 rounded-full bg-brand/20 blur-[120px]" />
        <div className="absolute -right-10 bottom-0 h-80 w-80 rounded-full bg-forge-cyan/15 blur-[120px]" />
      </div>

      <Link
        href="/"
        className="absolute left-5 top-5 flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
      >
        ← Back home
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 26 }}
        className="w-full max-w-sm rounded-2xl glass-strong p-7"
      >
        <div className="mb-1 flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand to-forge-cyan shadow-glow-sm">
            <span className="text-base">⚒️</span>
          </span>
          <span className="text-lg font-bold">
            <span className="gradient-text">Prompt</span>
            <span className="text-slate-100">Forge</span>
          </span>
        </div>
        <h1 className="mt-4 text-xl font-bold text-slate-100">
          {mode === "signup" ? "Create your account" : "Welcome back"}
        </h1>
        <p className="mb-6 mt-1 text-sm text-slate-500">
          {mode === "signup"
            ? "Sign up free and get 20 credits to start forging."
            : "Sign in to your playground and dashboard."}
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

        <p className="mt-5 text-center text-sm text-slate-500">
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
  );
}

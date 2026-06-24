"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import SiteNav from "@/components/site/SiteNav";
import SiteFooter from "@/components/site/SiteFooter";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send");
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-20 top-0 h-80 w-80 rounded-full bg-brand/15 blur-[120px]" />
      </div>
      <SiteNav />

      <main className="mx-auto max-w-5xl px-5 py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <span className="text-xs font-semibold uppercase tracking-widest text-brand-soft">
            Contact
          </span>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-100">
            Let&apos;s talk
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-slate-400">
            Questions, feedback, or a feature request? Drop a message and we&apos;ll
            get back to you.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          {/* Info cards */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <InfoCard
              icon="✉️"
              title="Email"
              value="syed.vkax@gmail.com"
              accent="#7c5cff"
            />
            <InfoCard
              icon="💬"
              title="Response time"
              value="Usually within 24 hours"
              accent="#54e3ff"
            />
            <InfoCard
              icon="🛠️"
              title="Support"
              value="Bug reports & feature ideas welcome"
              accent="#4ade80"
            />
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-2xl glass-strong p-6"
          >
            <AnimatePresence mode="wait">
              {sent ? (
                <motion.div
                  key="sent"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="grid place-items-center py-12 text-center"
                >
                  <div className="mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-forge-green/15 text-2xl">
                    ✓
                  </div>
                  <h3 className="text-lg font-semibold text-slate-100">
                    Message sent!
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Thanks {name || "there"} — we&apos;ll be in touch soon.
                  </p>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onSubmit={submit}
                  className="space-y-3"
                >
                  <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full rounded-lg border border-white/10 bg-ink-900/60 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus-ring"
                  />
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    className="w-full rounded-lg border border-white/10 bg-ink-900/60 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus-ring"
                  />
                  <textarea
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={5}
                    placeholder="How can we help?"
                    className="w-full resize-y rounded-lg border border-white/10 bg-ink-900/60 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus-ring"
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
                    Send message
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

function InfoCard({
  icon,
  title,
  value,
  accent,
}: {
  icon: string;
  title: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl glass p-5">
      <div
        className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-lg"
        style={{ backgroundColor: `${accent}1f` }}
      >
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-slate-100">{title}</p>
        <p className="text-sm text-slate-400">{value}</p>
      </div>
    </div>
  );
}

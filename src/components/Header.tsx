"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { useForge } from "@/lib/store";
import { PRESETS } from "@/lib/presets";
import CreditsBadge from "@/components/CreditsBadge";

export default function Header({ onOpenLibrary }: { onOpenLibrary: () => void }) {
  const loadPreset = useForge((s) => s.loadPreset);
  const [presetsOpen, setPresetsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-ink-900/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between px-5 py-3">
        <Link href="/dashboard" className="flex items-center gap-3">
          <motion.div
            initial={{ rotate: -12, scale: 0.8, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand to-forge-cyan shadow-glow"
          >
            <AnvilIcon />
          </motion.div>
          <div>
            <h1 className="text-lg font-bold leading-none tracking-tight">
              <span className="gradient-text">Prompt</span>
              <span className="text-slate-100">Forge</span>
            </h1>
            <p className="text-[11px] text-slate-500">AI Prompt IDE & Playground</p>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          {/* Presets dropdown */}
          <div className="relative">
            <button
              onClick={() => setPresetsOpen((v) => !v)}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300 transition hover:text-white"
            >
              <SparkIcon /> Presets
            </button>
            {presetsOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setPresetsOpen(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 z-20 mt-2 w-64 overflow-hidden rounded-xl glass-strong p-1.5"
                >
                  {PRESETS.map((p, i) => (
                    <button
                      key={p.name}
                      onClick={() => {
                        loadPreset(i);
                        setPresetsOpen(false);
                      }}
                      className="block w-full rounded-lg px-3 py-2 text-left text-sm text-slate-300 transition hover:bg-brand/15 hover:text-white"
                    >
                      {p.name}
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </div>

          <button
            onClick={onOpenLibrary}
            className="flex items-center gap-1.5 rounded-lg bg-brand/20 px-3 py-2 text-sm font-medium text-brand-glow transition hover:bg-brand/30"
          >
            <BookIcon /> Library
          </button>

          <span className="mx-1 hidden h-6 w-px bg-white/10 sm:block" />
          <CreditsBadge />
        </div>
      </div>
    </header>
  );
}

function AnvilIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9h13a4 4 0 0 0 4-4M7 9v2a5 5 0 0 0 5 5h0M8 21h8M10 16l-1 5M14 16l1 5" />
    </svg>
  );
}
function SparkIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l1.8 5.2L19 9l-5.2 1.8L12 16l-1.8-5.2L5 9l5.2-1.8z" />
    </svg>
  );
}
function BookIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 4.5A2.5 2.5 0 0 1 6.5 2H20v15" />
    </svg>
  );
}

"use client";

import { motion } from "framer-motion";
import { useForge } from "@/lib/store";
import { MODEL_MAP } from "@/lib/models";
import type { Effort } from "@/lib/types";
import { runAll } from "@/lib/runner";

const EFFORTS: Effort[] = ["low", "medium", "high"];
const TOKEN_OPTIONS = [256, 512, 1024, 2048, 4096];

export default function Controls() {
  const maxTokens = useForge((s) => s.maxTokens);
  const setMaxTokens = useForge((s) => s.setMaxTokens);
  const effort = useForge((s) => s.effort);
  const setEffort = useForge((s) => s.setEffort);
  const thinking = useForge((s) => s.thinking);
  const setThinking = useForge((s) => s.setThinking);
  const isRunning = useForge((s) => s.isRunning);
  const selected = useForge((s) => s.selectedModels);

  const anyEffort = selected.some((m) => MODEL_MAP[m]?.supportsEffort);
  const anyThinking = selected.some((m) => MODEL_MAP[m]?.supportsThinking);

  return (
    <div className="glass rounded-xl p-4 space-y-4">
      {/* Max tokens */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
            Max output tokens
          </span>
          <span className="font-mono text-xs text-brand-soft">{maxTokens}</span>
        </div>
        <div className="flex gap-1.5">
          {TOKEN_OPTIONS.map((t) => (
            <button
              key={t}
              onClick={() => setMaxTokens(t)}
              className={`flex-1 rounded-lg py-1.5 text-xs font-medium transition ${
                maxTokens === t
                  ? "bg-brand/25 text-white shadow-glow-sm"
                  : "bg-ink-900/50 text-slate-400 hover:text-slate-200"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Effort */}
      <div className={anyEffort ? "" : "opacity-40"}>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
            Effort
          </span>
          {!anyEffort && (
            <span className="text-[10px] text-slate-500">unsupported</span>
          )}
        </div>
        <div className="flex gap-1.5">
          {EFFORTS.map((e) => (
            <button
              key={e}
              disabled={!anyEffort}
              onClick={() => setEffort(e)}
              className={`flex-1 rounded-lg py-1.5 text-xs font-medium capitalize transition ${
                effort === e
                  ? "bg-forge-cyan/20 text-white"
                  : "bg-ink-900/50 text-slate-400 hover:text-slate-200"
              }`}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      {/* Thinking toggle */}
      <button
        disabled={!anyThinking}
        onClick={() => setThinking(!thinking)}
        className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition ${
          anyThinking ? "" : "opacity-40"
        } bg-ink-900/50`}
      >
        <span className="text-slate-300">Extended thinking</span>
        <span
          className={`relative h-5 w-9 rounded-full transition ${
            thinking ? "bg-brand" : "bg-ink-500"
          }`}
        >
          <motion.span
            layout
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="absolute top-0.5 h-4 w-4 rounded-full bg-white"
            style={{ left: thinking ? 18 : 2 }}
          />
        </span>
      </button>

      {/* Run button */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => runAll()}
        disabled={isRunning}
        className="relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-brand to-forge-cyan py-3 font-semibold text-white shadow-glow disabled:opacity-70"
      >
        {isRunning ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            Running…
          </>
        ) : (
          <>
            <PlayIcon />
            Run on {selected.length} model{selected.length > 1 ? "s" : ""}
            <span className="ml-0.5 rounded-md bg-white/15 px-1.5 py-0.5 text-[11px] font-medium">
              {selected.length} credit{selected.length > 1 ? "s" : ""}
            </span>
          </>
        )}
        {isRunning && (
          <span className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        )}
      </motion.button>
      <p className="text-center text-[11px] text-slate-500">
        or press{" "}
        <kbd className="rounded bg-ink-600 px-1.5 py-0.5 font-mono text-slate-300">
          ⌘/Ctrl + Enter
        </kbd>
      </p>
    </div>
  );
}

function PlayIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

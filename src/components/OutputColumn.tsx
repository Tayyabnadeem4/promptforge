"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import type { RunResult } from "@/lib/types";
import { MODEL_MAP } from "@/lib/models";
import { formatTokens, formatUsd } from "@/lib/tokens";

export default function OutputColumn({ result }: { result: RunResult }) {
  const m = MODEL_MAP[result.model];
  const [copied, setCopied] = useState(false);
  if (!m) return null;

  const elapsed =
    result.startedAt && result.finishedAt
      ? ((result.finishedAt - result.startedAt) / 1000).toFixed(1) + "s"
      : null;

  const copy = async () => {
    await navigator.clipboard.writeText(result.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex min-h-[320px] flex-col overflow-hidden rounded-xl glass"
      style={{ borderColor: `${m.accent}33` }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between border-b border-white/5 px-4 py-2.5"
        style={{ backgroundColor: `${m.accent}12` }}
      >
        <div className="flex items-center gap-2">
          <StatusDot status={result.status} accent={m.accent} />
          <span className="font-semibold text-slate-100">{m.label}</span>
        </div>
        <div className="flex items-center gap-2">
          {elapsed && (
            <span className="font-mono text-[11px] text-slate-400">
              {elapsed}
            </span>
          )}
          {result.text && (
            <button
              onClick={copy}
              className="rounded-md px-2 py-1 text-[11px] text-slate-400 transition hover:bg-white/5 hover:text-slate-100"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-auto p-4">
        {result.status === "error" ? (
          <div className="rounded-lg border border-forge-pink/30 bg-forge-pink/10 p-3 text-sm text-forge-pink">
            {result.error}
          </div>
        ) : result.text ? (
          <p
            className={`whitespace-pre-wrap font-mono text-sm leading-relaxed text-slate-200 ${
              result.status === "streaming" ? "caret" : ""
            }`}
            style={{ ["--accent" as string]: m.accent }}
          >
            {result.text}
          </p>
        ) : result.status === "streaming" ? (
          <ThinkingDots accent={m.accent} />
        ) : (
          <p className="text-sm text-slate-600">Output will appear here.</p>
        )}
      </div>

      {/* Footer stats */}
      {result.usage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-4 border-t border-white/5 px-4 py-2.5 text-[11px]"
        >
          <Metric label="in" value={formatTokens(result.usage.inputTokens)} />
          <Metric label="out" value={formatTokens(result.usage.outputTokens)} />
          <Metric
            label="cost"
            value={formatUsd(result.usage.costUsd)}
            accent={m.accent}
          />
        </motion.div>
      )}
    </motion.div>
  );
}

function StatusDot({ status, accent }: { status: string; accent: string }) {
  if (status === "streaming") {
    return (
      <span className="relative flex h-2.5 w-2.5">
        <span
          className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full"
          style={{ backgroundColor: accent }}
        />
        <span
          className="relative inline-flex h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: accent }}
        />
      </span>
    );
  }
  const color =
    status === "done" ? accent : status === "error" ? "#ff5c8a" : "#475569";
  return (
    <span
      className="h-2.5 w-2.5 rounded-full"
      style={{ backgroundColor: color }}
    />
  );
}

function ThinkingDots({ accent }: { accent: string }) {
  return (
    <div className="flex items-center gap-1.5">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: accent }}
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  );
}

function Metric({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <span className="flex items-center gap-1">
      <span className="uppercase tracking-wider text-slate-500">{label}</span>
      <span className="font-mono" style={{ color: accent ?? "#cbd5e1" }}>
        {value}
      </span>
    </span>
  );
}

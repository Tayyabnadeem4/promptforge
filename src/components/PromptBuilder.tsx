"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { useForge } from "@/lib/store";
import { useAccount } from "@/lib/account";
import { toast } from "@/lib/toast";

const FORMATS = [
  { id: "auto", label: "Auto" },
  { id: "json", label: "JSON" },
  { id: "markdown", label: "Markdown" },
  { id: "bullets", label: "Bullets" },
  { id: "steps", label: "Steps" },
  { id: "plain", label: "Plain text" },
];

const STRUCTURES = [
  { id: "detailed", label: "Detailed (full sections)" },
  { id: "concise", label: "Concise" },
  { id: "cot", label: "Chain-of-thought" },
  { id: "fewshot", label: "Few-shot examples" },
];

export default function PromptBuilder() {
  const system = useForge((s) => s.system);
  const prompt = useForge((s) => s.prompt);
  const applyGenerated = useForge((s) => s.applyGenerated);

  const [idea, setIdea] = useState("");
  const [format, setFormat] = useState("auto");
  const [structure, setStructure] = useState("detailed");
  const [loading, setLoading] = useState<"generate" | "enhance" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    technique: string;
    tips: string[];
  } | null>(null);

  const call = async (mode: "generate" | "enhance") => {
    if (mode === "generate" && !idea.trim()) return;
    setLoading(mode);
    setError(null);
    try {
      const res = await fetch("/api/enhance", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          mode,
          idea,
          currentSystem: system,
          currentPrompt: prompt,
          format,
          structure,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) useAccount.getState().openAuth();
        if (res.status === 402) useAccount.getState().openPricing();
        throw new Error(data.error || "Generation failed");
      }

      const variables: Record<string, string> = {};
      for (const v of data.variables ?? []) {
        if (v?.name) variables[v.name] = v.example ?? "";
      }
      applyGenerated(data.system ?? "", data.prompt ?? "", variables);
      setResult({
        technique: data.technique ?? "Structured",
        tips: Array.isArray(data.tips) ? data.tips : [],
      });
      if (mode === "generate") setIdea("");
      useAccount.getState().refresh();
      toast(
        mode === "generate" ? "Prompt engineered ✨" : "Prompt improved ✨",
        "success",
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-xl border border-brand/30 bg-gradient-to-br from-brand/10 to-forge-cyan/5 p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="grid h-6 w-6 place-items-center rounded-lg bg-brand/30 text-sm">
          ✨
        </span>
        <h2 className="text-sm font-semibold text-slate-100">AI Prompt Engineer</h2>
        <span className="hidden text-xs text-slate-500 sm:inline">
          describe your goal — get a structured, production-ready prompt
        </span>
      </div>

      <textarea
        value={idea}
        onChange={(e) => setIdea(e.target.value)}
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === "Enter") call("generate");
        }}
        rows={3}
        placeholder="Describe what you need in a sentence or two — who it's for, what it should produce, and any rules or constraints. e.g. “A prompt that turns messy meeting notes into a clean action-item list grouped by owner, for a project manager.”"
        className="w-full resize-y rounded-lg border border-white/10 bg-ink-900/60 px-3 py-2.5 text-sm leading-relaxed text-slate-100 placeholder:text-slate-600 focus-ring"
      />

      {/* Controls */}
      <div className="mt-2.5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-wrap gap-3">
          <Selector
            label="Output format"
            value={format}
            onChange={setFormat}
            options={FORMATS}
          />
          <Selector
            label="Structure"
            value={structure}
            onChange={setStructure}
            options={STRUCTURES}
          />
        </div>

        <div className="flex gap-2">
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => call("generate")}
            disabled={loading !== null || !idea.trim()}
            className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-brand to-brand-soft px-4 py-2.5 text-sm font-semibold text-white shadow-glow-sm transition disabled:opacity-50"
          >
            {loading === "generate" ? <Spinner /> : "✨"} Generate prompt
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => call("enhance")}
            disabled={loading !== null}
            title="Restructure and improve your current prompt"
            className="flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-white/10 disabled:opacity-50"
          >
            {loading === "enhance" ? <Spinner /> : "↻"} Improve current
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 text-xs text-forge-pink"
          >
            {error}
          </motion.p>
        )}
        {loading && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-2 text-xs text-brand-glow"
          >
            {loading === "generate"
              ? "Engineering your prompt…"
              : "Restructuring your prompt…"}
          </motion.p>
        )}

        {/* "What I engineered" — the Promptheus-style explanation */}
        {result && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-3 rounded-lg border border-white/5 bg-ink-900/40 p-3"
          >
            <div className="mb-2 flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-300">
                What I engineered
              </span>
              <span className="rounded-full bg-brand/20 px-2 py-0.5 text-[10px] font-medium text-brand-glow">
                {result.technique}
              </span>
            </div>
            <ul className="space-y-1.5">
              {result.tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
                  <CheckIcon />
                  {tip}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Selector({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { id: string; label: string }[];
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] uppercase tracking-wider text-slate-500">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-white/10 bg-ink-900/80 px-2.5 py-1.5 text-xs text-slate-200 focus-ring"
      >
        {options.map((o) => (
          <option key={o.id} value={o.id} className="bg-ink-800">
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function Spinner() {
  return (
    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
  );
}
function CheckIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#9d86ff"
      strokeWidth="2.5"
      className="mt-0.5 shrink-0"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useForge } from "@/lib/store";
import { extractVariables } from "@/lib/templates";
import { getSuggestions } from "@/lib/variableSuggestions";

export default function VariablesPanel() {
  const system = useForge((s) => s.system);
  const prompt = useForge((s) => s.prompt);
  const variables = useForge((s) => s.variables);
  const setVariable = useForge((s) => s.setVariable);

  const names = extractVariables(system, prompt);

  return (
    <div className="glass rounded-xl p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
          Variables
        </span>
        <span className="rounded-full bg-brand/20 px-2 py-0.5 text-[11px] font-semibold text-brand-glow">
          {names.length}
        </span>
      </div>

      {names.length === 0 ? (
        <p className="text-sm text-slate-500">
          Add <code className="rounded bg-ink-600 px-1 text-brand-soft">{`{{like_this}}`}</code>{" "}
          in your prompt to create reusable inputs.
        </p>
      ) : (
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {names.map((name) => (
              <motion.div
                key={name}
                layout
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.18 }}
              >
                <label className="mb-1 block font-mono text-xs text-brand-soft">
                  {`{{${name}}}`}
                </label>
                <textarea
                  value={variables[name] ?? ""}
                  onChange={(e) => setVariable(name, e.target.value)}
                  rows={1}
                  placeholder={`Value for ${name}…`}
                  className="w-full resize-y rounded-lg border border-white/5 bg-ink-900/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus-ring"
                />
                <Suggestions
                  name={name}
                  onPick={(v) => setVariable(name, v)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

function Suggestions({
  name,
  onPick,
}: {
  name: string;
  onPick: (v: string) => void;
}) {
  const ideas = getSuggestions(name);
  if (ideas.length === 0) return null;
  return (
    <div className="mt-1.5 flex flex-wrap gap-1">
      {ideas.slice(0, 6).map((idea) => (
        <button
          key={idea}
          onClick={() => onPick(idea)}
          className="rounded-md border border-white/5 bg-ink-700/60 px-1.5 py-0.5 text-[11px] text-slate-400 transition hover:border-brand/40 hover:text-brand-glow"
        >
          {idea}
        </button>
      ))}
    </div>
  );
}

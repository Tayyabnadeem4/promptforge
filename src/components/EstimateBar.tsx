"use client";

import { useForge } from "@/lib/store";
import { interpolate } from "@/lib/templates";
import { estimateTokens, formatTokens, formatUsd } from "@/lib/tokens";
import { MODEL_MAP, estimateCost } from "@/lib/models";

export default function EstimateBar() {
  const system = useForge((s) => s.system);
  const prompt = useForge((s) => s.prompt);
  const variables = useForge((s) => s.variables);
  const maxTokens = useForge((s) => s.maxTokens);
  const selected = useForge((s) => s.selectedModels);

  const inputTokens = estimateTokens(
    interpolate(system, variables) + "\n" + interpolate(prompt, variables),
  );

  // Worst-case input + full max output, summed across selected models.
  const totalCost = selected.reduce(
    (sum, id) => sum + estimateCost(id, inputTokens, maxTokens),
    0,
  );

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl glass px-4 py-3 text-sm">
      <Stat label="Input (est.)" value={`~${formatTokens(inputTokens)} tok`} />
      <span className="h-4 w-px bg-white/10" />
      <Stat
        label="Max cost / run"
        value={formatUsd(totalCost)}
        hint="input estimate + full max output, all models"
      />
      <span className="h-4 w-px bg-white/10" />
      <div className="flex items-center gap-2">
        {selected.map((id) => {
          const m = MODEL_MAP[id];
          if (!m) return null;
          return (
            <span
              key={id}
              className="flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs"
              style={{ backgroundColor: `${m.accent}1a`, color: m.accent }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: m.accent }}
              />
              {m.label}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col" title={hint}>
      <span className="text-[10px] uppercase tracking-wider text-slate-500">
        {label}
      </span>
      <span className="font-mono text-slate-200">{value}</span>
    </div>
  );
}

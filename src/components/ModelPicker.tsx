"use client";

import { motion } from "framer-motion";
import { MODELS, PROVIDER_LABELS, type Provider } from "@/lib/models";
import { useForge } from "@/lib/store";

const ORDER: Provider[] = ["anthropic", "groq"];

export default function ModelPicker() {
  const selected = useForge((s) => s.selectedModels);
  const toggle = useForge((s) => s.toggleModel);

  return (
    <div className="space-y-3">
      {ORDER.map((provider) => {
        const models = MODELS.filter((m) => m.provider === provider);
        return (
          <div key={provider}>
            <p className="mb-1.5 text-[10px] uppercase tracking-wider text-slate-500">
              {PROVIDER_LABELS[provider]}
            </p>
            <div className="flex flex-wrap gap-2">
              {models.map((m) => {
                const on = selected.includes(m.id);
                return (
                  <motion.button
                    key={m.id}
                    onClick={() => toggle(m.id)}
                    whileTap={{ scale: 0.94 }}
                    whileHover={{ y: -2 }}
                    className="group relative flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition"
                    style={{
                      borderColor: on ? `${m.accent}99` : "rgba(255,255,255,0.08)",
                      backgroundColor: on
                        ? `${m.accent}1f`
                        : "rgba(255,255,255,0.02)",
                      color: on ? "#fff" : "#94a3b8",
                    }}
                    title={m.blurb}
                  >
                    <span
                      className="h-2 w-2 rounded-full transition"
                      style={{
                        backgroundColor: on ? m.accent : "#475569",
                        boxShadow: on ? `0 0 10px ${m.accent}` : "none",
                      }}
                    />
                    {m.label}
                  </motion.button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

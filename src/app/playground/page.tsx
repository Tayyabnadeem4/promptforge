"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import PromptBuilder from "@/components/PromptBuilder";
import HighlightedEditor from "@/components/HighlightedEditor";
import ModelPicker from "@/components/ModelPicker";
import VariablesPanel from "@/components/VariablesPanel";
import Controls from "@/components/Controls";
import EstimateBar from "@/components/EstimateBar";
import OutputColumn from "@/components/OutputColumn";
import LibraryDrawer from "@/components/LibraryDrawer";
import AuthModal from "@/components/AuthModal";
import PricingModal from "@/components/PricingModal";
import { useForge } from "@/lib/store";
import { useAccount } from "@/lib/account";
import { runAll } from "@/lib/runner";

export default function PlaygroundPage() {
  const router = useRouter();
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const system = useForge((s) => s.system);
  const prompt = useForge((s) => s.prompt);
  const setSystem = useForge((s) => s.setSystem);
  const setPrompt = useForge((s) => s.setPrompt);
  const selected = useForge((s) => s.selectedModels);
  const results = useForge((s) => s.results);

  const refreshAccount = useAccount((s) => s.refresh);
  const user = useAccount((s) => s.user);
  const ready = useAccount((s) => s.ready);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    refreshAccount();
  }, [refreshAccount]);

  // Auth guard: once we know there's no session, send to login.
  useEffect(() => {
    if (ready && !user) router.replace("/login");
  }, [ready, user, router]);

  // ⌘/Ctrl + Enter to run.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        runAll();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!mounted || !ready) return <FullScreenLoader />;
  if (!user) return <FullScreenLoader />; // redirecting

  const orderedResults = selected
    .map((m) => results[m])
    .filter((r): r is NonNullable<typeof r> => Boolean(r));

  return (
    <div className="min-h-screen">
      <Header onOpenLibrary={() => setLibraryOpen(true)} />
      <LibraryDrawer open={libraryOpen} onClose={() => setLibraryOpen(false)} />
      <AuthModal />
      <PricingModal />

      <main className="mx-auto grid max-w-[1600px] gap-5 px-5 py-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          <PromptBuilder />
          <HighlightedEditor
            label="System prompt"
            value={system}
            onChange={setSystem}
            minHeight={90}
            placeholder="Set the model's role and rules…"
          />
          <HighlightedEditor
            label="Prompt"
            value={prompt}
            onChange={setPrompt}
            minHeight={160}
            placeholder="Write your prompt. Use {{variables}} for reusable inputs…"
          />

          <EstimateBar />

          <div>
            <div className="mb-3 flex items-center gap-2">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                Outputs
              </h2>
              <span className="text-xs text-slate-600">
                side-by-side model comparison
              </span>
            </div>
            {orderedResults.length === 0 ? (
              <EmptyState />
            ) : (
              <motion.div
                layout
                className="grid gap-4"
                style={{
                  gridTemplateColumns: `repeat(${Math.min(
                    orderedResults.length,
                    2,
                  )}, minmax(0, 1fr))`,
                }}
              >
                {orderedResults.map((r) => (
                  <OutputColumn key={r.model} result={r} />
                ))}
              </motion.div>
            )}
          </div>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-[76px] lg:self-start">
          <div className="glass rounded-xl p-4">
            <span className="mb-3 block text-xs font-medium uppercase tracking-wider text-slate-400">
              Models to compare
            </span>
            <ModelPicker />
            <p className="mt-2.5 text-[11px] text-slate-500">
              Pick one, or several to compare. Groq models are free to test.
            </p>
          </div>
          <Controls />
          <VariablesPanel />
        </aside>
      </main>
    </div>
  );
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid place-items-center rounded-xl glass py-16 text-center"
    >
      <div className="max-w-sm space-y-2">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-brand/15 text-2xl">
          ⚒️
        </div>
        <p className="text-slate-300">Forge your first prompt</p>
        <p className="text-sm text-slate-500">
          Write a prompt, pick your models, and hit{" "}
          <kbd className="rounded bg-ink-600 px-1.5 py-0.5 font-mono text-slate-300">
            Run
          </kbd>{" "}
          to stream and compare responses live.
        </p>
      </div>
    </motion.div>
  );
}

function FullScreenLoader() {
  return (
    <div className="grid min-h-screen place-items-center">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-brand" />
    </div>
  );
}

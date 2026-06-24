"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { useForge } from "@/lib/store";
import { toast } from "@/lib/toast";

export default function LibraryDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const library = useForge((s) => s.library);
  const savePrompt = useForge((s) => s.savePrompt);
  const loadPrompt = useForge((s) => s.loadPrompt);
  const deletePrompt = useForge((s) => s.deletePrompt);

  const [name, setName] = useState("");
  const [note, setNote] = useState("");

  const handleSave = () => {
    if (!name.trim()) return;
    savePrompt(name.trim(), note.trim());
    toast(`Saved “${name.trim()}”`, "success");
    setName("");
    setNote("");
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col glass-strong"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <h2 className="text-lg font-semibold text-slate-100">
                Prompt Library
              </h2>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/5 hover:text-white"
              >
                <CloseIcon />
              </button>
            </div>

            {/* Save current */}
            <div className="border-b border-white/10 p-5">
              <p className="mb-3 text-xs font-medium uppercase tracking-wider text-slate-400">
                Save current prompt
              </p>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Prompt name"
                className="mb-2 w-full rounded-lg border border-white/5 bg-ink-900/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus-ring"
              />
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Version note (optional)"
                className="mb-3 w-full rounded-lg border border-white/5 bg-ink-900/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus-ring"
              />
              <button
                onClick={handleSave}
                disabled={!name.trim()}
                className="w-full rounded-lg bg-brand py-2 text-sm font-medium text-white transition hover:bg-brand-soft disabled:opacity-40"
              >
                Save version
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-auto p-5">
              {library.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No saved prompts yet. Save one above to build your version
                  history.
                </p>
              ) : (
                <div className="space-y-3">
                  {library.map((p) => (
                    <motion.div
                      key={p.id}
                      layout
                      className="rounded-xl border border-white/5 bg-ink-900/40 p-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-slate-100">{p.name}</p>
                          <p className="text-[11px] text-slate-500">
                            {p.versions.length} version
                            {p.versions.length > 1 ? "s" : ""} ·{" "}
                            {new Date(p.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => {
                              loadPrompt(p.id);
                              onClose();
                            }}
                            className="rounded-md bg-brand/20 px-2.5 py-1 text-xs text-brand-glow transition hover:bg-brand/30"
                          >
                            Load
                          </button>
                          <button
                            onClick={() => deletePrompt(p.id)}
                            className="rounded-md px-2 py-1 text-xs text-slate-500 transition hover:bg-forge-pink/15 hover:text-forge-pink"
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      </div>
                      {p.versions[0]?.note && (
                        <p className="mt-2 truncate text-xs italic text-slate-500">
                          “{p.versions[0].note}”
                        </p>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}
function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

// Global app state via Zustand. The editor state and saved-prompt library are
// persisted to localStorage so the user's work survives a refresh.

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Effort, RunResult, SavedPrompt } from "./types";
import { PRESETS } from "./presets";

interface ForgeState {
  // --- editor state (persisted) ---
  system: string;
  prompt: string;
  variables: Record<string, string>;
  selectedModels: string[];
  maxTokens: number;
  thinking: boolean;
  effort: Effort;

  // --- run state (ephemeral) ---
  results: Record<string, RunResult>;
  isRunning: boolean;

  // --- library (persisted) ---
  library: SavedPrompt[];

  // --- actions ---
  setSystem: (v: string) => void;
  setPrompt: (v: string) => void;
  setVariable: (key: string, value: string) => void;
  toggleModel: (id: string) => void;
  setMaxTokens: (n: number) => void;
  setThinking: (v: boolean) => void;
  setEffort: (e: Effort) => void;

  setResult: (model: string, patch: Partial<RunResult>) => void;
  appendText: (model: string, chunk: string) => void;
  resetResults: (models: string[]) => void;
  setRunning: (v: boolean) => void;

  loadPreset: (index: number) => void;
  applyGenerated: (
    system: string,
    prompt: string,
    variables: Record<string, string>,
  ) => void;
  savePrompt: (name: string, note: string) => void;
  loadPrompt: (id: string) => void;
  deletePrompt: (id: string) => void;
}

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

export const useForge = create<ForgeState>()(
  persist(
    (set, get) => ({
      system: PRESETS[0].system,
      prompt: PRESETS[0].prompt,
      variables: { ...PRESETS[0].variables },
      selectedModels: ["claude-opus-4-8"],
      maxTokens: 1024,
      thinking: false,
      effort: "medium",

      results: {},
      isRunning: false,

      library: [],

      setSystem: (v) => set({ system: v }),
      setPrompt: (v) => set({ prompt: v }),
      setVariable: (key, value) =>
        set((s) => ({ variables: { ...s.variables, [key]: value } })),
      toggleModel: (id) =>
        set((s) => {
          const has = s.selectedModels.includes(id);
          if (has && s.selectedModels.length === 1) return s; // keep at least one
          return {
            selectedModels: has
              ? s.selectedModels.filter((m) => m !== id)
              : [...s.selectedModels, id],
          };
        }),
      setMaxTokens: (n) => set({ maxTokens: n }),
      setThinking: (v) => set({ thinking: v }),
      setEffort: (e) => set({ effort: e }),

      setResult: (model, patch) =>
        set((s) => ({
          results: {
            ...s.results,
            [model]: { ...s.results[model], ...patch, model },
          },
        })),
      appendText: (model, chunk) =>
        set((s) => {
          const prev = s.results[model];
          if (!prev) return s;
          return {
            results: {
              ...s.results,
              [model]: { ...prev, text: prev.text + chunk },
            },
          };
        }),
      resetResults: (models) =>
        set(() => ({
          results: Object.fromEntries(
            models.map((m) => [
              m,
              { model: m, status: "idle", text: "" } as RunResult,
            ]),
          ),
        })),
      setRunning: (v) => set({ isRunning: v }),

      loadPreset: (index) => {
        const p = PRESETS[index];
        if (!p) return;
        set({
          system: p.system,
          prompt: p.prompt,
          variables: { ...p.variables },
        });
      },

      applyGenerated: (system, prompt, variables) =>
        set({ system, prompt, variables: { ...variables } }),

      savePrompt: (name, note) => {
        const { system, prompt, variables, library } = get();
        const now = Date.now();
        const version = {
          id: uid(),
          system,
          prompt,
          note: note || "Saved version",
          createdAt: now,
        };
        // Update existing entry with the same name, else create a new one.
        const existing = library.find((p) => p.name === name);
        if (existing) {
          set({
            library: library.map((p) =>
              p.id === existing.id
                ? {
                    ...p,
                    system,
                    prompt,
                    variables: { ...variables },
                    versions: [version, ...p.versions].slice(0, 20),
                    updatedAt: now,
                  }
                : p,
            ),
          });
        } else {
          set({
            library: [
              {
                id: uid(),
                name,
                system,
                prompt,
                variables: { ...variables },
                versions: [version],
                updatedAt: now,
              },
              ...library,
            ],
          });
        }
      },
      loadPrompt: (id) => {
        const p = get().library.find((x) => x.id === id);
        if (!p) return;
        set({
          system: p.system,
          prompt: p.prompt,
          variables: { ...p.variables },
        });
      },
      deletePrompt: (id) =>
        set((s) => ({ library: s.library.filter((p) => p.id !== id) })),
    }),
    {
      name: "promptforge-v1",
      partialize: (s) => ({
        system: s.system,
        prompt: s.prompt,
        variables: s.variables,
        selectedModels: s.selectedModels,
        maxTokens: s.maxTokens,
        thinking: s.thinking,
        effort: s.effort,
        library: s.library,
      }),
    },
  ),
);

// Shared types used across the PromptForge app.

export type Effort = "low" | "medium" | "high";

/** A request the client sends to /api/run for a single model. */
export interface RunRequest {
  model: string;
  system: string;
  prompt: string;
  maxTokens: number;
  thinking: boolean;
  effort: Effort;
}

/** Token + cost usage returned after a run completes. */
export interface Usage {
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
}

/** The live state of one model's output column during/after a run. */
export interface RunResult {
  model: string;
  status: "idle" | "streaming" | "done" | "error";
  text: string;
  usage?: Usage;
  error?: string;
  startedAt?: number;
  finishedAt?: number;
}

/** A saved prompt in the user's local library (with version history). */
export interface SavedPrompt {
  id: string;
  name: string;
  system: string;
  prompt: string;
  variables: Record<string, string>;
  versions: PromptVersion[];
  updatedAt: number;
}

export interface PromptVersion {
  id: string;
  system: string;
  prompt: string;
  note: string;
  createdAt: number;
}

// Model catalog with pricing (USD per 1M tokens) and provider routing.
//
// PromptForge is multi-provider: Claude models go through the Anthropic API,
// and Groq's open models (Llama, Gemma) go through Groq's OpenAI-compatible API.
// Pricing + capability flags drive the cost estimator and request shaping in
// /api/run (effort + thinking are only sent to models that support them).

export type Provider = "anthropic" | "groq";

export interface ModelMeta {
  id: string;
  label: string;
  blurb: string;
  provider: Provider;
  /** USD per 1,000,000 input tokens. */
  inputPrice: number;
  /** USD per 1,000,000 output tokens. */
  outputPrice: number;
  contextTokens: number;
  maxOutputTokens: number;
  /** Supports the `output_config.effort` parameter (Anthropic only). */
  supportsEffort: boolean;
  /** Supports adaptive extended thinking (Anthropic only). */
  supportsThinking: boolean;
  /** Tailwind-friendly accent hex for this model's column + badges. */
  accent: string;
}

export const PROVIDER_LABELS: Record<Provider, string> = {
  anthropic: "Claude · Anthropic",
  groq: "Open models · Groq (free)",
};

export const MODELS: ModelMeta[] = [
  // --- Anthropic / Claude ---
  {
    id: "claude-opus-4-8",
    label: "Opus 4.8",
    blurb: "Most capable — deep reasoning & agentic work",
    provider: "anthropic",
    inputPrice: 5,
    outputPrice: 25,
    contextTokens: 1_000_000,
    maxOutputTokens: 128_000,
    supportsEffort: true,
    supportsThinking: true,
    accent: "#7c5cff",
  },
  {
    id: "claude-sonnet-4-6",
    label: "Sonnet 4.6",
    blurb: "Best balance of speed and intelligence",
    provider: "anthropic",
    inputPrice: 3,
    outputPrice: 15,
    contextTokens: 1_000_000,
    maxOutputTokens: 64_000,
    supportsEffort: true,
    supportsThinking: true,
    accent: "#54e3ff",
  },
  {
    id: "claude-haiku-4-5",
    label: "Haiku 4.5",
    blurb: "Fastest & cheapest Claude for simple tasks",
    provider: "anthropic",
    inputPrice: 1,
    outputPrice: 5,
    contextTokens: 200_000,
    maxOutputTokens: 64_000,
    supportsEffort: false,
    supportsThinking: false,
    accent: "#4ade80",
  },
  {
    id: "claude-fable-5",
    label: "Fable 5",
    blurb: "Frontier model for the hardest problems",
    provider: "anthropic",
    inputPrice: 10,
    outputPrice: 50,
    contextTokens: 1_000_000,
    maxOutputTokens: 128_000,
    supportsEffort: true,
    supportsThinking: true,
    accent: "#ff9d54",
  },

  // --- Groq / open models (free tier, great for testing) ---
  {
    id: "llama-3.3-70b-versatile",
    label: "Llama 3.3 70B",
    blurb: "Powerful open model — fast on Groq",
    provider: "groq",
    inputPrice: 0.59,
    outputPrice: 0.79,
    contextTokens: 128_000,
    maxOutputTokens: 32_768,
    supportsEffort: false,
    supportsThinking: false,
    accent: "#f97316",
  },
  {
    id: "llama-3.1-8b-instant",
    label: "Llama 3.1 8B",
    blurb: "Tiny & blazing fast — great for quick tests",
    provider: "groq",
    inputPrice: 0.05,
    outputPrice: 0.08,
    contextTokens: 128_000,
    maxOutputTokens: 8_192,
    supportsEffort: false,
    supportsThinking: false,
    accent: "#14b8a6",
  },
  {
    id: "gemma2-9b-it",
    label: "Gemma 2 9B",
    blurb: "Google's open model on Groq",
    provider: "groq",
    inputPrice: 0.2,
    outputPrice: 0.2,
    contextTokens: 8_192,
    maxOutputTokens: 8_192,
    supportsEffort: false,
    supportsThinking: false,
    accent: "#eab308",
  },
];

export const MODEL_MAP: Record<string, ModelMeta> = Object.fromEntries(
  MODELS.map((m) => [m.id, m]),
);

export function getModel(id: string): ModelMeta | undefined {
  return MODEL_MAP[id];
}

/** Estimate cost in USD for a given model and token counts. */
export function estimateCost(
  modelId: string,
  inputTokens: number,
  outputTokens: number,
): number {
  const m = MODEL_MAP[modelId];
  if (!m) return 0;
  return (
    (inputTokens / 1_000_000) * m.inputPrice +
    (outputTokens / 1_000_000) * m.outputPrice
  );
}

// Fast, client-side token *estimation* for the live meter.
//
// This is intentionally an approximation — real Claude token counts come back
// from the API in the run's `usage` and replace this estimate once a run finishes.
// The heuristic blends a character-based and a word-based estimate, which tracks
// real tokenizer output more closely than chars/4 alone across prose and code.

export function estimateTokens(text: string): number {
  if (!text) return 0;
  const chars = text.length;
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const byChars = chars / 3.8;
  const byWords = words * 1.35;
  return Math.max(1, Math.round((byChars + byWords) / 2));
}

/** Compact human-readable token count, e.g. 1,240 or 12.4k. */
export function formatTokens(n: number): string {
  if (n < 1000) return String(n);
  return `${(n / 1000).toFixed(1)}k`;
}

/** Format a USD amount with sensible precision for tiny prompt costs. */
export function formatUsd(amount: number): string {
  if (amount === 0) return "$0.00";
  if (amount < 0.01) return `$${amount.toFixed(4)}`;
  if (amount < 1) return `$${amount.toFixed(3)}`;
  return `$${amount.toFixed(2)}`;
}

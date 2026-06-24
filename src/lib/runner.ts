// Client-side orchestration: fan out the (interpolated) prompt to every selected
// model in parallel, parse each SSE stream, and push updates into the store so the
// output columns fill in live and independently.

import { useForge } from "./store";
import { useAccount } from "./account";
import { interpolate } from "./templates";
import type { Effort } from "./types";

async function streamModel(
  model: string,
  payload: {
    system: string;
    prompt: string;
    maxTokens: number;
    thinking: boolean;
    effort: Effort;
  },
) {
  const store = useForge.getState();
  store.setResult(model, { status: "streaming", startedAt: Date.now(), text: "" });

  try {
    const res = await fetch("/api/run", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ model, ...payload }),
    });

    if (!res.ok || !res.body) {
      const detail = await res.json().catch(() => ({}));
      // Surface the paywall: 401 = not signed in, 402 = out of credits.
      if (res.status === 401) useAccount.getState().openAuth();
      if (res.status === 402) useAccount.getState().openPricing();
      throw new Error(detail.error || `Request failed (${res.status})`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      // Parse complete SSE frames (separated by a blank line).
      const frames = buffer.split("\n\n");
      buffer = frames.pop() ?? "";

      for (const frame of frames) {
        const lines = frame.split("\n");
        const eventLine = lines.find((l) => l.startsWith("event:"));
        const dataLine = lines.find((l) => l.startsWith("data:"));
        if (!eventLine || !dataLine) continue;

        const event = eventLine.slice(6).trim();
        const data = JSON.parse(dataLine.slice(5).trim());

        if (event === "delta") {
          useForge.getState().appendText(model, data.text);
        } else if (event === "usage") {
          useForge.getState().setResult(model, {
            usage: {
              inputTokens: data.inputTokens,
              outputTokens: data.outputTokens,
              costUsd: data.costUsd,
            },
          });
        } else if (event === "done") {
          useForge.getState().setResult(model, {
            status: "done",
            finishedAt: Date.now(),
          });
        } else if (event === "error") {
          useForge.getState().setResult(model, {
            status: "error",
            error: data.message,
            finishedAt: Date.now(),
          });
        }
      }
    }
  } catch (err) {
    useForge.getState().setResult(model, {
      status: "error",
      error: err instanceof Error ? err.message : "Network error",
      finishedAt: Date.now(),
    });
  }
}

/** Run the current editor state across all selected models. */
export async function runAll() {
  const s = useForge.getState();
  if (s.isRunning) return;

  const models = s.selectedModels;
  const payload = {
    system: interpolate(s.system, s.variables),
    prompt: interpolate(s.prompt, s.variables),
    maxTokens: s.maxTokens,
    thinking: s.thinking,
    effort: s.effort,
  };

  s.resetResults(models);
  s.setRunning(true);

  await Promise.all(models.map((m) => streamModel(m, payload)));

  useForge.getState().setRunning(false);
  // Sync the credit balance after spending.
  useAccount.getState().refresh();
}

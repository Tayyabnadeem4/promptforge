// Streaming endpoint: takes one model + prompt, streams the response back to the
// browser as Server-Sent Events, then emits a final `usage` event with real token
// counts and computed cost. Routes to Anthropic (Claude) or Groq (open models)
// based on the model's provider. API keys live only here, server-side.

import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";
import { getModel, estimateCost } from "@/lib/models";
import { GROQ_URL } from "@/lib/groq";
import { getSessionUser } from "@/lib/server/auth";
import { consumeCredits } from "@/lib/server/db";
import { COST } from "@/lib/plans";
import type { RunRequest } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const encoder = new TextEncoder();

function sse(event: string, data: unknown): Uint8Array {
  return encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

function errorResponse(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export async function POST(req: NextRequest) {
  // Require a signed-in user…
  const user = getSessionUser(req);
  if (!user) {
    return errorResponse("Please sign in to run prompts.", 401);
  }

  let body: RunRequest;
  try {
    body = (await req.json()) as RunRequest;
  } catch {
    return errorResponse("Invalid JSON body.", 400);
  }

  const meta = getModel(body.model);
  if (!meta) return errorResponse(`Unknown model: ${body.model}`, 400);

  // …and spend a credit before doing any work (atomic; blocks at 0).
  const balance = consumeCredits(user.id, COST.run, "run");
  if (balance === null) {
    return errorResponse("Out of credits — upgrade your plan to keep going.", 402);
  }

  const maxTokens = Math.min(
    Math.max(body.maxTokens || 1024, 1),
    meta.maxOutputTokens,
  );

  // --- Groq (open models) ---
  if (meta.provider === "groq") {
    const groqKey = process.env.GROQ_API_KEY;
    if (!groqKey) {
      return errorResponse(
        "No GROQ_API_KEY found. Add it to .env.local to use the open models.",
        500,
      );
    }
    return streamGroq(body, maxTokens, groqKey);
  }

  // --- Anthropic (Claude) ---
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return errorResponse(
      "No ANTHROPIC_API_KEY found. Add it to .env.local to use Claude models.",
      500,
    );
  }
  return streamAnthropic(body, maxTokens, apiKey);
}

// ---------------------------------------------------------------------------
// Anthropic streaming
// ---------------------------------------------------------------------------
function streamAnthropic(body: RunRequest, maxTokens: number, apiKey: string) {
  const meta = getModel(body.model)!;
  const client = new Anthropic({ apiKey });

  const params: Record<string, unknown> = {
    model: body.model,
    max_tokens: maxTokens,
    messages: [{ role: "user", content: body.prompt }],
  };
  if (body.system.trim()) params.system = body.system;
  if (meta.supportsThinking && body.thinking) {
    params.thinking = { type: "adaptive", display: "summarized" };
  }
  if (meta.supportsEffort) params.output_config = { effort: body.effort };

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const run = client.messages.stream(
          params as unknown as Anthropic.MessageStreamParams,
        );
        for await (const event of run) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(sse("delta", { text: event.delta.text }));
          } else if (
            event.type === "content_block_delta" &&
            event.delta.type === "thinking_delta"
          ) {
            controller.enqueue(sse("thinking", { text: event.delta.thinking }));
          }
        }
        const final = await run.finalMessage();
        const inputTokens = final.usage.input_tokens ?? 0;
        const outputTokens = final.usage.output_tokens ?? 0;
        controller.enqueue(
          sse("usage", {
            inputTokens,
            outputTokens,
            costUsd: estimateCost(body.model, inputTokens, outputTokens),
          }),
        );
        controller.enqueue(sse("done", {}));
      } catch (err) {
        controller.enqueue(
          sse("error", {
            message: err instanceof Error ? err.message : "Streaming error.",
          }),
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, { headers: sseHeaders() });
}

// ---------------------------------------------------------------------------
// Groq streaming (OpenAI-compatible SSE)
// ---------------------------------------------------------------------------
function streamGroq(body: RunRequest, maxTokens: number, apiKey: string) {
  const messages = [
    ...(body.system.trim()
      ? [{ role: "system", content: body.system }]
      : []),
    { role: "user", content: body.prompt },
  ];

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const res = await fetch(GROQ_URL, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: body.model,
            max_tokens: maxTokens,
            stream: true,
            stream_options: { include_usage: true },
            messages,
          }),
        });

        if (!res.ok || !res.body) {
          const detail = await res.text();
          controller.enqueue(
            sse("error", { message: `${res.status} ${detail}` }),
          );
          controller.close();
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let inputTokens = 0;
        let outputTokens = 0;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;
            const payload = trimmed.slice(5).trim();
            if (payload === "[DONE]") continue;
            try {
              const json = JSON.parse(payload);
              const delta = json.choices?.[0]?.delta?.content;
              if (delta) controller.enqueue(sse("delta", { text: delta }));
              if (json.usage) {
                inputTokens = json.usage.prompt_tokens ?? inputTokens;
                outputTokens = json.usage.completion_tokens ?? outputTokens;
              }
            } catch {
              // ignore partial/non-JSON keepalive lines
            }
          }
        }

        controller.enqueue(
          sse("usage", {
            inputTokens,
            outputTokens,
            costUsd: estimateCost(body.model, inputTokens, outputTokens),
          }),
        );
        controller.enqueue(sse("done", {}));
      } catch (err) {
        controller.enqueue(
          sse("error", {
            message: err instanceof Error ? err.message : "Groq streaming error.",
          }),
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, { headers: sseHeaders() });
}

function sseHeaders() {
  return {
    "content-type": "text/event-stream; charset=utf-8",
    "cache-control": "no-cache, no-transform",
    connection: "keep-alive",
  };
}

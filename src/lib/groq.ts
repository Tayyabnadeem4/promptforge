// Server-side helpers for Groq's OpenAI-compatible API.
// Used by /api/run (streaming) and /api/enhance (JSON generation).

export const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

export interface GroqMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/** A non-streaming Groq chat completion that returns the message text. */
export async function groqComplete(opts: {
  apiKey: string;
  model: string;
  messages: GroqMessage[];
  maxTokens: number;
  jsonMode?: boolean;
}): Promise<string> {
  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${opts.apiKey}`,
    },
    body: JSON.stringify({
      model: opts.model,
      max_tokens: opts.maxTokens,
      messages: opts.messages,
      ...(opts.jsonMode ? { response_format: { type: "json_object" } } : {}),
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Groq error (${res.status}): ${detail}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

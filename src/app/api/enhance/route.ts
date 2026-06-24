// AI Prompt Engineer endpoint. Takes a plain-English description (a paragraph)
// and produces a structured, production-grade prompt using prompt-engineering
// best practices: explicit Role, Task, Context, Requirements, Constraints, and
// Output format sections, with {{variables}} for reusable inputs. It also returns
// the technique used and a few tips — so it both *generates* and *explains/fixes*
// prompts, Promptheus-style. Works with Anthropic (structured outputs) or Groq.

import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";
import { groqComplete } from "@/lib/groq";
import { getSessionUser } from "@/lib/server/auth";
import { consumeCredits } from "@/lib/server/db";
import { COST } from "@/lib/plans";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface EnhanceBody {
  mode: "generate" | "enhance";
  idea?: string;
  currentSystem?: string;
  currentPrompt?: string;
  format?: string; // auto | json | markdown | bullets | steps | plain
  structure?: string; // detailed | concise | cot | fewshot
}

const SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string", description: "A short 2-4 word name for this prompt" },
    system: {
      type: "string",
      description: "A concise role/system prompt (1-3 sentences)",
    },
    prompt: {
      type: "string",
      description:
        "The structured user-prompt template with markdown section headings and {{variables}}",
    },
    variables: {
      type: "array",
      description: "One realistic example value per {{variable}} used",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          example: { type: "string" },
        },
        required: ["name", "example"],
        additionalProperties: false,
      },
    },
    technique: {
      type: "string",
      description: "A 1-3 word label for the approach used",
    },
    tips: {
      type: "array",
      description: "2-4 short, specific tips on what was engineered / how to improve",
      items: { type: "string" },
    },
  },
  required: ["title", "system", "prompt", "variables", "technique", "tips"],
  additionalProperties: false,
};

const SYSTEM_PROMPT = `You are an elite prompt engineer — a senior specialist who turns rough requests into precise, production-grade prompts that get reliable results from large language models.

You always apply prompt-engineering best practices:
- Assign a clear ROLE / persona.
- State the OBJECTIVE / task explicitly.
- Provide relevant CONTEXT.
- List concrete REQUIREMENTS (what must be done) and CONSTRAINTS (what to avoid / limits).
- Specify the exact OUTPUT FORMAT.
- Use {{double_brace}} placeholders for any input the user will change.

You write prompts that are specific, unambiguous, and easy to evaluate. No filler, no vague instructions.`;

const FORMAT_HINTS: Record<string, string> = {
  auto: "Choose the most appropriate output format for the task.",
  json: "Require the model to respond ONLY with valid JSON (define the fields).",
  markdown: "Require well-structured markdown output.",
  bullets: "Require the output as concise bullet points.",
  steps: "Require the output as a numbered, step-by-step list.",
  plain: "Require plain prose with no markdown formatting.",
};

const STRUCTURE_HINTS: Record<string, string> = {
  detailed:
    "Use full, clearly-labelled markdown sections (# Role, # Task, # Context, # Requirements, # Constraints, # Output format).",
  concise:
    "Keep it compact but still structured — short labelled sections, minimal prose.",
  cot: "Include an instruction telling the model to reason step by step before giving the final answer.",
  fewshot:
    "Include a '# Examples' section with 1-2 short example input/output pairs that demonstrate the desired result.",
};

function buildUserMessage(body: EnhanceBody): string {
  const format = FORMAT_HINTS[body.format ?? "auto"] ?? FORMAT_HINTS.auto;
  const structure =
    STRUCTURE_HINTS[body.structure ?? "detailed"] ?? STRUCTURE_HINTS.detailed;

  const guidance = `
GUIDELINES:
- Structure: ${structure}
- Output format: ${format}
- Use {{double_brace}} placeholders for reusable inputs (prefer 2-6 variables).
- "system" = a concise role/system prompt (1-3 sentences).
- "prompt" = the structured user-prompt template with markdown section headings.
- "variables" = one realistic example value per placeholder.
- "technique" = a 1-3 word label for the approach.
- "tips" = 2-4 short, specific notes on what you engineered or how to improve results.`;

  if (body.mode === "enhance") {
    return `Improve and restructure the following prompt using prompt-engineering best practices. Preserve its intent, reorganise it into clear sections, tighten the wording, keep existing {{variables}} and add useful new ones. In "tips", explain what you changed and why.

SYSTEM PROMPT:
${body.currentSystem || "(empty)"}

USER PROMPT:
${body.currentPrompt || "(empty)"}
${guidance}`;
  }

  return `Turn the following request into a high-quality, reusable, structured prompt.

REQUEST:
"${body.idea || ""}"
${guidance}`;
}

export async function POST(req: NextRequest) {
  const user = getSessionUser(req);
  if (!user) {
    return json({ error: "Please sign in to generate prompts." }, 401);
  }

  let body: EnhanceBody;
  try {
    body = (await req.json()) as EnhanceBody;
  } catch {
    return json({ error: "Invalid JSON body." }, 400);
  }

  if (consumeCredits(user.id, COST.generate, "generate") === null) {
    return json(
      { error: "Out of credits — upgrade your plan to keep going." },
      402,
    );
  }

  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;
  const userMessage = buildUserMessage(body);

  try {
    if (anthropicKey) {
      const client = new Anthropic({ apiKey: anthropicKey });
      const message = await client.messages.create({
        model: "claude-opus-4-8",
        max_tokens: 3000,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userMessage }],
        output_config: { format: { type: "json_schema", schema: SCHEMA } },
      } as unknown as Anthropic.MessageCreateParamsNonStreaming);
      const block = message.content.find((b) => b.type === "text");
      const raw = block && "text" in block ? block.text : "{}";
      return json(JSON.parse(raw), 200);
    }

    if (groqKey) {
      const raw = await groqComplete({
        apiKey: groqKey,
        model: "llama-3.3-70b-versatile",
        maxTokens: 3000,
        jsonMode: true,
        messages: [
          {
            role: "system",
            content:
              SYSTEM_PROMPT +
              ` Respond ONLY with a JSON object of this exact shape: {"title": string, "system": string, "prompt": string, "variables": [{"name": string, "example": string}], "technique": string, "tips": [string]}. No prose, no code fences.`,
          },
          { role: "user", content: userMessage },
        ],
      });
      return json(JSON.parse(raw), 200);
    }

    return json(
      { error: "No API key found. Add ANTHROPIC_API_KEY or GROQ_API_KEY to .env.local." },
      500,
    );
  } catch (err) {
    return json(
      { error: err instanceof Error ? err.message : "Failed to generate prompt." },
      500,
    );
  }
}

function json(data: unknown, status: number) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });
}

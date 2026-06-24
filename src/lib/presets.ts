// Starter prompts so the playground is useful the moment it loads.

export interface Preset {
  name: string;
  system: string;
  prompt: string;
  variables: Record<string, string>;
}

export const PRESETS: Preset[] = [
  {
    name: "Product description writer",
    system:
      "You are a senior e-commerce copywriter. Write punchy, benefit-led product copy. No fluff, no clichés.",
    prompt:
      "Write a {{tone}} product description for: {{product}}.\nTarget audience: {{audience}}.\nKeep it under 60 words.",
    variables: {
      tone: "playful",
      product: "a reusable stainless-steel water bottle",
      audience: "eco-conscious gym-goers",
    },
  },
  {
    name: "Code explainer",
    system:
      "You are a patient staff engineer who explains code to junior developers clearly and concisely.",
    prompt:
      "Explain what this {{language}} snippet does, step by step:\n\n```\n{{code}}\n```",
    variables: {
      language: "JavaScript",
      code: "const sum = arr => arr.reduce((a, b) => a + b, 0);",
    },
  },
  {
    name: "JSON data extractor",
    system:
      "You extract structured data. Respond ONLY with valid minified JSON, no prose, no code fences.",
    prompt:
      'Extract name, email, and intent from this message as JSON:\n\n"{{message}}"',
    variables: {
      message:
        "Hi, I'm Ayesha (ayesha@mail.com) — keen to book a demo of your enterprise plan.",
    },
  },
  {
    name: "Cold outreach email",
    system:
      "You are a top B2B sales copywriter. Write short, personalized cold emails that earn replies. No buzzwords, no fake flattery.",
    prompt:
      "Write a cold email to a {{role}} at a {{company_type}}.\nWhat we offer: {{offer}}.\nGoal: {{goal}}.\nKeep it under 90 words with a clear call to action.",
    variables: {
      role: "Head of Marketing",
      company_type: "mid-size SaaS company",
      offer: "an AI tool that writes and tests ad copy",
      goal: "book a 15-minute demo",
    },
  },
  {
    name: "Social media post",
    system:
      "You are a social media strategist who writes scroll-stopping posts tailored to each platform's culture.",
    prompt:
      "Write a {{platform}} post about {{topic}}.\nTone: {{tone}}.\nInclude a hook in the first line and a relevant call to action.",
    variables: {
      platform: "LinkedIn",
      topic: "why most AI side-projects fail",
      tone: "bold",
    },
  },
  {
    name: "Study tutor",
    system:
      "You are a patient tutor. Explain concepts simply, use analogies, and check understanding with a question at the end.",
    prompt:
      "Explain {{topic}} to a {{level}} learner.\nUse a real-world analogy and keep it under 150 words.",
    variables: {
      topic: "how neural networks learn",
      level: "beginner",
    },
  },
  {
    name: "Text summarizer",
    system:
      "You are a precise summarizer. Capture the key points faithfully without adding opinions.",
    prompt:
      "Summarize the following text as {{format}}:\n\n{{text}}",
    variables: {
      format: "3 bullet points",
      text: "Paste any article or notes here…",
    },
  },
];

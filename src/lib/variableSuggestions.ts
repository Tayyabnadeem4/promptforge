// Example-value suggestions for common variable names, shown as clickable chips
// under each variable input so users know what kind of value to put.

const DICTIONARY: Record<string, string[]> = {
  tone: ["playful", "professional", "witty", "luxury", "bold", "friendly", "urgent"],
  style: ["minimal", "detailed", "conversational", "formal", "poetic", "technical"],
  audience: [
    "busy professionals",
    "Gen-Z shoppers",
    "developers",
    "small business owners",
    "students",
  ],
  language: ["English", "Urdu", "Spanish", "French", "German", "Arabic"],
  format: ["bullet points", "JSON", "markdown table", "short paragraph", "numbered steps"],
  length: ["one sentence", "under 50 words", "2-3 sentences", "a short paragraph"],
  product: [
    "a wireless earbud",
    "a productivity app",
    "an online course",
    "a coffee subscription",
  ],
  topic: ["climate change", "personal finance", "machine learning", "healthy cooking"],
  role: ["teacher", "recruiter", "therapist", "comedian", "startup founder"],
  sentiment: ["positive", "negative", "neutral", "mixed"],
  level: ["beginner", "intermediate", "advanced", "expert"],
  platform: ["Twitter/X", "LinkedIn", "Instagram", "TikTok", "email"],
};

// Map a variable name (possibly a longer phrase) to the closest dictionary key.
const ALIASES: Record<string, string> = {
  reader: "audience",
  target: "audience",
  user: "audience",
  voice: "tone",
  mood: "tone",
  output: "format",
  subject: "topic",
  theme: "topic",
  persona: "role",
  job: "role",
  lang: "language",
  difficulty: "level",
  channel: "platform",
  item: "product",
  words: "length",
  count: "length",
};

export function getSuggestions(name: string): string[] {
  const key = name.toLowerCase();
  if (DICTIONARY[key]) return DICTIONARY[key];
  for (const alias in ALIASES) {
    if (key.includes(alias)) return DICTIONARY[ALIASES[alias]];
  }
  for (const dictKey in DICTIONARY) {
    if (key.includes(dictKey)) return DICTIONARY[dictKey];
  }
  return [];
}

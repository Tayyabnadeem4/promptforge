// Plan definitions + credit costs. Safe to import from both client and server
// (no server-only dependencies here).

export interface Plan {
  id: "free" | "pro" | "max";
  name: string;
  price: number; // USD / month (simulated)
  credits: number; // credits granted on this plan
  tagline: string;
  features: string[];
  accent: string;
  popular?: boolean;
}

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    credits: 20,
    tagline: "Kick the tyres",
    features: [
      "20 starter credits",
      "All open (Groq) models",
      "Prompt library & versioning",
    ],
    accent: "#64748b",
  },
  {
    id: "pro",
    name: "Pro",
    price: 9,
    credits: 200,
    tagline: "For serious prompting",
    features: [
      "200 credits",
      "Claude + Groq models",
      "Side-by-side comparison",
      "AI Prompt Builder",
    ],
    accent: "#7c5cff",
    popular: true,
  },
  {
    id: "max",
    name: "Max",
    price: 29,
    credits: 1000,
    tagline: "Go (almost) unlimited",
    features: [
      "1,000 credits",
      "Everything in Pro",
      "Bulk model comparison",
      "Early access to new features",
    ],
    accent: "#ff9d54",
  },
];

/** Credits new accounts start with. */
export const STARTING_CREDITS = 20;

/** Credit cost per action. */
export const COST = {
  run: 1, // per model run
  generate: 1, // per AI Prompt Builder generation
};

export function getPlan(id: string): Plan | undefined {
  return PLANS.find((p) => p.id === id);
}

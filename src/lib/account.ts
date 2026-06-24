// Client-side account/session state. Talks to the auth + billing API routes and
// keeps the current user (email, credits, plan) in sync. Also owns the open/close
// state for the auth and pricing modals so any component can trigger the paywall.

import { create } from "zustand";
import type { PublicUser } from "@/lib/server/db";
import { toast } from "@/lib/toast";
import { getPlan } from "@/lib/plans";

interface AccountState {
  user: PublicUser | null;
  ready: boolean; // has the initial /me check completed?
  authOpen: boolean;
  pricingOpen: boolean;

  refresh: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  upgrade: (planId: string) => Promise<void>;

  openAuth: () => void;
  closeAuth: () => void;
  openPricing: () => void;
  closePricing: () => void;
}

async function postJson(url: string, body?: unknown) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

export const useAccount = create<AccountState>((set, get) => ({
  user: null,
  ready: false,
  authOpen: false,
  pricingOpen: false,

  refresh: async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      set({ user: data.user ?? null, ready: true });
    } catch {
      set({ ready: true });
    }
  },

  login: async (email, password) => {
    const data = await postJson("/api/auth/login", { email, password });
    set({ user: data.user, authOpen: false });
    toast("Signed in — welcome back!", "success");
  },

  signup: async (email, password) => {
    const data = await postJson("/api/auth/signup", { email, password });
    set({ user: data.user, authOpen: false });
    toast("Account created — 20 credits added 🎉", "success");
  },

  logout: async () => {
    await postJson("/api/auth/logout");
    set({ user: null });
    toast("Signed out", "info");
  },

  upgrade: async (planId) => {
    const data = await postJson("/api/billing/upgrade", { planId });
    set({ user: data.user, pricingOpen: false });
    const plan = getPlan(planId);
    toast(
      plan ? `Welcome to ${plan.name} — +${plan.credits} credits!` : "Plan upgraded!",
      "success",
    );
  },

  openAuth: () => set({ authOpen: true }),
  closeAuth: () => set({ authOpen: false }),
  openPricing: () => {
    // Logged-out users must authenticate before they can buy.
    if (!get().user) set({ authOpen: true });
    else set({ pricingOpen: true });
  },
  closePricing: () => set({ pricingOpen: false }),
}));

// Simulated checkout. In a real app this would be a Stripe webhook confirming
// payment; here, choosing a plan instantly grants its credits. Server-side and
// session-gated so the balance still can't be forged from the client.

import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/server/auth";
import { grantPlan, publicUser } from "@/lib/server/db";
import { getPlan } from "@/lib/plans";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const user = getSessionUser(req);
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const { planId } = await req.json().catch(() => ({}));
  const plan = getPlan(planId);
  if (!plan || plan.id === "free") {
    return NextResponse.json({ error: "Invalid plan." }, { status: 400 });
  }

  const updated = grantPlan(user.id, plan.id, plan.credits);
  if (!updated) {
    return NextResponse.json({ error: "Account not found." }, { status: 404 });
  }

  return NextResponse.json({ user: publicUser(updated) });
}

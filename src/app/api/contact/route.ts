// Contact form endpoint. In a real app this would send an email or open a ticket;
// here it validates and acknowledges (and logs server-side) so the form is real.

import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { name, email, message } = await req.json().catch(() => ({}));

  if (
    typeof name !== "string" ||
    !name.trim() ||
    typeof email !== "string" ||
    !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) ||
    typeof message !== "string" ||
    message.trim().length < 5
  ) {
    return NextResponse.json(
      { error: "Please fill in your name, a valid email, and a message." },
      { status: 400 },
    );
  }

  // eslint-disable-next-line no-console
  console.log(`[contact] ${name} <${email}>: ${message}`);
  return NextResponse.json({ ok: true });
}

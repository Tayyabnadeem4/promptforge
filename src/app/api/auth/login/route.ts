import { NextRequest, NextResponse } from "next/server";
import {
  verifyPassword,
  signSession,
  COOKIE_NAME,
  COOKIE_MAX_AGE,
} from "@/lib/server/auth";
import { getUserByEmail, publicUser } from "@/lib/server/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json().catch(() => ({}));

  if (typeof email !== "string" || typeof password !== "string") {
    return NextResponse.json({ error: "Missing credentials." }, { status: 400 });
  }

  const user = getUserByEmail(email);
  if (!user || !verifyPassword(password, user.salt, user.hash)) {
    return NextResponse.json(
      { error: "Incorrect email or password." },
      { status: 401 },
    );
  }

  const res = NextResponse.json({ user: publicUser(user) });
  res.cookies.set(COOKIE_NAME, signSession(user.id), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
  return res;
}

import { NextRequest, NextResponse } from "next/server";
import {
  hashPassword,
  signSession,
  COOKIE_NAME,
  COOKIE_MAX_AGE,
} from "@/lib/server/auth";
import { createUser, getUserByEmail, publicUser } from "@/lib/server/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export async function POST(req: NextRequest) {
  const { email, password } = await req.json().catch(() => ({}));

  if (typeof email !== "string" || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
  }
  if (typeof password !== "string" || password.length < 6) {
    return NextResponse.json(
      { error: "Password must be at least 6 characters." },
      { status: 400 },
    );
  }
  if (getUserByEmail(email)) {
    return NextResponse.json(
      { error: "An account with that email already exists." },
      { status: 409 },
    );
  }

  const { salt, hash } = hashPassword(password);
  const user = createUser(email, salt, hash);

  const res = NextResponse.json({ user: publicUser(user) });
  res.cookies.set(COOKIE_NAME, signSession(user.id), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
  return res;
}

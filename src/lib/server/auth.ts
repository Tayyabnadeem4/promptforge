// Self-contained auth helpers — password hashing (scrypt) and signed session
// cookies (HMAC), using only Node's built-in crypto. No external auth library,
// no native dependencies.

import {
  scryptSync,
  randomBytes,
  timingSafeEqual,
  createHmac,
} from "crypto";
import type { NextRequest } from "next/server";
import { getUserById, type User } from "./db";

const SECRET =
  process.env.AUTH_SECRET || "dev-insecure-secret-please-set-AUTH_SECRET";

export const COOKIE_NAME = "pf_session";
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

// --- Passwords ---
export function hashPassword(password: string): { salt: string; hash: string } {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return { salt, hash };
}

export function verifyPassword(
  password: string,
  salt: string,
  hash: string,
): boolean {
  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return (
    candidate.length === expected.length &&
    timingSafeEqual(candidate, expected)
  );
}

// --- Session tokens (payload.signature) ---
function b64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function sign(payload: string): string {
  return b64url(createHmac("sha256", SECRET).update(payload).digest());
}

export function signSession(userId: string): string {
  const payload = b64url(JSON.stringify({ uid: userId, iat: Date.now() }));
  return `${payload}.${sign(payload)}`;
}

export function verifySession(token: string | undefined): string | null {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = sign(payload);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64").toString());
    return typeof data.uid === "string" ? data.uid : null;
  } catch {
    return null;
  }
}

/** Resolve the logged-in user from a request's session cookie, or null. */
export function getSessionUser(req: NextRequest): User | null {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const uid = verifySession(token);
  if (!uid) return null;
  return getUserById(uid) ?? null;
}

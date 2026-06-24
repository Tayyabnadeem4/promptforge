// Minimal server-side user store backed by a JSON file. Single-process, good for
// local dev and demos. For production you'd swap this for a real database
// (Postgres, Upstash, etc.) behind the same function signatures.
//
// All reads/writes are synchronous and happen on Node's single thread, so
// consumeCredits() is effectively atomic — no two parallel requests can
// double-spend the same credit.

import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { STARTING_CREDITS } from "@/lib/plans";

export interface User {
  id: string;
  email: string;
  salt: string;
  hash: string;
  credits: number;
  plan: "free" | "pro" | "max";
  createdAt: number;
  runs: number;
  generations: number;
  creditsSpent: number;
}

export interface PublicUser {
  email: string;
  credits: number;
  plan: "free" | "pro" | "max";
  createdAt: number;
  runs: number;
  generations: number;
  creditsSpent: number;
}

interface DB {
  users: User[];
}

const DATA_DIR = path.join(process.cwd(), ".data");
const DB_FILE = path.join(DATA_DIR, "db.json");

let db: DB | null = null;

function load(): DB {
  if (db) return db;
  try {
    db = JSON.parse(fs.readFileSync(DB_FILE, "utf8")) as DB;
  } catch {
    db = { users: [] };
  }
  return db;
}

function persist() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

export function getUserByEmail(email: string): User | undefined {
  return load().users.find((u) => u.email === email.toLowerCase());
}

export function getUserById(id: string): User | undefined {
  return load().users.find((u) => u.id === id);
}

export function createUser(
  email: string,
  salt: string,
  hash: string,
): User {
  const user: User = {
    id: randomUUID(),
    email: email.toLowerCase(),
    salt,
    hash,
    credits: STARTING_CREDITS,
    plan: "free",
    createdAt: Date.now(),
    runs: 0,
    generations: 0,
    creditsSpent: 0,
  };
  load().users.push(user);
  persist();
  return user;
}

/**
 * Atomically spend credits and record the usage. Returns the new balance, or
 * null if insufficient. `kind` drives the per-action counters shown on the
 * dashboard.
 */
export function consumeCredits(
  id: string,
  amount: number,
  kind: "run" | "generate",
): number | null {
  const user = getUserById(id);
  if (!user) return null;
  if (user.credits < amount) return null;
  user.credits -= amount;
  user.creditsSpent = (user.creditsSpent ?? 0) + amount;
  if (kind === "run") user.runs = (user.runs ?? 0) + 1;
  else user.generations = (user.generations ?? 0) + 1;
  persist();
  return user.credits;
}

/** Grant credits and (optionally) change the plan — used by the upgrade flow. */
export function grantPlan(id: string, plan: User["plan"], credits: number): User | null {
  const user = getUserById(id);
  if (!user) return null;
  user.plan = plan;
  user.credits += credits;
  persist();
  return user;
}

export function publicUser(u: User): PublicUser {
  return {
    email: u.email,
    credits: u.credits,
    plan: u.plan,
    createdAt: u.createdAt,
    runs: u.runs ?? 0,
    generations: u.generations ?? 0,
    creditsSpent: u.creditsSpent ?? 0,
  };
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAccount } from "@/lib/account";

const LINKS = [
  { href: "/#features", label: "Features" },
  { href: "/#how", label: "How it works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Contact" },
];

export default function SiteNav() {
  const user = useAccount((s) => s.user);
  const ready = useAccount((s) => s.ready);
  const refresh = useAccount((s) => s.refresh);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    refresh();
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [refresh]);

  return (
    <header
      className={`sticky top-0 z-40 transition-colors ${
        scrolled
          ? "border-b border-white/5 bg-ink-900/80 backdrop-blur-xl"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-brand to-forge-cyan shadow-glow-sm">
            <AnvilIcon />
          </span>
          <span className="text-lg font-bold tracking-tight">
            <span className="gradient-text">Prompt</span>
            <span className="text-slate-100">Forge</span>
          </span>
        </Link>

        <div className="hidden items-center gap-7 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-slate-400 transition hover:text-white"
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {ready && user ? (
            <Link
              href="/dashboard"
              className="rounded-lg bg-gradient-to-r from-brand to-forge-cyan px-4 py-2 text-sm font-semibold text-white shadow-glow-sm"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition hover:text-white sm:block"
              >
                Sign in
              </Link>
              <motion.div whileHover={{ y: -1 }}>
                <Link
                  href="/login?mode=signup"
                  className="rounded-lg bg-gradient-to-r from-brand to-forge-cyan px-4 py-2 text-sm font-semibold text-white shadow-glow-sm"
                >
                  Get started
                </Link>
              </motion.div>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

function AnvilIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9h13a4 4 0 0 0 4-4M7 9v2a5 5 0 0 0 5 5h0M8 21h8M10 16l-1 5M14 16l1 5" />
    </svg>
  );
}

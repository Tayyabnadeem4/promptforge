"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useAccount } from "@/lib/account";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: GridIcon },
  { href: "/playground", label: "Playground", icon: PlayIcon },
  { href: "/pricing", label: "Plans & pricing", icon: TagIcon },
  { href: "/contact", label: "Contact", icon: MailIcon },
];

export default function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <>
      {/* mobile scrim */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-white/10 bg-ink-800/95 backdrop-blur-xl transition-transform duration-300 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent onNavigate={onClose} />
      </aside>
    </>
  );
}

function SidebarContent({ onNavigate }: { onNavigate: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAccount((s) => s.user);
  const logout = useAccount((s) => s.logout);
  const openPricing = useAccount((s) => s.openPricing);

  const planCredits = user?.plan === "max" ? 1000 : user?.plan === "pro" ? 200 : 20;
  const pct = user ? Math.min(100, Math.round((user.credits / planCredits) * 100)) : 0;

  const signOut = async () => {
    await logout();
    router.push("/");
  };

  return (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <Link
        href="/"
        className="flex items-center gap-2.5 border-b border-white/5 px-5 py-4"
      >
        <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-brand to-forge-cyan shadow-glow-sm">
          <AnvilIcon />
        </span>
        <span className="text-lg font-bold">
          <span className="gradient-text">Prompt</span>
          <span className="text-slate-100">Forge</span>
        </span>
      </Link>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
          Menu
        </p>
        {NAV.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                active
                  ? "bg-brand/15 text-white"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="nav-active"
                  className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-brand to-forge-cyan"
                />
              )}
              <Icon active={active} />
              {item.label}
            </Link>
          );
        })}

        {/* Credits widget */}
        <div className="mt-4 rounded-xl border border-white/5 bg-ink-900/50 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs text-slate-400">Credits</span>
            <span className="font-mono text-sm text-slate-100">
              {user?.credits ?? 0}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-ink-900">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.6 }}
              className="h-full rounded-full bg-gradient-to-r from-brand to-forge-cyan"
            />
          </div>
          <button
            onClick={() => {
              onNavigate();
              openPricing();
            }}
            className="mt-3 w-full rounded-lg bg-gradient-to-r from-brand to-forge-cyan py-2 text-xs font-semibold text-white"
          >
            Buy more credits
          </button>
        </div>
      </nav>

      {/* Account block — logout separated from nav (destructive-nav-separation) */}
      <div className="border-t border-white/5 p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink-600 text-sm font-semibold uppercase text-brand-glow ring-1 ring-white/10">
            {user?.email?.[0] ?? "?"}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm text-slate-100">{user?.email}</p>
            <p className="text-xs capitalize text-slate-500">{user?.plan} plan</p>
          </div>
        </div>
        <button
          onClick={signOut}
          className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-forge-pink/15 hover:text-forge-pink"
        >
          <LogOutIcon />
          Sign out
        </button>
      </div>
    </div>
  );
}

/* ---- icons (consistent 1.8 stroke, currentColor) ---- */
type IconProps = { active?: boolean };
const base = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function GridIcon(_: IconProps) {
  return (
    <svg {...base}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}
function PlayIcon(_: IconProps) {
  return (
    <svg {...base}>
      <path d="M6 4.5v15l13-7.5z" />
    </svg>
  );
}
function TagIcon(_: IconProps) {
  return (
    <svg {...base}>
      <path d="M3 7.5v5l8.5 8.5a2 2 0 0 0 2.8 0l5.2-5.2a2 2 0 0 0 0-2.8L11 4.5H6a3 3 0 0 0-3 3Z" />
      <circle cx="7.5" cy="8" r="1.2" />
    </svg>
  );
}
function MailIcon(_: IconProps) {
  return (
    <svg {...base}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}
function LogOutIcon() {
  return (
    <svg {...base}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
    </svg>
  );
}
function AnvilIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9h13a4 4 0 0 0 4-4M7 9v2a5 5 0 0 0 5 5h0M8 21h8M10 16l-1 5M14 16l1 5" />
    </svg>
  );
}

import Link from "next/link";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { href: "/#features", label: "Features" },
      { href: "/pricing", label: "Pricing" },
      { href: "/playground", label: "Playground" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/#about", label: "About" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/login", label: "Sign in" },
      { href: "/login?mode=signup", label: "Create account" },
      { href: "/dashboard", label: "Dashboard" },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="border-t border-white/5 bg-ink-900/50">
      <div className="mx-auto max-w-6xl px-5 py-12">
        <div className="grid gap-8 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-brand to-forge-cyan">
                <span className="text-sm">⚒️</span>
              </span>
              <span className="text-lg font-bold">
                <span className="gradient-text">Prompt</span>
                <span className="text-slate-100">Forge</span>
              </span>
            </div>
            <p className="mt-3 max-w-xs text-sm text-slate-500">
              The AI prompt IDE — engineer, test, and compare prompts across
              models in real time.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="mb-3 text-sm font-semibold text-slate-200">
                {col.title}
              </h4>
              <ul className="space-y-2">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-sm text-slate-500 transition hover:text-slate-200"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-2 border-t border-white/5 pt-6 text-xs text-slate-600 sm:flex-row">
          <p>© {new Date().getFullYear()} PromptForge · by Muhammad Tayyab</p>
          <p>Built with Next.js · Framer Motion · Claude API</p>
        </div>
      </div>
    </footer>
  );
}

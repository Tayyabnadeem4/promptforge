import type { Metadata } from "next";
import "./globals.css";
import Toaster from "@/components/Toaster";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "PromptForge — AI Prompt IDE & Playground",
  description:
    "Build, test, version, and compare AI prompts across Claude and open models in real time. AI prompt engineer, live token counter, cost estimator, and side-by-side model diffing.",
  authors: [{ name: "Muhammad Tayyab" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* Inter (UI) + JetBrains Mono (code/prompts) — the dev-tool pairing
            recommended by ui-ux-pro-max for AI/developer products. */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}

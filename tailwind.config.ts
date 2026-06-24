import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          900: "#0a0a0f",
          800: "#0f0f17",
          700: "#15151f",
          600: "#1c1c28",
          500: "#262635",
        },
        brand: {
          DEFAULT: "#7c5cff",
          soft: "#9d86ff",
          glow: "#b9a7ff",
        },
        forge: {
          amber: "#ff9d54",
          cyan: "#54e3ff",
          green: "#4ade80",
          pink: "#ff5c8a",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        glow: "0 0 40px -8px rgba(124, 92, 255, 0.45)",
        "glow-sm": "0 0 18px -4px rgba(124, 92, 255, 0.4)",
      },
      keyframes: {
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.8)", opacity: "0.6" },
          "100%": { transform: "scale(2.2)", opacity: "0" },
        },
      },
      animation: {
        shimmer: "shimmer 1.8s infinite",
        "pulse-ring": "pulse-ring 1.4s ease-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;

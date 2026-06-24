"use client";

import { motion } from "framer-motion";

// Deterministic node positions (0–100 viewBox units) so SSR and client match.
const NODES = [
  { x: 12, y: 22 },
  { x: 28, y: 12 },
  { x: 22, y: 48 },
  { x: 40, y: 32 },
  { x: 52, y: 18 },
  { x: 48, y: 58 },
  { x: 66, y: 30 },
  { x: 72, y: 62 },
  { x: 84, y: 22 },
  { x: 88, y: 50 },
  { x: 60, y: 78 },
  { x: 34, y: 74 },
];

// Pairs of node indices to connect with threads.
const LINKS: [number, number][] = [
  [0, 1], [0, 2], [1, 4], [2, 3], [3, 4], [3, 5],
  [4, 6], [5, 6], [6, 7], [6, 8], [8, 9], [7, 9],
  [5, 11], [7, 10], [10, 11],
];

/**
 * A subtle animated constellation: nodes pulse and the threads between them
 * shimmer, with a few particles drifting along links. Sits behind the hero
 * content at low opacity so text stays readable.
 */
export default function NeuralField() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full opacity-50"
    >
      <defs>
        <linearGradient id="nf-line" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7c5cff" />
          <stop offset="100%" stopColor="#54e3ff" />
        </linearGradient>
        <radialGradient id="nf-node">
          <stop offset="0%" stopColor="#b9a7ff" />
          <stop offset="100%" stopColor="#54e3ff" />
        </radialGradient>
      </defs>

      {/* threads */}
      {LINKS.map(([a, b], i) => (
        <motion.line
          key={i}
          x1={NODES[a].x}
          y1={NODES[a].y}
          x2={NODES[b].x}
          y2={NODES[b].y}
          stroke="url(#nf-line)"
          strokeWidth={0.18}
          initial={{ opacity: 0.1 }}
          animate={{ opacity: [0.08, 0.35, 0.08] }}
          transition={{
            duration: 4 + (i % 5),
            repeat: Infinity,
            delay: i * 0.2,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* travelling pulses along a few links */}
      {LINKS.filter((_, i) => i % 3 === 0).map(([a, b], i) => (
        <motion.circle
          key={`p-${i}`}
          r={0.5}
          fill="#fff"
          initial={{ cx: NODES[a].x, cy: NODES[a].y, opacity: 0 }}
          animate={{
            cx: [NODES[a].x, NODES[b].x],
            cy: [NODES[a].y, NODES[b].y],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 3 + (i % 3),
            repeat: Infinity,
            delay: i * 0.8,
            ease: "linear",
          }}
        />
      ))}

      {/* nodes */}
      {NODES.map((n, i) => (
        <motion.circle
          key={`n-${i}`}
          cx={n.x}
          cy={n.y}
          fill="url(#nf-node)"
          initial={{ r: 0.6, opacity: 0.5 }}
          animate={{ r: [0.6, 1.1, 0.6], opacity: [0.5, 1, 0.5] }}
          transition={{
            duration: 3 + (i % 4),
            repeat: Infinity,
            delay: i * 0.25,
            ease: "easeInOut",
          }}
        />
      ))}
    </svg>
  );
}

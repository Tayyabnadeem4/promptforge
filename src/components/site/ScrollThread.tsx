"use client";

import { motion, useScroll, useSpring, useTransform } from "framer-motion";

// Approximate vertical positions (0–1 of page scroll) where the landing
// sections sit, so the thread's nodes light up as you reach each one.
const NODES = [0.06, 0.24, 0.44, 0.62, 0.8, 0.94];

/**
 * A glowing vertical "thread" pinned in the left gutter that draws downward as
 * the user scrolls (the leading "comet" tracks scroll position), with nodes and
 * branch lines that ignite when the thread reaches each section. Lives in the
 * empty gutter on wide screens, so it never overlaps content.
 */
export default function ScrollThread() {
  const { scrollYProgress } = useScroll();
  const draw = useSpring(scrollYProgress, {
    stiffness: 70,
    damping: 22,
    restDelta: 0.001,
  });
  const cometTop = useTransform(draw, [0, 1], ["0%", "100%"]);

  return (
    <div className="pointer-events-none absolute inset-y-0 left-8 z-20 hidden w-px xl:block">
      {/* faint full-height track */}
      <div className="absolute inset-0 w-px bg-white/10" />

      {/* drawn, glowing thread — grows from the top via scaleY */}
      <motion.div
        style={{ scaleY: draw }}
        className="absolute inset-x-0 top-0 h-full origin-top bg-gradient-to-b from-brand via-forge-cyan to-brand shadow-[0_0_12px_rgba(124,92,255,0.7)]"
      />

      {/* leading comet */}
      <motion.div
        style={{ top: cometTop }}
        className="absolute -left-[3px] h-2 w-2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_14px_4px_rgba(84,227,255,0.8)]"
      />

      {/* section nodes + branches */}
      {NODES.map((p, i) => (
        <ThreadNode key={i} p={p} progress={draw} flip={i % 2 === 1} />
      ))}
    </div>
  );
}

function ThreadNode({
  p,
  progress,
  flip,
}: {
  p: number;
  progress: ReturnType<typeof useSpring>;
  flip: boolean;
}) {
  const lit = useTransform(progress, [p - 0.05, p], [0.25, 1]);
  const scale = useTransform(progress, [p - 0.05, p], [0.6, 1]);
  const branchScale = useTransform(progress, [p - 0.03, p + 0.02], [0, 1]);

  return (
    <div
      className="absolute left-0 -translate-x-1/2 -translate-y-1/2"
      style={{ top: `${p * 100}%` }}
    >
      {/* branch line reaching toward the content */}
      <motion.div
        style={{ scaleX: branchScale, opacity: lit }}
        className={`absolute top-1/2 h-px w-10 origin-left bg-gradient-to-r from-forge-cyan to-transparent ${
          flip ? "right-0 origin-right rotate-180" : "left-0"
        }`}
      />
      {/* node */}
      <motion.div
        style={{ opacity: lit, scale }}
        className="h-3 w-3 rounded-full border-2 border-forge-cyan bg-ink-900 shadow-[0_0_12px_rgba(84,227,255,0.7)]"
      />
    </div>
  );
}

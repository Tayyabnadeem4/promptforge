"use client";

import { motion, useScroll, useSpring } from "framer-motion";

/** A thin gradient bar at the very top that fills as you scroll the page. */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 24,
    restDelta: 0.001,
  });

  return (
    <motion.div
      style={{ scaleX }}
      className="fixed left-0 right-0 top-0 z-50 h-0.5 origin-left bg-gradient-to-r from-brand via-forge-cyan to-brand"
    />
  );
}

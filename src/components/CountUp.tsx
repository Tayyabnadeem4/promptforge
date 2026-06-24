"use client";

import { useEffect, useState } from "react";
import { animate } from "framer-motion";

/** Animates a number from 0 up to `value` on mount/changes. */
export default function CountUp({
  value,
  duration = 1.1,
}: {
  value: number;
  duration?: number;
}) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const controls = animate(0, value, {
      duration,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [value, duration]);

  return <>{display.toLocaleString()}</>;
}

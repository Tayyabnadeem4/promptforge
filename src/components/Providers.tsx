"use client";

import { MotionConfig } from "framer-motion";

/**
 * App-wide motion settings. `reducedMotion="user"` makes every Framer Motion
 * animation automatically respect the OS "reduce motion" setting — an
 * accessibility requirement (ui-ux-pro-max §1 reduced-motion).
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

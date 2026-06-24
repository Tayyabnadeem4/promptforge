"use client";

import { motion } from "framer-motion";

// App-router template re-mounts on every navigation, giving us a route
// transition. We animate opacity only (no transform) so we never create a
// containing block that would break the app's fixed-position modals/overlays
// or sticky headers.
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

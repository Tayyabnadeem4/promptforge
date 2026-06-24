"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useToast, type ToastType } from "@/lib/toast";

const STYLES: Record<ToastType, { accent: string; icon: string }> = {
  success: { accent: "#4ade80", icon: "✓" },
  error: { accent: "#ff5c8a", icon: "!" },
  info: { accent: "#7c5cff", icon: "i" },
};

export default function Toaster() {
  const toasts = useToast((s) => s.toasts);
  const remove = useToast((s) => s.remove);

  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-[100] flex w-full max-w-xs flex-col gap-2">
      <AnimatePresence>
        {toasts.map((t) => {
          const style = STYLES[t.type];
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, x: 40, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              onClick={() => remove(t.id)}
              className="pointer-events-auto flex cursor-pointer items-center gap-3 overflow-hidden rounded-xl glass-strong p-3 shadow-glow-sm"
            >
              <span
                className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: style.accent }}
              >
                {style.icon}
              </span>
              <span className="text-sm text-slate-200">{t.message}</span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

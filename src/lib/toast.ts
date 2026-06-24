// Tiny global toast store. Any client component can fire a toast; <Toaster/>
// (mounted in the root layout) renders them.

import { create } from "zustand";

export type ToastType = "success" | "error" | "info";

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastState {
  toasts: Toast[];
  push: (message: string, type?: ToastType) => void;
  remove: (id: number) => void;
}

export const useToast = create<ToastState>((set, get) => ({
  toasts: [],
  push: (message, type = "info") => {
    const id = Date.now() + Math.random();
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }));
    setTimeout(() => get().remove(id), 3200);
  },
  remove: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

/** Convenience helper for non-component code (stores, runners). */
export const toast = (message: string, type?: ToastType) =>
  useToast.getState().push(message, type);

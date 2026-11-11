import { create } from "zustand";

export type Toast = { id: number; title: string; body?: string; tone?: "green" | "pink" | "blue"; href?: string };
type ToastState = { toasts: Toast[]; push: (t: Omit<Toast, "id">) => void; dismiss: (id: number) => void };

let counter = 0;
export const useToasts = create<ToastState>((set, get) => ({
  toasts: [],
  push: t => {
    const id = ++counter;
    set(s => ({ toasts: [...s.toasts.slice(-3), { ...t, id }] }));
    setTimeout(() => get().dismiss(id), 6000);
  },
  dismiss: id => set(s => ({ toasts: s.toasts.filter(x => x.id !== id) })),
}));

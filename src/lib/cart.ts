"use client";
import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  key: string; id: number; name: string; price: number; quantity: number; size?: string;
  category: string; art: string; colors: string[]; image: string | null;
};
export type NewCartItem = Omit<CartItem, "key" | "quantity">;
type CartState = {
  items: CartItem[];
  add: (item: NewCartItem) => void;
  inc: (key: string) => void;
  dec: (key: string) => void;
  remove: (key: string) => void;
  clear: () => void;
};

const MAX_QTY = 10;
export const cartKey = (id: number, size?: string) => `${id}:${size ?? ""}`;

export const useCart = create<CartState>()(
  persist(
    set => ({
      items: [],
      add: item => set(state => {
        const key = cartKey(item.id, item.size);
        const found = state.items.find(x => x.key === key);
        return {
          items: found
            ? state.items.map(x => (x.key === key ? { ...x, quantity: Math.min(MAX_QTY, x.quantity + 1) } : x))
            : [...state.items, { ...item, key, quantity: 1 }],
        };
      }),
      inc: key => set(state => ({ items: state.items.map(x => (x.key === key ? { ...x, quantity: Math.min(MAX_QTY, x.quantity + 1) } : x)) })),
      dec: key => set(state => ({ items: state.items.flatMap(x => (x.key === key ? (x.quantity <= 1 ? [] : [{ ...x, quantity: x.quantity - 1 }]) : [x])) })),
      remove: key => set(state => ({ items: state.items.filter(x => x.key !== key) })),
      clear: () => set({ items: [] }),
    }),
    { name: "ivan-bag-v2" }
  )
);

export const cartCount = (items: CartItem[]) => items.reduce((n, i) => n + i.quantity, 0);
export const cartTotal = (items: CartItem[]) => items.reduce((n, i) => n + i.price * i.quantity, 0);

/** The bag lives in localStorage, so only trust it after the first client render (avoids hydration mismatches). */
export function useHydrated() {
  const [ready, setReady] = useState(false);
  useEffect(() => { setReady(true); }, []);
  return ready;
}

"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type WishState = { ids: number[]; toggle: (id: number) => void };
export const useWishlist = create<WishState>()(
  persist(
    set => ({ ids: [], toggle: id => set(s => ({ ids: s.ids.includes(id) ? s.ids.filter(x => x !== id) : [...s.ids, id] })) }),
    { name: "ivan-saved-v1" }
  )
);

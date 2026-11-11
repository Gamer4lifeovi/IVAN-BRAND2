"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, Plus } from "lucide-react";
import ProductArt from "@/components/ProductArt";
import TiltCard from "./TiltCard";
import { useCart } from "@/lib/cart";
import { money, type Product } from "@/lib/products";
import { useToasts } from "@/lib/toast";
import { useHydrated } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";

export default function ProductCard({ p, index = 0, big = false }: { p: Product; index?: number; big?: boolean }) {
  const add = useCart(s => s.add);
  const push = useToasts(s => s.push);
  const hydrated = useHydrated();
  const saved = useWishlist(s => s.ids.includes(p.id));
  const toggle = useWishlist(s => s.toggle);
  const needsSize = p.sizes.length > 0;

  const quickAdd = () => {
    add({ id: p.id, name: p.name, price: p.price, category: p.category, art: p.art, colors: p.colors, image: p.image_url });
    push({ title: "Added to your bag", body: `${p.name} · tap to view bag`, tone: "green", href: "/bag" });
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 26 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index, 8) * 0.05 }}
      className={`group relative ${big ? "sm:col-span-2 sm:row-span-2" : ""}`}
    >
      <TiltCard className="h-full overflow-hidden rounded-[28px] border border-line bg-surface transition-shadow duration-300 hover:shadow-[0_24px_70px_-30px_var(--glow)]">
        <Link href={`/shop/${p.id}`} aria-label={`View ${p.name}`} className="absolute inset-0 z-10" />
        <ProductArt product={p} className={big ? "aspect-[4/3] sm:aspect-auto sm:h-[calc(100%-110px)] sm:min-h-[320px]" : "aspect-[4/4.2]"} textClass={big ? "text-6xl md:text-8xl" : "text-4xl md:text-5xl"} />
        <span className="absolute left-4 top-4 z-10 rounded-full bg-black/45 px-3 py-1 text-[9px] font-bold tracking-[.18em] text-white backdrop-blur">{p.tag || p.category}</span>

        <button onClick={() => toggle(p.id)} aria-label={saved && hydrated ? "Remove from saved" : "Save piece"} className="absolute right-4 top-4 z-30 flex h-9 w-9 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur transition hover:scale-110">
          <Heart size={16} className={saved && hydrated ? "fill-hot text-hot" : ""} />
        </button>

        <div className="relative flex items-end justify-between gap-3 p-5">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[.18em] text-accent-text">{p.category}</p>
            <h2 className="mt-1 truncate text-lg font-bold leading-tight">{p.name}</h2>
            <p className="mt-1 text-sm font-semibold text-muted">{money(p.price)}{needsSize && <span className="ml-2 text-[11px] font-normal">· sizes {p.sizes[0]}–{p.sizes[p.sizes.length - 1]}</span>}</p>
          </div>
          {needsSize ? (
            <span className="relative z-0 shrink-0 rounded-full border border-line px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-muted">Pick size</span>
          ) : (
            <button onClick={quickAdd} aria-label={`Add ${p.name} to bag`} className="relative z-30 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent text-accent-ink transition hover:scale-110"><Plus size={20} /></button>
          )}
        </div>
      </TiltCard>
    </motion.article>
  );
}

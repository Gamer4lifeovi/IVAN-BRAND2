"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Heart, MessageCircle, Palette, ShoppingBag } from "lucide-react";
import Navbar from "@/components/Navbar";
import ProductArt from "@/components/ProductArt";
import ProductCard from "./ProductCard";
import TiltCard from "./TiltCard";
import { useCart, useHydrated } from "@/lib/cart";
import { money, type Product } from "@/lib/products";
import { useToasts } from "@/lib/toast";
import { useWishlist } from "@/lib/wishlist";

export default function ProductView({ product: p, related }: { product: Product; related: Product[] }) {
  const [size, setSize] = useState("");
  const [shake, setShake] = useState(false);
  const add = useCart(s => s.add);
  const push = useToasts(s => s.push);
  const hydrated = useHydrated();
  const saved = useWishlist(s => s.ids.includes(p.id));
  const toggle = useWishlist(s => s.toggle);
  const needsSize = p.sizes.length > 0;

  const addToBag = () => {
    if (needsSize && !size) { setShake(true); setTimeout(() => setShake(false), 500); push({ title: "Pick a size first", body: "Choose your size above", tone: "pink" }); return; }
    add({ id: p.id, name: p.name, price: p.price, category: p.category, art: p.art, colors: p.colors, image: p.image_url, size: needsSize ? size : undefined });
    push({ title: "Added to your bag", body: `${p.name}${size ? ` · size ${size}` : ""}`, tone: "green", href: "/bag" });
  };

  return (
    <main className="grid-bg min-h-screen pb-20">
      <Navbar />
      <section className="mx-auto max-w-6xl px-5 pt-8 md:px-8">
        <Link href="/shop" className="inline-flex items-center gap-2 text-xs font-semibold text-muted transition hover:text-text"><ArrowLeft size={14} /> Back to the drops</Link>

        <div className="mt-6 grid gap-8 md:grid-cols-2 md:gap-12">
          <div className="group">
            <TiltCard className="overflow-hidden rounded-[32px] border border-line">
              <ProductArt product={p} className="aspect-square" textClass="text-7xl md:text-8xl" />
            </TiltCard>
          </div>

          <div className="flex flex-col justify-center">
            <p className="text-[11px] font-bold uppercase tracking-[.2em] text-accent-text">{p.category}</p>
            <h1 className="display-font mt-2 text-5xl leading-[.88] md:text-7xl">{p.name}</h1>
            {p.tag && <span className="mt-4 w-fit rounded-full border border-line px-3 py-1 text-[10px] font-bold tracking-[.18em] text-muted">{p.tag}</span>}
            <p className="mt-5 text-4xl font-black">{money(p.price)}</p>
            <p className="mt-4 max-w-md text-sm leading-7 text-muted">{p.blurb}</p>

            {needsSize && (
              <div className={`mt-7 ${shake ? "animate-pulse" : ""}`}>
                <p className="mb-3 text-[11px] font-black uppercase tracking-[.2em]">Choose your size</p>
                <div className="flex flex-wrap gap-2">
                  {p.sizes.map(s => <button key={s} onClick={() => setSize(s)} className={`h-11 min-w-11 rounded-full border px-4 text-sm font-bold transition ${size === s ? "border-accent bg-accent text-accent-ink glow-accent" : "border-line hover:border-text/50"}`}>{s}</button>)}
                </div>
              </div>
            )}

            <div className="mt-8 flex gap-3">
              <button onClick={addToBag} className="flex flex-1 items-center justify-center gap-2 rounded-full bg-accent py-4 text-xs font-black tracking-[.16em] text-accent-ink transition hover:scale-[1.02]"><ShoppingBag size={16} /> ADD TO BAG</button>
              <button onClick={() => toggle(p.id)} aria-label={saved && hydrated ? "Remove from saved" : "Save piece"} className="flex h-[52px] w-[52px] items-center justify-center rounded-full border border-line transition hover:border-hot"><Heart size={18} className={saved && hydrated ? "fill-hot text-hot" : ""} /></button>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Link href={`/custom-studio?base=${encodeURIComponent(p.name)}`} className="flex items-center justify-center gap-2 rounded-full border border-line px-5 py-3 text-xs font-bold transition hover:border-accent"><Palette size={15} /> Want it custom?</Link>
              <Link href="/chat" className="flex items-center justify-center gap-2 rounded-full border border-line px-5 py-3 text-xs font-bold transition hover:border-accent"><MessageCircle size={15} /> Ask us about it</Link>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-20">
            <h2 className="display-font text-4xl">YOU MIGHT ALSO LIKE</h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{related.map((r, i) => <ProductCard key={r.id} p={r} index={i} />)}</div>
          </div>
        )}
      </section>
    </main>
  );
}

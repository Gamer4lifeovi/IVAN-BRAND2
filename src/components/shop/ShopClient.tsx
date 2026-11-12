"use client";
import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Heart, MessageCircle, Search, ShieldCheck, Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";
import ProductArt from "@/components/ProductArt";
import ProductCard from "./ProductCard";
import { cartCount, cartTotal, useCart, useHydrated } from "@/lib/cart";
import { money, type Product } from "@/lib/products";
import { useWishlist } from "@/lib/wishlist";

type Sort = "featured" | "low" | "high";
const ticker = ["HAND PAINTED", "ONE OF ONE", "MADE IN LAGOS", "NO TWO ALIKE", "WEAR YOUR OWN KIND OF DIFFERENT"];

export default function ShopClient({ products, initialSaved = false }: { products: Product[]; initialSaved?: boolean }) {
  const [category, setCategory] = useState("All");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<Sort>("featured");
  const [onlySaved, setOnlySaved] = useState(initialSaved);
  const hydrated = useHydrated();
  const savedIds = useWishlist(s => s.ids);
  const items = useCart(s => s.items);
  const spot = useRef<HTMLElement>(null);

  const categories = useMemo(() => ["All", ...Array.from(new Set(products.map(p => p.category)))], [products]);
  const visible = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let list = products.filter(p =>
      (category === "All" || p.category === category) &&
      (!needle || [p.name, p.category, p.tag].some(v => v.toLowerCase().includes(needle))) &&
      (!onlySaved || savedIds.includes(p.id))
    );
    if (sort === "low") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "high") list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [products, category, q, sort, onlySaved, savedIds]);

  const featured = products[0];
  const showFeatured = featured && category === "All" && !q && !onlySaved;
  const bigId = sort === "featured" && visible.length >= 4 ? visible[0]?.id : undefined;

  return (
    <main
      className="relative min-h-screen overflow-hidden pb-28"
      onPointerMove={e => { const el = spot.current; if (el) { el.style.setProperty("--mx", `${e.clientX}px`); el.style.setProperty("--my", `${e.clientY}px`); } }}
    >
      {/* cursor spotlight */}
      <section ref={spot} aria-hidden className="pointer-events-none fixed inset-0 z-0" style={{ background: "radial-gradient(520px circle at var(--mx,50%) var(--my,20%), color-mix(in srgb, var(--accent) 9%, transparent), transparent 65%)" }} />
      <div className="relative z-10">
        <Navbar />

        <header className="mx-auto max-w-7xl px-5 pt-12 md:px-8 md:pt-20">
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <div>
              <span className="glass inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-semibold text-accent-text"><Sparkles size={13} /> Hey, welcome in</span>
              <h1 className="display-font mt-5 text-7xl leading-[.82] md:text-[10rem]">THE <span className="bg-gradient-to-r from-accent to-sky-400 bg-clip-text text-transparent">DROPS</span></h1>
            </div>
            <div className="max-w-xs">
              <p className="text-sm leading-6 text-muted">Hand-finished pieces you will not see on anyone else. Find one you love, or make something that is only yours.</p>
              <p className="mt-3 text-[11px] font-bold uppercase tracking-[.2em] text-accent-text">{products.length} piece{products.length === 1 ? "" : "s"} live now</p>
            </div>
          </div>
        </header>

        <div className="marquee mt-10 overflow-hidden border-y border-line py-3">
          <div className="marquee-track gap-10 whitespace-nowrap text-[11px] font-black uppercase tracking-[.3em] text-muted">
            {[...ticker, ...ticker, ...ticker, ...ticker].map((t, i) => <span key={i} className="flex items-center gap-10">{t}<span className="text-accent-text">✦</span></span>)}
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-5 md:px-8">
          {showFeatured && (
            <motion.section initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="mt-10 grid overflow-hidden rounded-[32px] border border-line bg-surface md:grid-cols-[1.1fr_1fr]">
              <ProductArt product={featured} className="min-h-[300px] md:min-h-[440px]" textClass="text-6xl md:text-8xl" />
              <div className="flex flex-col justify-center p-7 md:p-12">
                <span className="w-fit rounded-full bg-hot px-3 py-1 text-[10px] font-black uppercase tracking-[.2em] text-white">Spotlight</span>
                <p className="mt-5 text-[11px] font-bold uppercase tracking-[.2em] text-accent-text">{featured.tag || featured.category}</p>
                <h2 className="display-font mt-2 text-5xl leading-[.88] md:text-6xl">{featured.name}</h2>
                <p className="mt-4 max-w-sm text-sm leading-6 text-muted">{featured.blurb}</p>
                <p className="mt-5 text-3xl font-black">{money(featured.price)}</p>
                <Link href={`/shop/${featured.id}`} className="group mt-7 inline-flex w-fit items-center gap-3 rounded-full bg-accent px-7 py-4 text-xs font-black tracking-[.16em] text-accent-ink transition hover:scale-[1.03]">VIEW THE PIECE <ArrowUpRight size={17} className="transition group-hover:translate-x-1 group-hover:-translate-y-1" /></Link>
              </div>
            </motion.section>
          )}

          <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {categories.map(c => (
                <button key={c} onClick={() => setCategory(c)} className={`relative rounded-full border px-4 py-2 text-xs font-semibold transition ${category === c ? "border-transparent text-accent-ink" : "border-line text-muted hover:border-text/40 hover:text-text"}`}>
                  {category === c && <motion.span layoutId="cat-pill" className="absolute inset-0 rounded-full bg-accent glow-accent" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
                  <span className="relative">{c}</span>
                </button>
              ))}
              <button onClick={() => setOnlySaved(s => !s)} className={`flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-semibold transition ${onlySaved ? "border-hot bg-hot text-white" : "border-line text-muted hover:text-hot"}`}><Heart size={13} /> Saved{hydrated && savedIds.length > 0 ? ` (${savedIds.length})` : ""}</button>
            </div>
            <div className="flex w-full items-center gap-2 sm:w-auto">
              <label className="relative flex-1 sm:w-56"><Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search the drops" className="h-10 w-full rounded-full border border-line bg-surface pl-10 pr-4 text-sm outline-none placeholder:text-muted focus:border-accent" /></label>
              <select value={sort} onChange={e => setSort(e.target.value as Sort)} aria-label="Sort" className="h-10 rounded-full border border-line bg-surface px-4 text-xs font-semibold outline-none focus:border-accent">
                <option value="featured">Featured</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option>
              </select>
            </div>
          </div>

          <div className="mt-6 grid auto-rows-auto gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visible.map((p, i) => <ProductCard key={p.id} p={p} index={i} big={p.id === bigId} />)}
          </div>
          {!visible.length && (
            <div className="glass mt-6 rounded-[28px] p-12 text-center">
              <p className="text-xl font-bold">{onlySaved ? "Nothing saved yet" : "Nothing matches that"}</p>
              <p className="mt-2 text-sm text-muted">{onlySaved ? "Tap the heart on a piece to keep it here." : "Try another search or category, or build your own piece."}</p>
            </div>
          )}

          <section className="relative mt-16 overflow-hidden rounded-[32px] border border-line bg-surface p-8 md:p-14">
            <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-accent/20 blur-[90px]" />
            <p className="relative text-[11px] font-bold uppercase tracking-[.3em] text-accent-text">Can&apos;t find it?</p>
            <h2 className="display-font relative mt-3 text-5xl leading-[.85] md:text-7xl">MAKE IT <span className="text-hot">YOURS.</span></h2>
            <p className="relative mt-4 max-w-md text-sm leading-6 text-muted">Send us your idea and we will paint it by hand, one of one.</p>
            <div className="relative mt-7 flex flex-wrap gap-3">
              <Link href="/custom-studio" className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3.5 text-xs font-black tracking-[.14em] text-accent-ink transition hover:scale-[1.03]">OPEN THE STUDIO <ArrowRight size={15} /></Link>
              <Link href="/chat" className="inline-flex items-center gap-2 rounded-full border border-line px-6 py-3.5 text-xs font-bold transition hover:border-accent"><MessageCircle size={15} /> Chat with us</Link>
            </div>
          </section>
          <p className="mt-8 flex items-center justify-center gap-2 text-xs text-muted"><ShieldCheck size={14} className="text-accent-text" /> Secure checkout with Paystack</p>
        </div>
      </div>

      <AnimatePresence>
        {hydrated && items.length > 0 && (
          <motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }} className="fixed bottom-4 left-4 z-40 w-[calc(100vw-6.5rem)] max-w-md sm:left-1/2 sm:-translate-x-1/2">
            <Link href="/bag" className="glass glow-accent flex items-center justify-between gap-3 rounded-full border-accent/40 px-5 py-3.5 text-sm font-bold">
              <span>{cartCount(items)} item{cartCount(items) > 1 ? "s" : ""} · {money(cartTotal(items))}</span>
              <span className="flex items-center gap-1 text-accent-text">View bag <ArrowRight size={16} /></span>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

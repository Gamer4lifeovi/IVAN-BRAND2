"use client";
import Link from "next/link";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import ProductArt from "@/components/ProductArt";
import { cartCount, cartTotal, useCart, useHydrated } from "@/lib/cart";
import { money } from "@/lib/products";

export default function BagPage() {
  const hydrated = useHydrated();
  const { items, inc, dec, remove } = useCart();
  const empty = hydrated && items.length === 0;

  return (
    <main className="grid-bg min-h-screen pb-20">
      <Navbar />
      <section className="mx-auto max-w-5xl px-5 pt-12 md:px-8 md:pt-16">
        <p className="text-[11px] font-bold uppercase tracking-[.3em] text-accent-text">Almost yours</p>
        <h1 className="display-font mt-3 text-6xl leading-[.85] md:text-8xl">YOUR BAG</h1>

        {!hydrated && <p className="mt-10 text-sm text-muted">Loading your bag…</p>}

        {empty && (
          <div className="glass mt-10 rounded-[28px] p-10 text-center">
            <ShoppingBag className="mx-auto text-accent-text" size={34} />
            <p className="mt-4 text-xl font-bold">Your bag is empty</p>
            <p className="mt-2 text-sm text-muted">Nothing here yet. Go find something that feels like you.</p>
            <Link href="/shop" className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-xs font-black tracking-[.14em] text-accent-ink transition hover:scale-[1.03]">BROWSE THE DROPS <ArrowRight size={15} /></Link>
          </div>
        )}

        {hydrated && items.length > 0 && (
          <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_340px]">
            <ul className="space-y-3">
              {items.map(item => (
                <li key={item.key} className="glass flex items-center gap-4 rounded-[24px] p-3 pr-5">
                  <Link href={`/shop/${item.id}`} className="shrink-0 overflow-hidden rounded-2xl">
                    <ProductArt product={{ art: item.art, colors: item.colors, image_url: item.image, name: item.name }} className="h-24 w-24" textClass="text-base" />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-[.16em] text-accent-text">{item.category}</p>
                    <p className="truncate font-bold">{item.name}</p>
                    <p className="text-sm text-muted">{money(item.price)}{item.size && <span> · size {item.size}</span>}</p>
                    <div className="mt-2 inline-flex items-center gap-3 rounded-full bg-surface-2 px-2 py-1">
                      <button onClick={() => dec(item.key)} aria-label="Decrease quantity" className="rounded-full p-1 hover:bg-line"><Minus size={14} /></button>
                      <span className="w-5 text-center text-sm font-bold">{item.quantity}</span>
                      <button onClick={() => inc(item.key)} aria-label="Increase quantity" className="rounded-full p-1 hover:bg-line"><Plus size={14} /></button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <b>{money(item.price * item.quantity)}</b>
                    <button onClick={() => remove(item.key)} aria-label={`Remove ${item.name}`} className="text-muted transition hover:text-hot"><Trash2 size={17} /></button>
                  </div>
                </li>
              ))}
            </ul>

            <aside className="glass h-fit rounded-[28px] p-6 lg:sticky lg:top-24">
              <h2 className="text-lg font-bold">Order summary</h2>
              <div className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between text-muted"><span>{cartCount(items)} item{cartCount(items) > 1 ? "s" : ""}</span><span>{money(cartTotal(items))}</span></div>
                <div className="flex justify-between border-t border-line pt-4 text-base font-black"><span>Total</span><span className="text-accent-text">{money(cartTotal(items))}</span></div>
              </div>
              <Link href="/checkout" className="mt-6 flex items-center justify-center gap-2 rounded-full bg-accent py-4 text-xs font-black tracking-[.16em] text-accent-ink transition hover:scale-[1.02]">CHECKOUT <ArrowRight size={15} /></Link>
              <Link href="/shop" className="mt-3 block text-center text-xs text-muted hover:text-text">Keep shopping</Link>
            </aside>
          </div>
        )}
      </section>
    </main>
  );
}

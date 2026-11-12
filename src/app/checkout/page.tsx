"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import { cartTotal, useCart, useHydrated } from "@/lib/cart";
import { money } from "@/lib/products";

const field = "h-12 w-full rounded-2xl border border-line bg-surface px-4 text-sm outline-none transition placeholder:text-muted focus:border-accent";

export default function CheckoutPage() {
  const router = useRouter();
  const hydrated = useHydrated();
  const items = useCart(s => s.items);
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", city: "", state: "Lagos", notes: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

  useEffect(() => { if (hydrated && items.length === 0) router.replace("/bag"); }, [hydrated, items.length, router]);

  async function pay(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: items.map(i => ({ id: i.id, quantity: i.quantity, size: i.size })), customer: form }),
      });
      const json = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !json.url) throw new Error(json.error ?? "Could not start the payment.");
      window.location.href = json.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen pb-20">
      <Navbar />
      <section className="mx-auto max-w-5xl px-5 pt-12 md:px-8 md:pt-16">
        <p className="text-[11px] font-bold uppercase tracking-[.3em] text-accent-text">Last step</p>
        <h1 className="display-font mt-3 text-6xl leading-[.85] md:text-8xl">CHECKOUT</h1>

        <form onSubmit={pay} className="mt-10 grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="glass space-y-4 rounded-[28px] p-6">
            <h2 className="text-lg font-bold">Where should we send it?</h2>
            <input required value={form.name} onChange={set("name")} placeholder="Full name" autoComplete="name" className={field} />
            <div className="grid gap-4 sm:grid-cols-2">
              <input required type="email" value={form.email} onChange={set("email")} placeholder="Email" autoComplete="email" className={field} />
              <input required type="tel" value={form.phone} onChange={set("phone")} placeholder="Phone number" autoComplete="tel" className={field} />
            </div>
            <input required value={form.address} onChange={set("address")} placeholder="Delivery address" autoComplete="street-address" className={field} />
            <div className="grid gap-4 sm:grid-cols-2">
              <input required value={form.city} onChange={set("city")} placeholder="City" autoComplete="address-level2" className={field} />
              <input required value={form.state} onChange={set("state")} placeholder="State" autoComplete="address-level1" className={field} />
            </div>
            <textarea value={form.notes} onChange={set("notes")} rows={3} placeholder="Anything we should know? (optional)" className="w-full resize-y rounded-2xl border border-line bg-surface p-4 text-sm outline-none placeholder:text-muted focus:border-accent" />
          </div>

          <aside className="glass h-fit rounded-[28px] p-6 lg:sticky lg:top-24">
            <h2 className="text-lg font-bold">Your order</h2>
            <ul className="mt-4 space-y-2 text-sm">
              {items.map(i => <li key={i.key} className="flex justify-between gap-3 text-muted"><span className="truncate">{i.name}{i.size ? ` (${i.size})` : ""} × {i.quantity}</span><span>{money(i.price * i.quantity)}</span></li>)}
            </ul>
            <div className="mt-4 flex justify-between border-t border-line pt-4 text-base font-black"><span>Total</span><span className="text-accent-text">{money(cartTotal(items))}</span></div>
            {error && <p className="mt-4 rounded-2xl bg-hot/10 p-3 text-xs text-hot">{error}</p>}
            <button disabled={busy || items.length === 0} className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-accent py-4 text-xs font-black tracking-[.14em] text-accent-ink transition hover:scale-[1.02] disabled:opacity-60">
              {busy ? <><Loader2 size={15} className="animate-spin" /> STARTING PAYMENT…</> : <><Lock size={14} /> PAY {money(cartTotal(items))}</>}
            </button>
            <p className="mt-3 text-center text-[11px] leading-5 text-muted">Payments are handled by Paystack. IVAN never sees your card details.</p>
            <Link href="/bag" className="mt-2 block text-center text-xs text-muted hover:text-text">Back to bag</Link>
          </aside>
        </form>
      </section>
    </main>
  );
}

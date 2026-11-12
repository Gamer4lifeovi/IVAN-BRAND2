"use client";
import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useCart } from "@/lib/cart";

type State = "checking" | "paid" | "pending" | "failed" | "missing";

function Result() {
  const params = useSearchParams();
  const reference = params.get("reference") ?? params.get("trxref");
  const clear = useCart(s => s.clear);
  const [state, setState] = useState<State>("checking");

  const check = useCallback(async () => {
    if (!reference) { setState("missing"); return; }
    setState("checking");
    try {
      const res = await fetch(`/api/paystack/verify?reference=${encodeURIComponent(reference)}`);
      const json = (await res.json()) as { state?: State };
      const next = json.state ?? "pending";
      setState(next);
      if (next === "paid") clear();
    } catch { setState("pending"); }
  }, [reference, clear]);

  useEffect(() => { check(); }, [check]);

  return (
    <div className="glass mx-auto mt-12 max-w-lg rounded-[32px] p-10 text-center">
      {state === "checking" && <><Loader2 className="mx-auto animate-spin text-accent-text" size={40} /><p className="mt-5 text-xl font-bold">Confirming your payment…</p><p className="mt-2 text-sm text-muted">Hang tight, this only takes a moment.</p></>}
      {state === "paid" && <><CheckCircle2 className="mx-auto text-accent-text" size={48} /><h1 className="display-font mt-5 text-5xl">YOU&apos;RE IN.</h1><p className="mt-3 text-sm leading-6 text-muted">Payment received, thank you! Your order is confirmed and the IVAN team has been notified. We will be in touch about delivery.</p>{reference && <p className="mt-4 text-xs text-muted">Reference: {reference}</p>}<Link href="/shop" className="mt-8 inline-block rounded-full bg-accent px-7 py-3 text-xs font-black tracking-[.14em] text-accent-ink">KEEP SHOPPING</Link></>}
      {state === "pending" && <><Loader2 className="mx-auto text-muted" size={40} /><p className="mt-5 text-xl font-bold">Still waiting on the bank</p><p className="mt-2 text-sm text-muted">Your payment has not been confirmed yet. If you were charged, it will show up shortly.</p><button onClick={check} className="mt-6 rounded-full border border-line px-6 py-3 text-xs font-bold hover:border-accent">CHECK AGAIN</button></>}
      {state === "failed" && <><XCircle className="mx-auto text-hot" size={44} /><p className="mt-5 text-xl font-bold">That payment did not go through</p><p className="mt-2 text-sm text-muted">No worries, you were not charged. Your bag is still saved.</p><Link href="/checkout" className="mt-6 inline-block rounded-full bg-accent px-7 py-3 text-xs font-black tracking-[.14em] text-accent-ink">TRY AGAIN</Link></>}
      {state === "missing" && <><p className="text-xl font-bold">We could not find that order</p><Link href="/shop" className="mt-6 inline-block rounded-full border border-line px-6 py-3 text-xs font-bold">BACK TO SHOP</Link></>}
    </div>
  );
}

export default function SuccessPage() {
  return (
    <main className="grid-bg min-h-screen px-5 pb-20">
      <Navbar />
      <Suspense fallback={null}><Result /></Suspense>
    </main>
  );
}

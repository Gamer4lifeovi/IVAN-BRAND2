import { NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/products";

type Body = {
  items?: { id: number; quantity: number; size?: string }[];
  customer?: { name?: string; email?: string; phone?: string; address?: string; city?: string; state?: string; notes?: string };
};

const clean = (v: unknown, max = 300) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function POST(req: Request) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) return NextResponse.json({ error: "Payments are not switched on yet (PAYSTACK_SECRET_KEY is missing)." }, { status: 503 });
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return NextResponse.json({ error: "Orders are not switched on yet (SUPABASE_SERVICE_ROLE_KEY is missing)." }, { status: 503 });

  let body: Body;
  try { body = (await req.json()) as Body; } catch { return NextResponse.json({ error: "Bad request" }, { status: 400 }); }

  const c = body.customer ?? {};
  const customer = {
    name: clean(c.name, 120), email: clean(c.email, 160), phone: clean(c.phone, 40),
    address: clean(c.address, 300), city: clean(c.city, 80), state: clean(c.state, 80), notes: clean(c.notes, 500),
  };
  if (customer.name.length < 2 || !/^\S+@\S+\.\S+$/.test(customer.email) || customer.phone.length < 6 || customer.address.length < 5 || customer.city.length < 2 || customer.state.length < 2) {
    return NextResponse.json({ error: "Please fill in all delivery details." }, { status: 400 });
  }

  // Prices come from OUR database, never from the browser.
  const wanted = body.items ?? [];
  const ids = [...new Set(wanted.map(i => Number(i.id)).filter(n => Number.isInteger(n)))];
  const { data: rows } = ids.length ? await adminClient().from("products").select("*").in("id", ids).eq("active", true) : { data: [] };
  const catalog = new Map(((rows ?? []) as Product[]).map(p => [p.id, p]));

  const lines = [];
  let subtotal = 0;
  for (const raw of wanted) {
    const p = catalog.get(Number(raw.id));
    const qty = Math.floor(Number(raw.quantity));
    if (!p || !(qty >= 1 && qty <= 10)) return NextResponse.json({ error: "Something in your bag is no longer available." }, { status: 400 });
    const size = clean(raw.size, 20);
    if (p.sizes.length > 0 && !p.sizes.includes(size)) return NextResponse.json({ error: `Please choose a size for ${p.name}.` }, { status: 400 });
    lines.push({ id: p.id, name: p.name, category: p.category, price: p.price, quantity: qty, ...(p.sizes.length ? { size } : {}) });
    subtotal += p.price * qty;
  }
  if (!lines.length || lines.length > 20) return NextResponse.json({ error: "Your bag is empty." }, { status: 400 });

  const shipping = 0;
  const total = subtotal + shipping;
  const reference = `IVAN-${crypto.randomUUID().replace(/-/g, "").slice(0, 10).toUpperCase()}`;
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(req.url).origin;

  const init = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
    body: JSON.stringify({ email: customer.email, amount: total * 100, currency: "NGN", reference, callback_url: `${origin}/checkout/success`, metadata: { customer: customer.name } }),
  });
  const initJson = (await init.json()) as { status: boolean; message?: string; data?: { authorization_url: string } };
  if (!initJson.status || !initJson.data) return NextResponse.json({ error: initJson.message ?? "Could not start the payment." }, { status: 502 });

  const { error } = await adminClient().from("orders").insert({
    reference, customer_name: customer.name, email: customer.email, phone: customer.phone, address: customer.address,
    city: customer.city, state: customer.state, notes: customer.notes || null, items: lines,
    subtotal, shipping, total, currency: "NGN", status: "pending", payment_status: "unpaid",
  });
  if (error) return NextResponse.json({ error: "Could not save your order. Please try again." }, { status: 500 });

  return NextResponse.json({ url: initJson.data.authorization_url, reference });
}

import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { settlePayment } from "@/lib/server/payments";

/** Paystack calls this when a payment succeeds, even if the customer closes the tab. */
export async function POST(req: Request) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) return NextResponse.json({ ok: false }, { status: 503 });

  const raw = await req.text();
  const signature = req.headers.get("x-paystack-signature") ?? "";
  const expected = crypto.createHmac("sha512", secret).update(raw).digest("hex");
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return NextResponse.json({ ok: false }, { status: 401 });

  const event = JSON.parse(raw) as { event?: string; data?: { reference?: string } };
  if (event.event === "charge.success" && event.data?.reference) await settlePayment(event.data.reference);
  return NextResponse.json({ ok: true });
}

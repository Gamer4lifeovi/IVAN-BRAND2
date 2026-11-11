import { adminClient } from "@/lib/supabase/server";

type PaystackVerify = {
  status: boolean;
  message?: string;
  data?: { status: string; amount: number; currency: string; reference: string; [k: string]: unknown };
};

export type SettleResult = "paid" | "failed" | "pending" | "missing";

/**
 * Asks Paystack whether a reference was really paid, checks the amount against OUR order,
 * then records the payment and marks the order paid. Safe to call many times (idempotent).
 */
export async function settlePayment(reference: string): Promise<SettleResult> {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) throw new Error("PAYSTACK_SECRET_KEY is missing in .env.local");

  const db = adminClient();
  const { data: order } = await db.from("orders").select("id,total,payment_status").eq("reference", reference).maybeSingle();
  if (!order) return "missing";

  const res = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${secret}` },
    cache: "no-store",
  });
  const json = (await res.json()) as PaystackVerify;
  const tx = json.data;

  if (json.status && tx?.status === "success" && tx.amount === order.total * 100 && tx.currency === "NGN") {
    await db.from("payments").upsert(
      { order_id: order.id, provider: "paystack", reference, amount: order.total, currency: "NGN", status: "success", raw: tx },
      { onConflict: "reference" }
    );
    await db.from("orders").update({ payment_status: "paid", paid_at: new Date().toISOString() }).eq("id", order.id).neq("payment_status", "paid");
    return "paid";
  }
  if (tx?.status === "failed") {
    await db.from("orders").update({ payment_status: "failed" }).eq("id", order.id).eq("payment_status", "unpaid");
    return "failed";
  }
  return order.payment_status === "paid" ? "paid" : "pending";
}

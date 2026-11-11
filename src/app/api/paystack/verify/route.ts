import { NextResponse } from "next/server";
import { settlePayment } from "@/lib/server/payments";

export async function GET(req: Request) {
  const reference = new URL(req.url).searchParams.get("reference");
  if (!reference) return NextResponse.json({ state: "missing" }, { status: 400 });
  try {
    return NextResponse.json({ state: await settlePayment(reference) });
  } catch (e) {
    return NextResponse.json({ state: "pending", error: e instanceof Error ? e.message : "verify failed" }, { status: 500 });
  }
}

"use client";
import { useCallback, useEffect, useState } from "react";
import { tryDb } from "./supabase/browser";
import type { Product } from "./products";

export type OrderItem = { id: number; name: string; category: string; price: number; quantity: number; size?: string };
export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";
export type PaymentStatus = "unpaid" | "paid" | "failed";
export type Order = {
  id: string; order_no: number; reference: string; customer_name: string; email: string; phone: string;
  address: string; city: string; state: string; notes: string | null; items: OrderItem[];
  subtotal: number; shipping: number; total: number; currency: string;
  status: OrderStatus; payment_status: PaymentStatus; paid_at: string | null; created_at: string;
};
export type Payment = {
  id: string; order_id: string; provider: string; reference: string; amount: number; currency: string;
  status: string; created_at: string; orders: { order_no: number; customer_name: string; email: string } | null;
};

export const ORDER_STATUSES: OrderStatus[] = ["pending", "processing", "shipped", "delivered", "cancelled"];
export const isPaid = (o: Order) => o.payment_status === "paid";

/** All orders, live. RLS only returns rows to staff. */
export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const db = tryDb();
    if (!db) { setLoading(false); return; }
    const { data } = await db.from("orders").select("*").order("created_at", { ascending: false }).limit(500);
    setOrders((data as Order[] | null) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    const db = tryDb();
    load();
    if (!db) return;
    const channel = db.channel("orders-live").on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => { load(); }).subscribe();
    return () => { db.removeChannel(channel); };
  }, [load]);

  const setStatus = useCallback(async (id: string, status: OrderStatus) => {
    const db = tryDb();
    if (!db) return;
    await db.from("orders").update({ status }).eq("id", id);
    load();
  }, [load]);

  return { orders, loading, setStatus };
}

export function usePayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const db = tryDb();
    if (!db) { setLoading(false); return; }
    const { data } = await db.from("payments").select("*, orders(order_no,customer_name,email)").order("created_at", { ascending: false }).limit(500);
    setPayments((data as unknown as Payment[] | null) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    const db = tryDb();
    load();
    if (!db) return;
    const channel = db.channel("payments-live").on("postgres_changes", { event: "*", schema: "public", table: "payments" }, () => { load(); }).subscribe();
    return () => { db.removeChannel(channel); };
  }, [load]);

  return { payments, loading };
}

export function exportOrdersCsv(orders: Order[]) {
  const esc = (v: string | number | null) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const head = ["Order", "Date", "Customer", "Email", "Phone", "Address", "City", "State", "Items", "Total", "Payment", "Status", "Reference"];
  const rows = orders.map(o => [
    o.order_no, new Date(o.created_at).toISOString(), o.customer_name, o.email, o.phone, o.address, o.city, o.state,
    o.items.map(i => `${i.name} x${i.quantity}`).join("; "), o.total, o.payment_status, o.status, o.reference,
  ].map(esc).join(","));
  const blob = new Blob([[head.map(esc).join(","), ...rows].join("\n")], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `ivan-orders-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

export const dateTime = (iso: string) => new Date(iso).toLocaleString("en-NG", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

/** Every product, including hidden ones (staff only see inactive rows through RLS). */
export function useAdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    const db = tryDb();
    if (!db) { setLoading(false); return; }
    const { data } = await db.from("products").select("*").order("sort").order("id");
    setProducts((data as Product[] | null) ?? []);
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);
  return { products, loading, reload: load };
}

export type RequestStatus = "new" | "in_progress" | "quoted" | "completed" | "cancelled";
export const REQUEST_STATUSES: RequestStatus[] = ["new", "in_progress", "quoted", "completed", "cancelled"];
export type CustomRequest = {
  id: string; name: string; email: string; phone: string | null; base_item: string; styles: string[];
  notes: string; reference_path: string | null; status: RequestStatus; created_at: string;
};

export function useCustomRequests() {
  const [requests, setRequests] = useState<CustomRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    const db = tryDb();
    if (!db) { setLoading(false); return; }
    const { data } = await db.from("custom_requests").select("*").order("created_at", { ascending: false }).limit(300);
    setRequests((data as CustomRequest[] | null) ?? []);
    setLoading(false);
  }, []);
  useEffect(() => {
    const db = tryDb();
    load();
    if (!db) return;
    const channel = db.channel("custom-live").on("postgres_changes", { event: "*", schema: "public", table: "custom_requests" }, () => { load(); }).subscribe();
    return () => { db.removeChannel(channel); };
  }, [load]);
  return { requests, loading, reload: load };
}

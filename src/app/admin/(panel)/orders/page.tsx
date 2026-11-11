"use client";
import { useMemo, useState } from "react";
import { Download, Phone, Mail, MapPin, Search, X } from "lucide-react";
import { PayBadge, StatusBadge } from "@/components/admin/Badges";
import { ORDER_STATUSES, dateTime, exportOrdersCsv, useOrders, type Order } from "@/lib/admin";
import { money } from "@/lib/products";
import { btnGhost, card, inputCls, th } from "@/lib/ui";

const tabs = ["all", "unpaid", "paid", "processing", "shipped", "delivered", "cancelled"] as const;
type Tab = (typeof tabs)[number];

export default function OrdersPage() {
  const { orders, loading, setStatus } = useOrders();
  const [tab, setTab] = useState<Tab>("all");
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const matches = (o: Order, t: Tab) => (t === "all" ? true : t === "unpaid" || t === "paid" ? o.payment_status === t : o.status === t);
  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return orders.filter(o => matches(o, tab) && (!needle || [String(o.order_no), o.customer_name, o.email, o.reference, o.phone].some(v => v.toLowerCase().includes(needle))));
  }, [orders, tab, q]);
  const open = orders.find(o => o.id === openId) ?? null;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h2 className="text-xl font-semibold">Orders</h2><p className="text-sm text-muted">Everything customers have ordered, live.</p></div>
        <button onClick={() => exportOrdersCsv(rows)} disabled={!rows.length} className={btnGhost}><Download size={15} /> Export CSV</button>
      </div>

      <div className={card}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-4">
          <div className="flex flex-wrap gap-1">
            {tabs.map(t => <button key={t} onClick={() => setTab(t)} className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${tab === t ? "bg-accent text-accent-ink" : "text-muted hover:bg-surface-2"}`}>{t}<span className="ml-1.5 opacity-70">{orders.filter(o => matches(o, t)).length}</span></button>)}
          </div>
          <label className="relative w-full sm:w-64"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search name, email, order #" className={`${inputCls} pl-9`} /></label>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-surface-2"><tr><th className={th}>Order</th><th className={th}>Customer</th><th className={th}>Items</th><th className={th}>Total</th><th className={th}>Payment</th><th className={th}>Status</th></tr></thead>
            <tbody className="divide-y divide-line">
              {rows.map(o => (
                <tr key={o.id} onClick={() => setOpenId(o.id)} className="cursor-pointer hover:bg-surface-2">
                  <td className="px-4 py-3 font-medium">#{o.order_no}<span className="block text-[11px] font-normal text-muted">{dateTime(o.created_at)}</span></td>
                  <td className="px-4 py-3">{o.customer_name}<span className="block text-[11px] text-muted">{o.email}</span></td>
                  <td className="px-4 py-3 text-muted">{o.items.reduce((n, i) => n + i.quantity, 0)} item(s)</td>
                  <td className="px-4 py-3 font-medium">{money(o.total)}</td>
                  <td className="px-4 py-3"><PayBadge value={o.payment_status} /></td>
                  <td className="px-4 py-3"><StatusBadge value={o.status} /></td>
                </tr>
              ))}
              {!rows.length && <tr><td colSpan={6} className="px-5 py-14 text-center text-sm text-muted">{loading ? "Loading…" : "No orders match."}</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60" onClick={() => setOpenId(null)}>
          <aside onClick={e => e.stopPropagation()} className="h-full w-full max-w-md overflow-y-auto border-l border-line bg-surface p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div><p className="text-xs text-muted">{dateTime(open.created_at)}</p><h3 className="text-xl font-semibold">Order #{open.order_no}</h3></div>
              <button onClick={() => setOpenId(null)} aria-label="Close" className="rounded p-2 hover:bg-surface-2"><X size={18} /></button>
            </div>
            <div className="mt-3 flex gap-2"><PayBadge value={open.payment_status} /><StatusBadge value={open.status} /></div>

            <h4 className="mt-6 text-xs font-semibold uppercase tracking-wide text-muted">Items</h4>
            <ul className="mt-2 divide-y divide-line text-sm">
              {open.items.map((i, idx) => <li key={idx} className="flex justify-between py-2"><span>{i.name}{i.size ? ` (size ${i.size})` : ""} × {i.quantity}</span><span className="font-medium">{money(i.price * i.quantity)}</span></li>)}
              <li className="flex justify-between py-3 text-base font-semibold"><span>Total</span><span>{money(open.total)}</span></li>
            </ul>

            <h4 className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted">Customer</h4>
            <div className="mt-2 space-y-2 text-sm">
              <p className="font-medium">{open.customer_name}</p>
              <a href={`mailto:${open.email}`} className="flex items-center gap-2 text-accent-text"><Mail size={14} />{open.email}</a>
              <a href={`tel:${open.phone}`} className="flex items-center gap-2 text-accent-text"><Phone size={14} />{open.phone}</a>
              <p className="flex items-start gap-2 text-muted"><MapPin size={14} className="mt-0.5 shrink-0" />{open.address}, {open.city}, {open.state}</p>
              {open.notes && <p className="rounded-xl bg-amber-500/10 p-3 text-xs text-amber-500">Note: {open.notes}</p>}
            </div>

            <h4 className="mt-6 text-xs font-semibold uppercase tracking-wide text-muted">Update status</h4>
            <div className="mt-2 flex flex-wrap gap-2">
              {ORDER_STATUSES.map(s => <button key={s} onClick={() => setStatus(open.id, s)} className={`rounded-full border px-3 py-1.5 text-xs font-semibold capitalize ${open.status === s ? "border-accent bg-accent text-accent-ink" : "border-line hover:border-accent"}`}>{s}</button>)}
            </div>
            <p className="mt-6 break-all text-[11px] text-muted">Payment reference: {open.reference}{open.paid_at ? ` · paid ${dateTime(open.paid_at)}` : ""}</p>
          </aside>
        </div>
      )}
    </div>
  );
}

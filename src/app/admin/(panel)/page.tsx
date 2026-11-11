"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { Download } from "lucide-react";
import { AreaChart, Radar, Sparkline } from "@/components/admin/charts";
import { PayBadge, StatusBadge } from "@/components/admin/Badges";
import { dateTime, exportOrdersCsv, isPaid, useOrders } from "@/lib/admin";
import { useInbox } from "@/lib/chat";
import { money } from "@/lib/products";
import { btnGhost, card, th } from "@/lib/ui";

const keyOf = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
const lastDays = (n: number) => Array.from({ length: n }, (_, i) => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - (n - 1 - i)); return d; });

function Stat({ label, value, sub, color, data }: { label: string; value: string; sub: string; color: string; data: number[] }) {
  return (
    <div className="flex items-center justify-between gap-2 p-5">
      <div className="min-w-0">
        <p className="text-3xl font-semibold tracking-tight">{value}</p>
        <p className="mt-1 text-sm font-semibold" style={{ color }}>{label}</p>
        <p className="mt-1 text-xs text-muted">{sub}</p>
      </div>
      <Sparkline data={data} color={color} />
    </div>
  );
}

export default function Dashboard() {
  const { orders, loading } = useOrders();
  const { threads } = useInbox();
  const [range, setRange] = useState<7 | 30 | 90>(30);

  const m = useMemo(() => {
    const rev = new Map<string, number>(), cnt = new Map<string, number>(), msg = new Map<string, number>();
    orders.forEach(o => {
      const k = keyOf(new Date(o.created_at));
      cnt.set(k, (cnt.get(k) ?? 0) + 1);
      if (isPaid(o)) { const pk = keyOf(new Date(o.paid_at ?? o.created_at)); rev.set(pk, (rev.get(pk) ?? 0) + o.total); }
    });
    threads.forEach(t => t.messages.forEach(x => { if (x.sender === "customer") { const k = keyOf(new Date(x.createdAt)); msg.set(k, (msg.get(k) ?? 0) + 1); } }));
    const series = (days: Date[], map: Map<string, number>) => days.map(d => map.get(keyOf(d)) ?? 0);
    const d14 = lastDays(14), dr = lastDays(range);
    const paid = orders.filter(isPaid);
    const today = keyOf(new Date());
    const catMap = new Map<string, number>();
    paid.forEach(o => o.items.forEach(i => catMap.set(i.category, (catMap.get(i.category) ?? 0) + i.price * i.quantity)));
    const cats = [...catMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
    while (cats.length < 3) cats.push(["—", 0]);
    return {
      revenue: paid.reduce((n, o) => n + o.total, 0), paidCount: paid.length,
      todayRev: rev.get(today) ?? 0, todayOrders: cnt.get(today) ?? 0,
      customerMsgs: threads.reduce((n, t) => n + t.messages.filter(x => x.sender === "customer").length, 0),
      spark: { rev: series(d14, rev), cnt: series(d14, cnt), msg: series(d14, msg), paid: d14.map(d => paid.filter(o => keyOf(new Date(o.paid_at ?? o.created_at)) === keyOf(d)).length) },
      chart: { labels: dr.map(d => d.toLocaleDateString("en-NG", { day: "numeric", month: "short" })), rev: series(dr, rev), cnt: series(dr, cnt) },
      cats,
    };
  }, [orders, threads, range]);

  const conversion = orders.length ? Math.round((m.paidCount / orders.length) * 100) : 0;
  const rangeRevenue = m.chart.rev.reduce((a, b) => a + b, 0);
  const rangeOrders = m.chart.cnt.reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
        <div><h2 className="text-xl font-semibold">Welcome back 👋</h2><p className="text-sm text-muted">Here is what is happening with IVAN today.</p></div>
        <button onClick={() => exportOrdersCsv(orders)} disabled={!orders.length} className={btnGhost}><Download size={15} /> Export orders</button>
      </div>

      <section className={`${card} grid divide-y divide-line sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x`}>
        <Stat label="Revenue" value={money(m.revenue)} sub={`Today ${money(m.todayRev)}`} color="var(--accent-text)" data={m.spark.rev} />
        <Stat label="Orders" value={String(orders.length)} sub={`Today +${m.todayOrders}`} color="#38bdf8" data={m.spark.cnt} />
        <Stat label="Paid orders" value={String(m.paidCount)} sub={`${conversion}% conversion`} color="#a78bfa" data={m.spark.paid} />
        <Stat label="Conversations" value={String(threads.length)} sub={`${m.customerMsgs} customer message${m.customerMsgs === 1 ? "" : "s"}`} color="var(--hot)" data={m.spark.msg} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.9fr_1fr]">
        <div className={`${card} p-6`}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div><h3 className="text-sm font-semibold">Sales statistics overview</h3><p className="text-xs text-muted">Revenue from paid orders and new orders over time</p></div>
            <div className="flex gap-1 text-xs font-semibold">
              {([7, 30, 90] as const).map(r => <button key={r} onClick={() => setRange(r)} className={`rounded-full px-3 py-1 ${range === r ? "bg-accent text-accent-ink" : "text-muted hover:bg-surface-2"}`}>{r}D</button>)}
            </div>
          </div>
          <div className="mt-5 flex flex-wrap items-end gap-x-10 gap-y-3">
            <div><p className="text-sm text-muted">Total orders</p><p className="text-2xl font-semibold">{rangeOrders}</p></div>
            <div><p className="text-sm text-muted">Total revenue</p><p className="text-2xl font-semibold">{money(rangeRevenue)}</p></div>
            <div className="ml-auto flex gap-4 text-xs text-muted"><span className="flex items-center gap-1.5"><i className="h-0.5 w-4 bg-accent" />Revenue</span><span className="flex items-center gap-1.5"><i className="h-0.5 w-4 bg-hot" />Orders (scaled)</span></div>
          </div>
          <div className="mt-4">
            <AreaChart labels={m.chart.labels} format={n => (n >= 1000 ? `${Math.round(n / 1000)}k` : String(n))} series={[{ name: "Revenue", color: "var(--accent-text)", data: m.chart.rev }, { name: "Orders", color: "var(--hot)", data: m.chart.cnt, scaleToFirst: true }]} />
          </div>
        </div>
        <div className={`${card} p-6`}>
          <h3 className="text-sm font-semibold">Revenue by category</h3>
          <p className="text-xs text-muted">Paid orders only</p>
          <div className="mt-4"><Radar axes={m.cats.map(c => c[0])} values={m.cats.map(c => c[1])} /></div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className={card}>
          <div className="flex items-center justify-between px-6 py-4"><h3 className="text-sm font-semibold">Recent orders</h3><Link href="/admin/orders" className="text-xs font-medium text-accent-text hover:underline">View all</Link></div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="bg-surface-2"><tr><th className={th}>Order</th><th className={th}>Customer</th><th className={th}>Total</th><th className={th}>Payment</th><th className={th}>Status</th></tr></thead>
              <tbody className="divide-y divide-line">
                {orders.slice(0, 6).map(o => (
                  <tr key={o.id} className="hover:bg-surface-2"><td className="px-4 py-3 font-medium">#{o.order_no}<span className="block text-[11px] font-normal text-muted">{dateTime(o.created_at)}</span></td><td className="px-4 py-3">{o.customer_name}</td><td className="px-4 py-3 font-medium">{money(o.total)}</td><td className="px-4 py-3"><PayBadge value={o.payment_status} /></td><td className="px-4 py-3"><StatusBadge value={o.status} /></td></tr>
                ))}
                {!orders.length && <tr><td colSpan={5} className="px-6 py-10 text-center text-sm text-muted">{loading ? "Loading…" : "No orders yet. They will appear here the moment someone checks out."}</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
        <div className={card}>
          <div className="flex items-center justify-between px-6 py-4"><h3 className="text-sm font-semibold">Latest chats</h3><Link href="/admin/inbox" className="text-xs font-medium text-accent-text hover:underline">Open inbox</Link></div>
          <ul className="divide-y divide-line">
            {threads.slice(0, 5).map(t => {
              const last = t.messages[t.messages.length - 1];
              return <li key={t.id}><Link href="/admin/inbox" className="flex items-center gap-3 px-6 py-3 hover:bg-surface-2"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-ink">{t.name.slice(-4, -2)}</span><span className="min-w-0"><span className="block text-sm font-medium">{t.name}</span><span className="block truncate text-xs text-muted">{last?.body ?? "No messages"}</span></span></Link></li>;
            })}
            {!threads.length && <li className="px-6 py-10 text-center text-sm text-muted">No conversations right now.</li>}
          </ul>
        </div>
      </section>
    </div>
  );
}

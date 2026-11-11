"use client";
import { PayBadge } from "@/components/admin/Badges";
import { dateTime, isPaid, useOrders, usePayments } from "@/lib/admin";
import { money } from "@/lib/products";
import { card, th } from "@/lib/ui";

export default function PaymentsPage() {
  const { payments, loading } = usePayments();
  const { orders } = useOrders();
  const received = payments.filter(p => p.status === "success");
  const total = received.reduce((n, p) => n + p.amount, 0);
  const waiting = orders.filter(o => o.payment_status === "unpaid");
  const waitingTotal = waiting.reduce((n, o) => n + o.total, 0);
  const average = received.length ? Math.round(total / received.length) : 0;

  return (
    <div className="space-y-6">
      <div><h2 className="text-xl font-semibold">Payments</h2><p className="text-sm text-muted">Money that has landed through Paystack, plus orders still waiting to be paid.</p></div>

      <section className={`${card} grid divide-y divide-line sm:grid-cols-3 sm:divide-x sm:divide-y-0`}>
        <div className="p-5"><p className="text-3xl font-semibold">{money(total)}</p><p className="mt-1 text-sm font-semibold text-accent-text">Total received</p></div>
        <div className="p-5"><p className="text-3xl font-semibold">{received.length}</p><p className="mt-1 text-sm font-semibold text-sky-400">Successful payments · avg {money(average)}</p></div>
        <div className="p-5"><p className="text-3xl font-semibold">{money(waitingTotal)}</p><p className="mt-1 text-sm font-semibold text-amber-500">Awaiting payment · {waiting.length} order(s)</p></div>
      </section>

      <div className={card}>
        <h3 className="px-6 py-4 text-sm font-semibold">Payment history</h3>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="bg-surface-2"><tr><th className={th}>Date</th><th className={th}>Order</th><th className={th}>Customer</th><th className={th}>Amount</th><th className={th}>Provider</th><th className={th}>Reference</th></tr></thead>
            <tbody className="divide-y divide-line">
              {payments.map(p => (
                <tr key={p.id} className="hover:bg-surface-2">
                  <td className="px-4 py-3">{dateTime(p.created_at)}</td>
                  <td className="px-4 py-3 font-medium">{p.orders ? `#${p.orders.order_no}` : "—"}</td>
                  <td className="px-4 py-3">{p.orders?.customer_name ?? "—"}<span className="block text-[11px] text-muted">{p.orders?.email}</span></td>
                  <td className="px-4 py-3 font-semibold text-accent-text">{money(p.amount)}</td>
                  <td className="px-4 py-3 capitalize">{p.provider}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted">{p.reference}</td>
                </tr>
              ))}
              {!payments.length && <tr><td colSpan={6} className="px-6 py-14 text-center text-sm text-muted">{loading ? "Loading…" : "No payments yet."}</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {waiting.length > 0 && (
        <div className={card}>
          <h3 className="px-6 py-4 text-sm font-semibold">Waiting for payment</h3>
          <ul className="divide-y divide-line">
            {waiting.filter(o => !isPaid(o)).slice(0, 10).map(o => <li key={o.id} className="flex items-center justify-between gap-3 px-6 py-3 text-sm"><span>#{o.order_no} · {o.customer_name}<span className="ml-2 text-xs text-muted">{dateTime(o.created_at)}</span></span><span className="flex items-center gap-3"><b>{money(o.total)}</b><PayBadge value={o.payment_status} /></span></li>)}
          </ul>
        </div>
      )}
    </div>
  );
}

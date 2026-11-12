import type { OrderStatus, PaymentStatus, RequestStatus } from "@/lib/admin";

const base = "inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize";
const pay: Record<PaymentStatus, string> = { paid: "bg-accent/20 text-accent-text", unpaid: "bg-amber-500/15 text-amber-500", failed: "bg-hot/15 text-hot" };
const status: Record<OrderStatus, string> = {
  pending: "bg-surface-2 text-muted", processing: "bg-amber-500/15 text-amber-500", shipped: "bg-accent/20 text-accent-text",
  delivered: "bg-accent/20 text-accent-text", cancelled: "bg-hot/15 text-hot",
};
const request: Record<RequestStatus, string> = {
  new: "bg-accent/20 text-accent-text", in_progress: "bg-amber-500/15 text-amber-500", quoted: "bg-text/10 text-text",
  completed: "bg-surface-2 text-muted", cancelled: "bg-hot/15 text-hot",
};

export const PayBadge = ({ value }: { value: PaymentStatus }) => <span className={`${base} ${pay[value]}`}>{value}</span>;
export const StatusBadge = ({ value }: { value: OrderStatus }) => <span className={`${base} ${status[value]}`}>{value}</span>;
export const RequestBadge = ({ value }: { value: RequestStatus }) => <span className={`${base} ${request[value]}`}>{value.replace("_", " ")}</span>;

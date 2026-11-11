"use client";
import { useEffect, useState } from "react";
import { ExternalLink, Mail, MessageCircle, Trash2, X } from "lucide-react";
import { RequestBadge } from "@/components/admin/Badges";
import { REQUEST_STATUSES, dateTime, useCustomRequests, type CustomRequest } from "@/lib/admin";
import { tryDb } from "@/lib/supabase/browser";
import { useToasts } from "@/lib/toast";
import { btnGhost, card, th } from "@/lib/ui";

export default function CustomRequestsPage() {
  const { requests, loading, reload } = useCustomRequests();
  const push = useToasts(s => s.push);
  const [openId, setOpenId] = useState<string | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const open = requests.find(r => r.id === openId) ?? null;

  useEffect(() => {
    setFileUrl(null);
    const path = open?.reference_path;
    if (!path) return;
    tryDb()?.storage.from("custom-references").createSignedUrl(path, 3600).then(({ data }) => setFileUrl(data?.signedUrl ?? null));
  }, [open?.id, open?.reference_path]);

  async function setStatus(r: CustomRequest, status: CustomRequest["status"]) {
    await tryDb()?.from("custom_requests").update({ status }).eq("id", r.id);
    reload();
  }
  async function remove(r: CustomRequest) {
    if (!window.confirm(`Delete the request from ${r.name}? Its reference file is deleted too.`)) return;
    const db = tryDb();
    if (!db) return;
    if (r.reference_path) await db.storage.from("custom-references").remove([r.reference_path]);
    const { error } = await db.from("custom_requests").delete().eq("id", r.id);
    if (error) return push({ title: "Could not delete", body: error.message, tone: "pink" });
    setOpenId(null);
    reload();
  }

  const isImage = open?.reference_path && /\.(png|jpe?g|webp)$/i.test(open.reference_path);
  const digits = open?.phone?.replace(/\D/g, "");

  return (
    <div className="space-y-5">
      <div><h2 className="text-xl font-semibold">Custom requests</h2><p className="text-sm text-muted">Ideas customers sent through the custom studio.</p></div>

      <div className={card}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="bg-surface-2"><tr><th className={th}>Customer</th><th className={th}>Piece</th><th className={th}>Vibe</th><th className={th}>Received</th><th className={th}>Status</th></tr></thead>
            <tbody className="divide-y divide-line">
              {requests.map(r => (
                <tr key={r.id} onClick={() => setOpenId(r.id)} className="cursor-pointer hover:bg-surface-2">
                  <td className="px-4 py-3 font-medium">{r.name}<span className="block text-[11px] font-normal text-muted">{r.email}</span></td>
                  <td className="px-4 py-3 text-muted">{r.base_item || "—"}</td>
                  <td className="px-4 py-3 text-muted">{r.styles.join(", ") || "—"}</td>
                  <td className="px-4 py-3 text-muted">{dateTime(r.created_at)}</td>
                  <td className="px-4 py-3"><RequestBadge value={r.status} /></td>
                </tr>
              ))}
              {!requests.length && <tr><td colSpan={5} className="px-6 py-14 text-center text-sm text-muted">{loading ? "Loading…" : "No custom requests yet."}</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60" onClick={() => setOpenId(null)}>
          <aside onClick={e => e.stopPropagation()} className="h-full w-full max-w-md overflow-y-auto border-l border-line bg-surface p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div><p className="text-xs text-muted">{dateTime(open.created_at)}</p><h3 className="text-xl font-semibold">{open.name}</h3></div>
              <button onClick={() => setOpenId(null)} aria-label="Close" className="rounded-full p-2 hover:bg-surface-2"><X size={18} /></button>
            </div>
            <div className="mt-3"><RequestBadge value={open.status} /></div>

            <h4 className="mt-6 text-xs font-semibold uppercase tracking-wide text-muted">The idea</h4>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6">{open.notes}</p>
            <p className="mt-3 text-xs text-muted">Piece: {open.base_item || "not specified"} · Vibe: {open.styles.join(", ") || "not specified"}</p>

            {open.reference_path && (
              <>
                <h4 className="mt-6 text-xs font-semibold uppercase tracking-wide text-muted">Reference</h4>
                {fileUrl ? (isImage
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <a href={fileUrl} target="_blank" rel="noreferrer"><img src={fileUrl} alt="Customer reference" className="mt-2 max-h-72 w-full rounded-2xl border border-line object-contain" /></a>
                  : <a href={fileUrl} target="_blank" rel="noreferrer" className={`${btnGhost} mt-2`}><ExternalLink size={14} /> Open the file</a>
                ) : <p className="mt-2 text-xs text-muted">Loading file…</p>}
              </>
            )}

            <h4 className="mt-6 text-xs font-semibold uppercase tracking-wide text-muted">Contact</h4>
            <div className="mt-2 flex flex-wrap gap-2">
              <a href={`mailto:${open.email}`} className={btnGhost}><Mail size={14} /> {open.email}</a>
              {digits && <a href={`https://wa.me/${digits}`} target="_blank" rel="noreferrer" className={btnGhost}><MessageCircle size={14} /> WhatsApp</a>}
            </div>

            <h4 className="mt-6 text-xs font-semibold uppercase tracking-wide text-muted">Update status</h4>
            <div className="mt-2 flex flex-wrap gap-2">
              {REQUEST_STATUSES.map(s => <button key={s} onClick={() => setStatus(open, s)} className={`rounded-full border px-3 py-1.5 text-xs font-semibold capitalize ${open.status === s ? "border-accent bg-accent text-accent-ink" : "border-line hover:border-accent"}`}>{s.replace("_", " ")}</button>)}
            </div>
            <button onClick={() => remove(open)} className="mt-8 flex items-center gap-2 text-xs text-muted hover:text-hot"><Trash2 size={14} /> Delete this request</button>
          </aside>
        </div>
      )}
    </div>
  );
}

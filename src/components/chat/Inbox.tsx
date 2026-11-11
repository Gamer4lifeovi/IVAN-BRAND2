"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Trash2 } from "lucide-react";
import { clearAllConversations, clearConversation, sendStaffMessage, useInbox } from "@/lib/chat";
import { useToasts } from "@/lib/toast";
import { Bubble, Composer, SecurePill, time } from "./ChatParts";

/** Staff inbox. Protected by src/middleware.ts and by RLS in Supabase. */
export default function Inbox() {
  const { threads, reload } = useInbox();
  const push = useToasts(s => s.push);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const active = threads.find(t => t.id === activeId) ?? null;
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [active?.messages.length, activeId]);

  async function clearOne() {
    if (!active) return;
    if (!window.confirm(`End and clear the conversation with ${active.name}? All of its messages will be deleted. This cannot be undone.`)) return;
    setBusy(true);
    const { error } = await clearConversation(active.id);
    setBusy(false);
    if (error) return push({ title: "Could not clear the chat", body: error, tone: "pink" });
    setActiveId(null);
    reload();
    push({ title: "Conversation cleared", body: `${active.name} was ended and removed from your inbox`, tone: "green" });
  }

  async function clearAll() {
    if (!window.confirm(`Clear ALL ${threads.length} conversation(s)? Every message will be deleted. This cannot be undone.`)) return;
    setBusy(true);
    const { error } = await clearAllConversations();
    setBusy(false);
    if (error) return push({ title: "Could not clear the chats", body: error, tone: "pink" });
    setActiveId(null);
    reload();
    push({ title: "Inbox cleared", tone: "green" });
  }

  return (
    <div className="grid min-h-[70vh] gap-4 md:grid-cols-[330px_1fr]">
      <aside className={`${active ? "hidden md:block" : "block"} rounded-[28px] border border-line bg-surface p-4`}>
        <div className="mb-4 flex items-center justify-center gap-2"><span className="text-sm font-bold">Chats</span><SecurePill /></div>
        {threads.length === 0 && <p className="p-4 text-center text-xs text-muted">No conversations right now. New customer messages will show up here.</p>}
        <ul className="divide-y divide-line">
          {threads.map(t => {
            const last = t.messages[t.messages.length - 1];
            return (
              <li key={t.id}>
                <button onClick={() => setActiveId(t.id)} className={`flex w-full items-start gap-3 rounded-xl px-2 py-3 text-left transition hover:bg-surface-2 ${t.id === activeId ? "bg-surface-2" : ""}`}>
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-black text-accent-ink">{t.name.slice(-4, -2)}</span>
                  <span className="min-w-0 flex-1">
                    <span className="flex justify-between"><span className="text-sm font-bold">{t.name}</span><span className="text-[10px] text-muted">{last && time(last.createdAt)}</span></span>
                    <span className="block truncate text-xs text-muted">{last?.body}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        {threads.length > 1 && <button onClick={clearAll} disabled={busy} className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-line py-2.5 text-xs font-semibold text-muted transition hover:border-hot hover:text-hot disabled:opacity-50"><Trash2 size={13} /> Clear all chats</button>}
      </aside>

      <section className={`${active ? "flex" : "hidden md:flex"} flex-col gap-3 rounded-[28px] border border-line bg-surface p-4`}>
        {active ? (
          <>
            <div className="flex items-center gap-3 rounded-2xl bg-surface-2 px-3 py-2.5">
              <button onClick={() => setActiveId(null)} aria-label="Back" className="md:hidden"><ArrowLeft size={18} /></button>
              <p className="flex-1 text-sm font-bold">{active.name}</p>
              <button onClick={clearOne} disabled={busy} className="flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-muted transition hover:border-hot hover:text-hot disabled:opacity-50"><Trash2 size={13} /> End &amp; clear chat</button>
            </div>
            <div className="flex min-h-[320px] flex-1 flex-col gap-2 overflow-y-auto rounded-3xl bg-bg p-3">
              {active.messages.map(m => <Bubble key={m.id} m={m} viewer="staff" />)}
              <div ref={endRef} />
            </div>
            <Composer onSend={text => sendStaffMessage(active.id, text)} />
          </>
        ) : <p className="m-auto text-xs text-muted">Select a conversation</p>}
      </section>
    </div>
  );
}

"use client";
import { useState } from "react";
import { Mic, Paperclip, Send } from "lucide-react";
import type { Message, Sender } from "@/lib/chat";

export const time = (ts: number) => new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

export function SecurePill() {
  return <span className="rounded-full bg-accent px-2 py-[2px] text-[9px] font-bold lowercase text-accent-ink">secure connection</span>;
}

export function Bubble({ m, viewer }: { m: Message; viewer: Sender }) {
  const mine = m.sender === viewer;
  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-snug ${mine ? "bg-accent text-accent-ink" : "bg-surface-2 text-text"}`}>
        <p className="whitespace-pre-wrap break-words">{m.body}</p>
        <p className={`mt-1 text-right text-[9px] ${mine ? "text-accent-ink/55" : "text-muted"}`}>{time(m.createdAt)}</p>
      </div>
    </div>
  );
}

export function Composer({ onSend }: { onSend: (text: string) => void }) {
  const [text, setText] = useState("");
  const submit = () => { if (!text.trim()) return; onSend(text); setText(""); };
  return (
    <div className="flex items-center gap-2">
      <button type="button" disabled title="Attachments coming soon" aria-label="Attach file" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-surface-2 text-muted"><Paperclip size={16} /></button>
      <input
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter") submit(); }}
        placeholder="Message IVAN…"
        maxLength={2000}
        className="h-10 min-w-0 flex-1 rounded-full border border-line bg-surface-2 px-4 text-[13px] text-text outline-none placeholder:text-muted focus:border-accent"
      />
      <button type="button" onClick={submit} disabled={!text.trim()} aria-label={text.trim() ? "Send message" : "Voice notes coming soon"} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-accent/60 bg-accent/15 text-accent-text transition hover:bg-accent hover:text-accent-ink disabled:opacity-60 disabled:hover:bg-accent/15 disabled:hover:text-accent-text">
        {text.trim() ? <Send size={16} /> : <Mic size={16} />}
      </button>
    </div>
  );
}

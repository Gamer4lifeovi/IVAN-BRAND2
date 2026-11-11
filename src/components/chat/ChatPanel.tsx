"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { Lock, Maximize2, X } from "lucide-react";
import { useMyChat } from "@/lib/chat";
import { Bubble, Composer, SecurePill } from "./ChatParts";

type Props = {
  /** Start the chat session (signs the visitor in quietly). */
  active: boolean;
  /** Shows a close button (floating widget). */
  onClose?: () => void;
  /** Full-page version: hides the expand button. */
  large?: boolean;
  className?: string;
};

export default function ChatPanel({ active, onClose, large = false, className = "" }: Props) {
  const { messages, send, error } = useMyChat(active);
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages.length]);

  return (
    <section aria-label="Chat with IVAN" className={`flex flex-col gap-3 rounded-[32px] border border-line bg-surface p-4 text-text shadow-[0_0_90px_-25px_var(--glow)] ${className}`}>
      <div className="flex items-center justify-center gap-2 pt-1">
        <span className="display-font text-xl text-text">IVAN<span className="text-hot">®</span></span>
        <SecurePill />
      </div>

      <div className="flex items-center gap-3 rounded-2xl bg-surface-2 px-3 py-2.5">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-sm font-black text-accent-ink">I</div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold">IVAN Team</p>
          <p className="text-[11px] text-muted">We usually reply within a few hours</p>
        </div>
        {!large && <Link href="/chat" aria-label="Open the bigger chat" title="Open bigger chat" className="rounded-full p-2 text-muted transition hover:bg-line hover:text-accent-text"><Maximize2 size={16} /></Link>}
        {onClose && <button onClick={onClose} aria-label="Close chat" className="rounded-full p-2 text-muted transition hover:bg-line hover:text-text"><X size={18} /></button>}
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto rounded-3xl bg-bg p-3 [scrollbar-width:none]">
        {!messages.length && (
          <div className="m-auto max-w-[260px] text-center">
            <Lock size={18} className="mx-auto text-accent-text" />
            <p className="mt-3 text-sm font-bold">Say hi 👋</p>
            <p className="mt-1 text-xs leading-5 text-muted">Ask about a drop, sizing, or a custom piece. Only you and the IVAN team can see this conversation.</p>
          </div>
        )}
        {messages.map(m => <Bubble key={m.id} m={m} viewer="customer" />)}
        <div ref={endRef} />
      </div>

      {error && <p className="px-2 text-[11px] text-hot">{error}</p>}
      <Composer onSend={send} />
    </section>
  );
}

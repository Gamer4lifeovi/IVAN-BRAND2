"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { tryDb } from "./supabase/browser";

export type Notice = { id: string; kind: "order" | "payment" | "chat" | "custom"; title: string; body: string; link: string | null; read: boolean; createdAt: number };
type Row = { id: string; kind: Notice["kind"]; title: string; body: string; link: string | null; read: boolean; created_at: string };
const toNotice = (r: Row): Notice => ({ id: r.id, kind: r.kind, title: r.title, body: r.body, link: r.link, read: r.read, createdAt: new Date(r.created_at).getTime() });

/** Live staff notifications (new orders, payments, chat messages). `onNew` fires for each notification that arrives while the panel is open. */
export function useNotifications(onNew: (n: Notice) => void) {
  const [items, setItems] = useState<Notice[]>([]);
  const cb = useRef(onNew);
  useEffect(() => { cb.current = onNew; });

  useEffect(() => {
    const db = tryDb();
    if (!db) return;
    db.from("notifications").select("*").order("created_at", { ascending: false }).limit(40).then(({ data }) => {
      setItems(((data as Row[] | null) ?? []).map(toNotice));
    });
    const channel = db
      .channel("notifications-live")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications" }, p => {
        const n = toNotice(p.new as Row);
        setItems(prev => (prev.some(x => x.id === n.id) ? prev : [n, ...prev]));
        cb.current(n);
      })
      .subscribe();
    return () => { db.removeChannel(channel); };
  }, []);

  const markRead = useCallback(async (ids: string[]) => {
    const db = tryDb();
    if (!db || !ids.length) return;
    setItems(prev => prev.map(i => (ids.includes(i.id) ? { ...i, read: true } : i)));
    await db.from("notifications").update({ read: true }).in("id", ids);
  }, []);

  return { items, unread: items.filter(i => !i.read).length, unreadChats: items.filter(i => !i.read && i.kind === "chat").length, markRead };
}

export function beep() {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = "sine"; osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.15, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
    osc.start(); osc.stop(ctx.currentTime + 0.4);
  } catch { /* sound is optional */ }
}

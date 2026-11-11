"use client";
import { useCallback, useEffect, useState } from "react";
import { getSupabaseClient, supabase } from "./supabase/client";

/**
 * SUPABASE CHAT LAYER
 * Customers sign in anonymously (only when they open the chat), get exactly one
 * thread, and Row Level Security (supabase/chat.sql) guarantees they can only
 * read/write that thread. Staff (public.staff) can see every thread.
 */

export type Sender = "customer" | "staff";
export type Message = { id: string; sender: Sender; body: string; createdAt: number };
export type Thread = { id: string; customerId: string; name: string; messages: Message[]; updatedAt: number };

type MessageRow = { id: string; sender_id: string | null; body: string; created_at: string };
const toMessage = (r: MessageRow, customerId: string): Message => ({
  id: r.id,
  sender: r.sender_id !== null && r.sender_id === customerId ? "customer" : "staff",
  body: r.body,
  createdAt: new Date(r.created_at).getTime(),
});

/** Customer side: one conversation, their own. Pass enabled=true when the chat opens. */
export function useMyChat(enabled: boolean) {
  const [uid, setUid] = useState<string | null>(null);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const client = supabase ?? getSupabaseClient();
    if (!enabled || uid || !client) {
      if (!enabled || uid) return;
      setError("Supabase is not configured.");
      return;
    }
    (async () => {
      try {
        let { data: { session } } = await client.auth.getSession();
        if (!session) {
          const { data, error } = await client.auth.signInAnonymously();
          if (error) throw error;
          session = data.session;
        }
        const id = session!.user.id;
        setUid(id);
        const { data: t } = await client.from("threads").select("id").eq("customer_id", id).maybeSingle();
        if (t) setThreadId(t.id);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not start chat");
      }
    })();
  }, [enabled, uid]);

  useEffect(() => {
    const client = supabase ?? getSupabaseClient();
    if (!threadId || !uid || !client) return;
    const load = async () => {
      const { data } = await client.from("messages").select("id,sender_id,body,created_at").eq("thread_id", threadId).order("created_at");
      setMessages((data ?? []).map(r => toMessage(r, uid)));
    };
    const channel = client
      .channel(`thread:${threadId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `thread_id=eq.${threadId}` }, p => {
        const m = toMessage(p.new as MessageRow, uid);
        setMessages(prev => (prev.some(x => x.id === m.id) ? prev : [...prev, m]));
      })
      .subscribe(status => { if (status === "SUBSCRIBED") load(); });
    return () => { client.removeChannel(channel); };
  }, [threadId, uid]);

  const send = useCallback(async (text: string) => {
    const client = supabase ?? getSupabaseClient();
    const body = text.trim();
    if (!uid || !body || !client) return;
    setError(null);
    let tid = threadId;
    if (!tid) {
      const { data, error } = await client.from("threads").insert({ customer_id: uid }).select("id").single();
      if (error) { setError(error.message); return; }
      tid = data.id;
      setThreadId(tid);
    }
    const { error } = await client.from("messages").insert({ thread_id: tid, sender_id: uid, body });
    if (error) setError(error.message);
  }, [uid, threadId]);

  return { messages, send, error };
}

/** Staff side: every conversation that has messages, live. RLS returns nothing for non-staff users. */
export function useInbox() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [tick, setTick] = useState(0);
  const reload = useCallback(() => setTick(t => t + 1), []);

  useEffect(() => {
    const client = supabase ?? getSupabaseClient();
    if (!client) return;
    const load = async () => {
      const { data } = await client
        .from("threads")
        .select("id,customer_id,created_at,messages(id,sender_id,body,created_at)")
        .order("created_at", { referencedTable: "messages" });
      const list: Thread[] = (data ?? []).map(t => {
        const msgs = (t.messages as MessageRow[]).map(r => toMessage(r, t.customer_id));
        return {
          id: t.id,
          customerId: t.customer_id,
          name: `Guest ${t.id.slice(0, 4).toUpperCase()}`,
          messages: msgs,
          updatedAt: msgs.length ? msgs[msgs.length - 1].createdAt : new Date(t.created_at).getTime(),
        };
      });
      // cleared conversations have no messages left, so they drop out of the list
      setThreads(list.filter(t => t.messages.length > 0).sort((a, b) => b.updatedAt - a.updatedAt));
    };
    load();
    const channel = client
      .channel("inbox")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, load)
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "messages" }, load)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "threads" }, load)
      .subscribe();
    return () => { client.removeChannel(channel); };
  }, [tick]);

  return { threads, reload };
}

/** Ends a conversation: deletes every message in it (the customer can start fresh and gets a new welcome). */
export async function clearConversation(threadId: string) {
  const client = supabase ?? getSupabaseClient();
  if (!client) return { error: "Supabase is not configured" };
  const { error } = await client.from("messages").delete().eq("thread_id", threadId);
  return { error: error?.message ?? null };
}

/** Clears every conversation at once. */
export async function clearAllConversations() {
  const client = supabase ?? getSupabaseClient();
  if (!client) return { error: "Supabase is not configured" };
  const { error } = await client.from("messages").delete().not("id", "is", null);
  return { error: error?.message ?? null };
}

export async function sendStaffMessage(threadId: string, text: string) {
  const client = supabase ?? getSupabaseClient();
  const body = text.trim();
  if (!body || !client) return;
  const { data: { user } } = await client.auth.getUser();
  if (!user) return;
  await client.from("messages").insert({ thread_id: threadId, sender_id: user.id, body });
}

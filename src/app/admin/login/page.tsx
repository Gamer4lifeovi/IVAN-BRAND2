"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import BrandLogo from "@/components/BrandLogo";
import ThemeToggle from "@/components/ThemeToggle";
import { getSupabaseClient, supabase } from "@/lib/supabase/client";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(
    supabase ? null : "Admin sign-in is unavailable: Supabase is not configured."
  );
  const [busy, setBusy] = useState(false);

  async function login() {
    const client = supabase ?? getSupabaseClient();
    if (!client) {
      setError("Supabase is not configured.");
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const { error } = await client.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not sign in.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center p-6">
      <div className="absolute right-4 top-4"><ThemeToggle /></div>
      <div className="glass glow-accent w-full max-w-sm rounded-[28px] p-7">
        <BrandLogo className="mb-4 w-14" />
        <p className="text-[10px] font-black uppercase tracking-[.3em] text-accent-text">IVAN / Staff only</p>
        <h1 className="display-font mt-3 text-4xl">SIGN IN<span className="text-hot">.</span></h1>
        <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="Email" autoComplete="email" className="mt-6 h-11 w-full rounded-full border border-line bg-surface-2 px-4 text-sm outline-none placeholder:text-muted focus:border-accent" />
        <input value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && login()} type="password" placeholder="Password" autoComplete="current-password" className="mt-3 h-11 w-full rounded-full border border-line bg-surface-2 px-4 text-sm outline-none placeholder:text-muted focus:border-accent" />
        {error && <p className="mt-3 text-xs text-hot">{error}</p>}
        <button onClick={login} disabled={busy} className="mt-5 h-11 w-full rounded-full bg-accent text-sm font-black text-accent-ink disabled:opacity-60">{busy ? "…" : "SIGN IN"}</button>
      </div>
    </main>
  );
}

"use client";
import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowUpRight, CheckCircle2, Loader2, MessageCircle, UploadCloud } from "lucide-react";
import Navbar from "@/components/Navbar";
import { tryDb } from "@/lib/supabase/browser";

const styles = ["Monster Face", "Graffiti Tag", "Anarchy / Punk", "Spray Gradient"];
const bases = ["Cap", "Kicks", "Clogs", "Something else"];
const MAX_MB = 8;
const field = "w-full rounded-2xl border border-line bg-surface px-4 text-sm outline-none transition placeholder:text-muted focus:border-accent";

function Studio() {
  const params = useSearchParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [base, setBase] = useState(params.get("base") ?? "");
  const [chosen, setChosen] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const toggle = (s: string) => setChosen(v => (v.includes(s) ? v.filter(x => x !== s) : [...v, s]));

  function pick(f: File | null) {
    setError(null);
    if (!f) return setFile(null);
    if (f.size > MAX_MB * 1024 * 1024) { setError(`That file is over ${MAX_MB}MB. Please choose a smaller one.`); return; }
    if (!/^(image\/(png|jpe?g|webp)|application\/pdf)$/.test(f.type)) { setError("Please upload a PNG, JPG, WEBP or PDF."); return; }
    setFile(f);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const db = tryDb();
    if (!db) { setError("The studio is offline right now. Please try again shortly."); return; }
    if (notes.trim().length < 5) { setError("Tell us a little more about your idea (at least a few words)."); return; }
    setBusy(true); setError(null);
    try {
      let reference_path: string | null = null;
      if (file) {
        const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-80);
        const path = `${crypto.randomUUID()}/${safe}`;
        const up = await db.storage.from("custom-references").upload(path, file, { contentType: file.type });
        if (up.error) throw new Error("We could not upload your reference. Try a smaller file.");
        reference_path = path;
      }
      const { error } = await db.from("custom_requests").insert({
        name: name.trim(), email: email.trim(), phone: phone.trim() || null,
        base_item: base.trim().slice(0, 60), styles: chosen, notes: notes.trim(), reference_path,
      });
      if (error) throw new Error("We could not send your concept. Please check your details and try again.");
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally { setBusy(false); }
  }

  if (sent) {
    return (
      <div className="glass mx-auto mt-14 max-w-lg rounded-[32px] p-10 text-center">
        <CheckCircle2 className="mx-auto text-accent-text" size={46} />
        <h2 className="display-font mt-5 text-5xl">CONCEPT RECEIVED.</h2>
        <p className="mt-3 text-sm leading-6 text-muted">Thanks, {name.split(" ")[0]}! Your idea is with the IVAN team now. We will reach out on {email} soon. Want to talk it through sooner?</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link href="/chat" className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-xs font-black tracking-[.14em] text-accent-ink"><MessageCircle size={15} /> CHAT WITH US</Link>
          <Link href="/shop" className="rounded-full border border-line px-6 py-3 text-xs font-bold hover:border-accent">BACK TO SHOP</Link>
        </div>
      </div>
    );
  }

  return (
    <form className="mt-12 space-y-8" onSubmit={submit}>
      <label className="block cursor-pointer rounded-[28px] border border-dashed border-line p-8 text-center transition hover:border-accent">
        <UploadCloud className="mx-auto mb-3 text-accent-text" size={30} />
        <span className="block text-xs font-black uppercase tracking-widest">Drop your reference / browse files</span>
        <span className="mt-2 block text-[11px] text-muted">{file ? file.name : `PNG, JPG, WEBP or PDF · up to ${MAX_MB}MB · optional`}</span>
        <input type="file" accept="image/png,image/jpeg,image/webp,application/pdf" className="sr-only" onChange={e => pick(e.target.files?.[0] ?? null)} />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <input required value={name} onChange={e => setName(e.target.value)} placeholder="Your name" autoComplete="name" className={`${field} h-12`} />
        <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" autoComplete="email" className={`${field} h-12`} />
        <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone / WhatsApp (optional)" autoComplete="tel" className={`${field} h-12 sm:col-span-2`} />
      </div>

      <div>
        <p className="mb-3 text-[11px] font-black uppercase tracking-[.2em]">What are we customising?</p>
        <div className="flex flex-wrap gap-2">
          {bases.map(b => <button type="button" key={b} onClick={() => setBase(b)} className={`rounded-full border px-4 py-2.5 text-xs font-bold transition ${base === b ? "border-accent bg-accent text-accent-ink" : "border-line text-muted hover:border-text/40 hover:text-text"}`}>{b}</button>)}
        </div>
        {base && !bases.includes(base) && <p className="mt-3 text-xs text-accent-text">Starting from: {base}</p>}
      </div>

      <div>
        <p className="mb-3 text-[11px] font-black uppercase tracking-[.2em]">Pick your energy</p>
        <div className="flex flex-wrap gap-2">
          {styles.map(s => <button type="button" key={s} onClick={() => toggle(s)} className={`rounded-full border px-4 py-2.5 text-xs font-bold transition ${chosen.includes(s) ? "border-hot bg-hot text-white" : "border-line text-muted hover:border-hot hover:text-text"}`}>{s}</button>)}
        </div>
      </div>

      <div>
        <label htmlFor="notes" className="mb-3 block text-[11px] font-black uppercase tracking-[.2em]">Tell us what you&apos;re thinking</label>
        <textarea id="notes" required value={notes} onChange={e => setNotes(e.target.value)} rows={5} maxLength={2000} placeholder="Colours, placement, words, weird little details..." className={`${field} resize-y p-4`} />
      </div>

      {error && <p className="rounded-2xl bg-hot/10 p-3 text-xs text-hot">{error}</p>}
      <button disabled={busy} className="inline-flex items-center gap-3 rounded-full bg-accent px-8 py-4 text-xs font-black tracking-[.16em] text-accent-ink transition hover:scale-[1.03] disabled:opacity-60">
        {busy ? <><Loader2 size={16} className="animate-spin" /> SENDING…</> : <>SUBMIT CONCEPT <ArrowUpRight size={17} /></>}
      </button>
    </form>
  );
}

export default function CustomStudio() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <section className="mx-auto max-w-4xl px-5 py-16 md:py-24">
        <p className="text-[11px] font-black uppercase tracking-[.3em] text-accent-text">Make it yours / 1 of 1</p>
        <h1 className="display-font mt-4 text-6xl leading-[.82] md:text-8xl">YOUR IDEA.<br /><span className="text-hot">OUR HANDS.</span></h1>
        <p className="mt-7 max-w-lg text-sm leading-7 text-muted">Got a concept? A sketch? A reference you saved at 2AM? Send it through. Let&apos;s turn it into something nobody else has.</p>
        <Suspense fallback={null}><Studio /></Suspense>
      </section>
    </main>
  );
}

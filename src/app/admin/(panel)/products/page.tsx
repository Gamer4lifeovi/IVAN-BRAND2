"use client";
import { useMemo, useState } from "react";
import { ImagePlus, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import ProductArt from "@/components/ProductArt";
import { useAdminProducts } from "@/lib/admin";
import { colorPresets, money, type Product } from "@/lib/products";
import { tryDb } from "@/lib/supabase/browser";
import { useToasts } from "@/lib/toast";
import { btnGhost, btnPrimary, card, inputCls, th } from "@/lib/ui";

type Form = { name: string; category: string; price: string; tag: string; art: string; blurb: string; sizes: string; colors: string[]; image_url: string | null; active: boolean; sort: string };
const empty: Form = { name: "", category: "", price: "", tag: "", art: "", blurb: "", sizes: "", colors: [...colorPresets[0].colors], image_url: null, active: true, sort: "100" };
const toForm = (p: Product): Form => ({ name: p.name, category: p.category, price: String(p.price), tag: p.tag, art: p.art, blurb: p.blurb, sizes: p.sizes.join(", "), colors: p.colors.length >= 3 ? p.colors : [...colorPresets[0].colors], image_url: p.image_url, active: p.active, sort: String(p.sort) });

export default function ProductsPage() {
  const { products, loading, reload } = useAdminProducts();
  const push = useToasts(s => s.push);
  const [editing, setEditing] = useState<{ id: number | null } | null>(null);
  const [form, setForm] = useState<Form>(empty);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const categories = useMemo(() => Array.from(new Set(["Custom Caps", "Custom Kicks", "New Release", "One-of-One Art", ...products.map(p => p.category)])), [products]);
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm(f => ({ ...f, [k]: v }));

  const openNew = () => { setForm({ ...empty, sort: String((products.at(-1)?.sort ?? 0) + 10) }); setFile(null); setError(null); setEditing({ id: null }); };
  const openEdit = (p: Product) => { setForm(toForm(p)); setFile(null); setError(null); setEditing({ id: p.id }); };
  const preview = file ? URL.createObjectURL(file) : form.image_url;

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const db = tryDb();
    if (!db || !editing) return;
    setBusy(true); setError(null);
    try {
      const price = Math.round(Number(form.price));
      if (form.name.trim().length < 2) throw new Error("Give the product a name.");
      if (form.category.trim().length < 2) throw new Error("Choose or type a category.");
      if (!(price > 0)) throw new Error("Enter a price in naira.");
      let image_url = form.image_url;
      if (file) {
        const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-60);
        const path = `${Date.now()}-${safe}`;
        const up = await db.storage.from("product-images").upload(path, file, { contentType: file.type });
        if (up.error) throw new Error(`Image upload failed: ${up.error.message}`);
        image_url = db.storage.from("product-images").getPublicUrl(path).data.publicUrl;
      }
      const row = {
        name: form.name.trim(), category: form.category.trim(), price, tag: form.tag.trim(), art: form.art.trim() || form.name.trim().toUpperCase(),
        blurb: form.blurb.trim(), sizes: form.sizes.split(",").map(s => s.trim()).filter(Boolean), colors: form.colors, image_url, active: form.active, sort: Math.round(Number(form.sort)) || 0,
      };
      const res = editing.id === null ? await db.from("products").insert(row) : await db.from("products").update(row).eq("id", editing.id);
      if (res.error) throw new Error(res.error.message);
      push({ title: editing.id === null ? "Product added" : "Product saved", body: row.name, tone: "green" });
      setEditing(null);
      reload();
    } catch (err) { setError(err instanceof Error ? err.message : "Could not save."); } finally { setBusy(false); }
  }

  async function toggle(p: Product) {
    await tryDb()?.from("products").update({ active: !p.active }).eq("id", p.id);
    reload();
  }
  async function remove(p: Product) {
    if (!window.confirm(`Delete "${p.name}"? Past orders keep their own copy of the details.`)) return;
    const { error } = (await tryDb()?.from("products").delete().eq("id", p.id)) ?? { error: null };
    if (error) return push({ title: "Could not delete", body: error.message, tone: "pink" });
    reload();
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h2 className="text-xl font-semibold">Products</h2><p className="text-sm text-muted">What shows up in the store. Changes go live straight away.</p></div>
        <button onClick={openNew} className={btnPrimary}><Plus size={15} /> Add product</button>
      </div>

      <div className={card}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="bg-surface-2"><tr><th className={th}>Product</th><th className={th}>Category</th><th className={th}>Price</th><th className={th}>Sizes</th><th className={th}>Shown in store</th><th className={th} /></tr></thead>
            <tbody className="divide-y divide-line">
              {products.map(p => (
                <tr key={p.id} className="hover:bg-surface-2">
                  <td className="px-4 py-3"><div className="flex items-center gap-3"><ProductArt product={p} className="h-12 w-12 shrink-0 rounded-xl" textClass="text-[8px]" /><div><p className="font-medium">{p.name}</p><p className="text-[11px] text-muted">{p.tag}</p></div></div></td>
                  <td className="px-4 py-3 text-muted">{p.category}</td>
                  <td className="px-4 py-3 font-medium">{money(p.price)}</td>
                  <td className="px-4 py-3 text-muted">{p.sizes.length ? p.sizes.join(", ") : "One size"}</td>
                  <td className="px-4 py-3"><button onClick={() => toggle(p)} aria-label="Toggle visibility" className={`relative h-6 w-11 rounded-full transition ${p.active ? "bg-accent" : "bg-surface-2 border border-line"}`}><span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${p.active ? "left-[22px]" : "left-0.5"}`} /></button></td>
                  <td className="px-4 py-3"><div className="flex justify-end gap-1"><button onClick={() => openEdit(p)} aria-label="Edit" className="rounded-full p-2 text-muted hover:bg-surface-2 hover:text-text"><Pencil size={15} /></button><button onClick={() => remove(p)} aria-label="Delete" className="rounded-full p-2 text-muted hover:bg-hot/10 hover:text-hot"><Trash2 size={15} /></button></div></td>
                </tr>
              ))}
              {!products.length && <tr><td colSpan={6} className="px-6 py-14 text-center text-sm text-muted">{loading ? "Loading…" : "No products yet. Add your first one."}</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60" onClick={() => setEditing(null)}>
          <form onSubmit={save} onClick={e => e.stopPropagation()} className="h-full w-full max-w-lg space-y-4 overflow-y-auto border-l border-line bg-surface p-6 shadow-2xl">
            <div className="flex items-center justify-between"><h3 className="text-lg font-semibold">{editing.id === null ? "Add product" : "Edit product"}</h3><button type="button" onClick={() => setEditing(null)} aria-label="Close" className="rounded-full p-2 hover:bg-surface-2"><X size={18} /></button></div>

            <ProductArt product={{ art: form.art || form.name.toUpperCase() || "PREVIEW", colors: form.colors, image_url: preview, name: form.name || "Preview" }} className="aspect-[16/9] rounded-2xl" textClass="text-5xl" />
            <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-line p-3 text-xs text-muted transition hover:border-accent"><ImagePlus size={18} className="text-accent-text" /><span className="flex-1">{file ? file.name : "Upload a product photo (optional, PNG/JPG/WEBP up to 5MB)"}</span><input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={e => { const f = e.target.files?.[0] ?? null; if (f && f.size > 5 * 1024 * 1024) { setError("That image is over 5MB."); return; } setFile(f); }} /></label>
            {(file || form.image_url) && <button type="button" onClick={() => { setFile(null); set("image_url", null); }} className="text-xs text-muted hover:text-hot">Remove photo (use colour art instead)</button>}

            <input required value={form.name} onChange={e => set("name", e.target.value)} placeholder="Name" className={inputCls} />
            <div className="grid grid-cols-2 gap-3">
              <input required list="cats" value={form.category} onChange={e => set("category", e.target.value)} placeholder="Category" className={inputCls} />
              <datalist id="cats">{categories.map(c => <option key={c} value={c} />)}</datalist>
              <input required type="number" min={1} value={form.price} onChange={e => set("price", e.target.value)} placeholder="Price (₦)" className={inputCls} />
              <input value={form.tag} onChange={e => set("tag", e.target.value)} placeholder="Tag, e.g. LIMITED DROP" className={inputCls} />
              <input value={form.art} onChange={e => set("art", e.target.value)} placeholder="Art words (on the card)" className={inputCls} />
            </div>
            <textarea value={form.blurb} onChange={e => set("blurb", e.target.value)} rows={3} placeholder="Short description" className="w-full resize-y rounded-xl border border-line bg-surface p-3 text-sm outline-none placeholder:text-muted focus:border-accent" />
            <input value={form.sizes} onChange={e => set("sizes", e.target.value)} placeholder="Sizes, comma separated (leave empty for one size), e.g. 40, 41, 42" className={inputCls} />

            <div>
              <p className="mb-2 text-xs font-semibold text-muted">Colour art</p>
              <div className="flex flex-wrap gap-2">{colorPresets.map(c => <button type="button" key={c.name} onClick={() => set("colors", [...c.colors])} title={c.name} className="h-8 w-14 rounded-full border border-line" style={{ background: `linear-gradient(135deg, ${c.colors.join(", ")})` }} />)}</div>
              <div className="mt-3 flex gap-2">{form.colors.map((c, i) => <input key={i} type="color" value={c} onChange={e => set("colors", form.colors.map((x, j) => (j === i ? e.target.value : x)))} aria-label={`Colour ${i + 1}`} className="h-9 w-14 cursor-pointer rounded-lg border border-line bg-surface p-0.5" />)}</div>
            </div>

            <div className="grid grid-cols-2 items-center gap-3">
              <label className="text-xs text-muted">Sort order (smaller shows first)<input type="number" value={form.sort} onChange={e => set("sort", e.target.value)} className={`${inputCls} mt-1`} /></label>
              <label className="flex items-center gap-2 pt-5 text-sm"><input type="checkbox" checked={form.active} onChange={e => set("active", e.target.checked)} className="h-4 w-4 accent-[var(--accent)]" /> Show in store</label>
            </div>

            {error && <p className="rounded-xl bg-hot/10 p-3 text-xs text-hot">{error}</p>}
            <div className="flex gap-3"><button disabled={busy} className={btnPrimary}>{busy ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : "Save product"}</button><button type="button" onClick={() => setEditing(null)} className={btnGhost}>Cancel</button></div>
          </form>
        </div>
      )}
    </div>
  );
}

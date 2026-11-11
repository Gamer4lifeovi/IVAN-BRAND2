import { createClient } from "@supabase/supabase-js";
import { fallbackProducts, type Product } from "@/lib/products";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function publicClient() {
  if (!url || !anon) return null;
  return createClient(url, anon, { auth: { persistSession: false, autoRefreshToken: false } });
}

/** Active products for the storefront. */
export async function getProducts(): Promise<Product[]> {
  const db = publicClient();
  if (!db) return fallbackProducts;
  const { data, error } = await db.from("products").select("*").eq("active", true).order("sort").order("id");
  if (error || !data) return [];
  return data as Product[];
}

export async function getProduct(id: number): Promise<Product | null> {
  if (!Number.isInteger(id)) return null;
  const db = publicClient();
  if (!db) return fallbackProducts.find(p => p.id === id) ?? null;
  const { data } = await db.from("products").select("*").eq("id", id).eq("active", true).maybeSingle();
  return (data as Product | null) ?? null;
}

import ShopClient from "@/components/shop/ShopClient";
import { getProducts } from "@/lib/server/catalog";

export const dynamic = "force-dynamic";
export const metadata = { title: "The Drops — IVAN" };

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const [products, params] = await Promise.all([getProducts(), searchParams]);
  return <ShopClient products={products} initialSaved={params.saved === "1"} />;
}

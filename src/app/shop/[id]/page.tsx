import { notFound } from "next/navigation";
import ProductView from "@/components/shop/ProductView";
import { getProduct, getProducts } from "@/lib/server/catalog";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(Number(id));
  if (!product) notFound();
  const all = await getProducts();
  const related = [...all.filter(p => p.id !== product.id && p.category === product.category), ...all.filter(p => p.id !== product.id && p.category !== product.category)].slice(0, 3);
  return <ProductView product={product} related={related} />;
}

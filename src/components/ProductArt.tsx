import { gradient, type Product } from "@/lib/products";

type Props = {
  product: Pick<Product, "art" | "colors" | "image_url" | "name">;
  className?: string;
  textClass?: string;
};

export default function ProductArt({ product, className = "", textClass = "text-5xl md:text-6xl" }: Props) {
  return (
    <div className={`noise relative overflow-hidden bg-surface-2 ${className}`}>
      <span className="absolute inset-0" style={{ background: gradient(product.colors), filter: "saturate(.6) brightness(.88)" }} />
      {product.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={product.image_url} alt={product.name} className="absolute inset-0 z-[1] h-full w-full object-cover" loading="lazy" />
      ) : (
        <>
          <span className="absolute -right-8 -top-8 h-44 w-44 rounded-full bg-white/10 blur-3xl" />
          <span className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-black/30 blur-3xl" />
          <span className={`display-font absolute inset-0 z-[1] flex rotate-[-9deg] items-center justify-center px-4 text-center leading-[.84] text-white/90 drop-shadow-[0_6px_24px_rgba(0,0,0,.5)] ${textClass}`}>{product.art}</span>
        </>
      )}
    </div>
  );
}
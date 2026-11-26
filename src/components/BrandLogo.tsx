import Link from "next/link";

type BrandLogoProps = { variant?: "art" | "wordmark"; onDark?: boolean; href?: string | null; className?: string };

export default function BrandLogo({ variant = "art", className = "" }: BrandLogoProps) {
  const artwork = variant === "wordmark" ? (
    <span className={`display-font tracking-[-.08em] font-black text-3xl ${className}`}>IVAN<span className="text-hot">®</span></span>
  ) : (
    <span role="img" aria-label="IVAN white logo with chain" className={`ivan-airbrush-logo ${className}`}>
      <img src="/images/ivan-logo-white.svg" alt="" className="ivan-airbrush-logo__art" />
    </span>
  );
  return <Link href="/" aria-label="IVAN — back to home" className="inline-block overflow-visible transition hover:opacity-80">{artwork}</Link>;
}

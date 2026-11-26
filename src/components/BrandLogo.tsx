import Link from "next/link";

type BrandLogoProps = { variant?: "art" | "wordmark"; onDark?: boolean; href?: string | null; className?: string };

export default function BrandLogo({ variant = "art", onDark = false, href = "/", className = "" }: BrandLogoProps) {
  const artwork = variant === "wordmark" ? (
    <span className={`display-font tracking-[-.08em] font-black text-3xl ${className}`}>IVAN<span className="text-hot">®</span></span>
  ) : (
    <span role="img" aria-label="IVAN white logo" className={`ivan-airbrush-logo ${onDark ? "ivan-airbrush-logo--dark" : ""} ${className}`}>
      <img src="/images/ivan-logo-light.png" alt="" className="ivan-airbrush-logo__art" />
    </span>
  );
  if (href === null) return artwork;
  return <Link href={href} aria-label="IVAN — back to home" className="inline-block transition hover:opacity-80">{artwork}</Link>;
}

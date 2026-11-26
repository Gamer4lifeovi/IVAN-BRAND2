import Link from "next/link";

type BrandLogoProps = { variant?: "art" | "wordmark"; onDark?: boolean; href?: string | null; className?: string };

export default function BrandLogo({ variant = "art", href = "/", className = "" }: BrandLogoProps) {
  const content = variant === "wordmark" ? (
    <span className={`display-font tracking-[-.08em] font-black text-3xl ${className}`}>IVAN<span className="text-hot">®</span></span>
  ) : (
    <span
      role="img"
      aria-label="IVAN animated red and white airbrush logo"
      className={`ivan-airbrush-logo ${className}`}
    >
      <span className="ivan-airbrush-logo__red" />
      <span className="ivan-airbrush-logo__spray" />
    </span>
  );
  if (href === null) return content;
  return <Link href={href} aria-label="IVAN — back to home" className="inline-block transition hover:opacity-80">{content}</Link>;
}

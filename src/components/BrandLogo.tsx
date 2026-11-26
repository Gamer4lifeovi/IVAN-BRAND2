import Link from "next/link";

type BrandLogoProps = {
  variant?: "art" | "wordmark";
  onDark?: boolean;
  href?: string | null;
  className?: string;
};

export default function BrandLogo({ variant = "art", href = "/", className = "" }: BrandLogoProps) {
  const content = variant === "wordmark" ? (
    <span className={`display-font tracking-[-.08em] font-black text-3xl ${className}`}>IVAN<span className="text-hot">®</span></span>
  ) : (
    <img
      src="/images/ivan-airbrush-logo.gif"
      alt="IVAN animated airbrush logo"
      width={360}
      height={234}
      className={`block h-auto w-[100px] object-contain ${className}`}
    />
  );

  if (href === null) return content;
  return <Link href={href} aria-label="IVAN — back to home" className="inline-block transition hover:opacity-80">{content}</Link>;
}

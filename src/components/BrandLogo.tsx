import Image from "next/image";
import Link from "next/link";

type BrandLogoProps = {
  variant?: "art" | "wordmark";
  /** Always use the light logo (for places that are always dark, like the landing hero). */
  onDark?: boolean;
  /** Where clicking the logo goes. Defaults to the landing page. Pass null to make it non-clickable. */
  href?: string | null;
  className?: string;
};

export default function BrandLogo({ variant = "art", onDark = false, href = "/", className = "" }: BrandLogoProps) {
  const size = `h-auto w-[100px] object-contain ${className}`;
  const content =
    variant === "wordmark" ? (
      <span className={`display-font tracking-[-.08em] font-black text-3xl ${className}`}>IVAN<span className="text-hot">®</span></span>
    ) : onDark ? (
      <Image src="/images/ivan-logo-light.png" alt="IVAN" width={633} height={711} priority className={size} />
    ) : (
      <>
        {/* theme-aware: light logo on dark theme, dark logo on light theme */}
        <Image src="/images/ivan-logo-light.png" alt="IVAN" width={633} height={711} priority className={`${size} block [[data-theme=light]_&]:hidden`} />
        <Image src="/images/ivan-logo.png" alt="IVAN" width={633} height={711} priority className={`${size} hidden [[data-theme=light]_&]:block`} />
      </>
    );

  if (href === null) return content;
  return (
    <Link href={href} aria-label="IVAN — back to home" className="inline-block transition hover:opacity-80">
      {content}
    </Link>
  );
}

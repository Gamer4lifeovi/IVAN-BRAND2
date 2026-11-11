"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, MessageCircle, ShoppingBag } from "lucide-react";
import BrandLogo from "./BrandLogo";
import ThemeToggle from "./ThemeToggle";
import { cartCount, useCart, useHydrated } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";

const links = [
  { href: "/shop", label: "Shop" },
  { href: "/custom-studio", label: "Custom studio" },
];

export default function Navbar() {
  const pathname = usePathname();
  const hydrated = useHydrated();
  const count = useCart(s => cartCount(s.items));
  const saved = useWishlist(s => s.ids.length);
  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 h-[112px] border-b border-line bg-bg/75 text-text backdrop-blur-xl">
        <div className="flex h-full w-full items-center justify-between px-6 py-4 md:px-12">
          <BrandLogo className="w-[72px]" />
          <nav className="hidden items-center gap-8 text-[11px] font-bold uppercase tracking-[.18em] md:flex">
            {links.map(l => (
              <Link key={l.href} href={l.href} className={`transition hover:text-accent-text ${pathname.startsWith(l.href) ? "text-accent-text" : "text-muted"}`}>{l.label}</Link>
            ))}
          </nav>
          <div className="flex items-center">
            <Link href="/shop?saved=1" aria-label="Saved pieces" className="relative hidden rounded-full p-2.5 text-muted transition hover:bg-surface-2 hover:text-hot sm:block">
              <Heart size={19} />
              {hydrated && saved > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-surface-2 px-1 text-[9px] font-bold">{saved}</span>}
            </Link>
            <Link href="/chat" aria-label="Open the full IVAN chat" className="relative rounded-full p-2.5 text-muted transition hover:bg-surface-2 hover:text-accent-text">
              <MessageCircle size={19} />
              <span className="pulse-ring absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-accent" />
            </Link>
            <ThemeToggle />
            <Link href="/bag" aria-label="Shopping bag" className="relative rounded-full p-2.5 text-muted transition hover:bg-surface-2 hover:text-accent-text">
              <ShoppingBag size={19} />
              {hydrated && count > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-hot px-1 text-[9px] font-bold text-white">{count}</span>}
            </Link>
          </div>
        </div>
      </header>
      <div aria-hidden="true" className="h-[112px]" />
    </>
  );
}

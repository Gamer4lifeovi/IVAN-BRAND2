"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, ChevronRight, ExternalLink, LogOut, Mail, Menu, X } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import ThemeToggle from "@/components/ThemeToggle";
import { tryDb } from "@/lib/supabase/browser";
import { beep, useNotifications, type Notice } from "@/lib/notifications";
import { useToasts } from "@/lib/toast";

const nav = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/payments", label: "Payments" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/custom", label: "Custom requests" },
  { href: "/admin/inbox", label: "Messages" },
];
const kindMeta = {
  order: { tone: "blue", dot: "bg-sky-400" },
  payment: { tone: "green", dot: "bg-accent" },
  chat: { tone: "pink", dot: "bg-hot" },
  custom: { tone: "pink", dot: "bg-violet-400" },
} as const;

const ago = (ts: number) => {
  const s = Math.max(1, Math.round((Date.now() - ts) / 1000));
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const push = useToasts(s => s.push);
  const [menu, setMenu] = useState(false);
  const [bell, setBell] = useState(false);
  const [account, setAccount] = useState(false);
  const [email, setEmail] = useState("");
  const popRef = useRef<HTMLDivElement>(null);

  const { items, unread, unreadChats, markRead } = useNotifications((n: Notice) => {
    push({ title: n.title, body: n.body, tone: kindMeta[n.kind].tone, href: n.link ?? undefined });
    beep();
    if (typeof Notification !== "undefined" && Notification.permission === "granted" && document.hidden) new Notification(n.title, { body: n.body });
  });

  useEffect(() => { tryDb()?.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? "")); }, []);
  useEffect(() => { setMenu(false); setBell(false); setAccount(false); }, [pathname]);
  useEffect(() => {
    const close = (e: MouseEvent) => { if (popRef.current && !popRef.current.contains(e.target as Node)) { setBell(false); setAccount(false); } };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const title = nav.find(n => (n.exact ? pathname === n.href : pathname.startsWith(n.href)))?.label ?? "Admin";
  const signOut = async () => { await tryDb()?.auth.signOut(); router.push("/admin/login"); router.refresh(); };

  const sidebar = (
    <div className="flex h-full flex-col border-r border-line bg-surface">
      <div className="flex items-center gap-3 px-6 py-6">
        <BrandLogo className="w-10" href="/" />
        <span className="text-lg font-semibold tracking-wide">IVAN <span className="text-accent-text">admin</span></span>
      </div>
      <div className="mx-5 flex items-center gap-3 rounded-2xl border border-line bg-surface-2 px-3 py-2.5">
        <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-ink">
          {(email[0] ?? "I").toUpperCase()}
          <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-surface-2 bg-accent" />
        </span>
        <div className="min-w-0"><p className="truncate text-sm font-medium">{email || "Signed in"}</p><p className="text-xs text-muted">Staff</p></div>
      </div>
      <p className="mt-8 px-6 text-xs font-medium text-muted">Main Menu</p>
      <nav className="mt-3 flex-1 overflow-y-auto border-t border-line px-3 pt-2">
        {nav.map(n => {
          const active = n.exact ? pathname === n.href : pathname.startsWith(n.href);
          return (
            <Link key={n.href} href={n.href} className={`flex items-center justify-between rounded-xl px-3 py-3.5 text-sm font-medium transition hover:bg-surface-2 ${active ? "bg-accent/15 text-accent-text" : "text-text"}`}>
              <span className="flex items-center gap-3">
                <span className={`h-2.5 w-2.5 rounded-full border-2 ${active ? "border-accent-text bg-accent" : "border-muted"}`} />{n.label}
                {n.href === "/admin/inbox" && unreadChats > 0 && <span className="rounded-full bg-hot px-1.5 text-[10px] font-bold text-white">{unreadChats}</span>}
              </span>
              <ChevronRight size={15} className="text-muted" />
            </Link>
          );
        })}
      </nav>
      <div className="space-y-1 border-t border-line p-3">
        <Link href="/shop" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-muted hover:bg-surface-2 hover:text-text"><ExternalLink size={15} /> View storefront</Link>
        <button onClick={signOut} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-muted hover:bg-surface-2 hover:text-text"><LogOut size={15} /> Sign out</button>
      </div>
    </div>
  );

  return (
    <div className="admin-font min-h-screen bg-bg text-text">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[260px] lg:block">{sidebar}</aside>
      {menu && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMenu(false)} />
          <aside className="absolute inset-y-0 left-0 w-[270px]">{sidebar}</aside>
        </div>
      )}

      <div className="lg:pl-[260px]">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-line bg-bg/80 px-4 py-3 backdrop-blur-xl md:px-8">
          <div className="flex items-center gap-3">
            <button onClick={() => setMenu(m => !m)} aria-label="Menu" className="rounded-full p-2 hover:bg-surface-2 lg:hidden">{menu ? <X size={20} /> : <Menu size={20} />}</button>
            <h1 className="text-base font-semibold md:text-lg">{title}</h1>
          </div>

          <div ref={popRef} className="relative flex items-center gap-0.5">
            <ThemeToggle />
            <button onClick={() => { setBell(b => !b); setAccount(false); }} aria-label="Notifications" className="relative rounded-full p-2.5 text-muted hover:bg-surface-2 hover:text-text">
              <Bell size={19} />
              {unread > 0 && <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-hot px-1 text-[10px] font-bold text-white">{unread}</span>}
            </button>
            <Link href="/admin/inbox" aria-label="Messages" className="relative rounded-full p-2.5 text-muted hover:bg-surface-2 hover:text-text">
              <Mail size={19} />
              {unreadChats > 0 && <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-ink">{unreadChats}</span>}
            </Link>
            <button onClick={() => { setAccount(a => !a); setBell(false); }} aria-label="Account" className="ml-1 flex h-9 w-9 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-ink">{(email[0] ?? "I").toUpperCase()}</button>

            {bell && (
              <div className="absolute right-0 top-full mt-2 w-[min(92vw,380px)] overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl">
                <div className="flex items-center justify-between border-b border-line px-4 py-3">
                  <p className="text-sm font-semibold">Notifications</p>
                  <button onClick={() => markRead(items.filter(i => !i.read).map(i => i.id))} className="text-xs font-medium text-accent-text hover:underline">Mark all read</button>
                </div>
                <ul className="max-h-[360px] divide-y divide-line overflow-y-auto">
                  {items.length === 0 && <li className="p-6 text-center text-sm text-muted">Nothing yet. New orders, payments, chats and custom requests show up here.</li>}
                  {items.map(n => (
                    <li key={n.id}>
                      <Link href={n.link ?? "/admin"} onClick={() => markRead([n.id])} className={`flex gap-3 px-4 py-3 hover:bg-surface-2 ${n.read ? "" : "bg-accent/5"}`}>
                        <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${kindMeta[n.kind].dot}`} />
                        <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{n.title}</span><span className="block truncate text-xs text-muted">{n.body}</span></span>
                        <span className="shrink-0 text-[11px] text-muted">{ago(n.createdAt)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
                {typeof Notification !== "undefined" && Notification.permission === "default" && (
                  <button onClick={() => Notification.requestPermission()} className="w-full border-t border-line px-4 py-3 text-left text-xs font-medium text-accent-text hover:bg-surface-2">Turn on desktop alerts for when this tab is in the background</button>
                )}
              </div>
            )}
            {account && (
              <div className="absolute right-0 top-full mt-2 w-60 rounded-2xl border border-line bg-surface p-2 shadow-2xl">
                <p className="truncate px-3 py-2 text-xs text-muted">{email}</p>
                <button onClick={signOut} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-surface-2"><LogOut size={15} /> Sign out</button>
              </div>
            )}
          </div>
        </header>
        <main className="p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}

"use client";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { useToasts } from "@/lib/toast";

const tones = {
  green: "border-accent/50 shadow-[0_0_40px_-12px_var(--glow)]",
  pink: "border-hot/50 shadow-[0_0_40px_-12px_var(--hot)]",
  blue: "border-text/30 shadow-[0_0_30px_-14px_var(--text)]",
} as const;
const dots = { green: "bg-accent text-accent-ink", pink: "bg-hot text-white", blue: "bg-text text-bg" } as const;

export default function ToastHost() {
  const { toasts, dismiss } = useToasts();
  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-2">
      <AnimatePresence>
        {toasts.map(t => {
          const tone = t.tone ?? "green";
          const text = (
            <>
              <p className="text-sm font-bold">{t.title}</p>
              {t.body && <p className="mt-0.5 text-xs text-muted">{t.body}</p>}
            </>
          );
          return (
            <motion.div key={t.id} layout initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }} className={`pointer-events-auto flex items-start gap-3 rounded-2xl border bg-surface/95 p-4 text-text backdrop-blur ${tones[tone]}`}>
              <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${dots[tone]}`}><Check size={14} /></span>
              <div className="min-w-0 flex-1">{t.href ? <Link href={t.href} onClick={() => dismiss(t.id)}>{text}</Link> : text}</div>
              <button onClick={() => dismiss(t.id)} aria-label="Dismiss" className="text-muted hover:text-text"><X size={15} /></button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

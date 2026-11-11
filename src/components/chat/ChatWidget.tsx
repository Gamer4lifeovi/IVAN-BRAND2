"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, X } from "lucide-react";
import ChatPanel from "./ChatPanel";

export default function ChatWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  if (pathname.startsWith("/admin") || pathname.startsWith("/chat")) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="mb-3"
          >
            <ChatPanel active onClose={() => setOpen(false)} className="h-[600px] max-h-[calc(100dvh-6.5rem)] w-[calc(100vw-2rem)] sm:w-[380px]" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-end">
        <button
          onClick={() => setOpen(o => !o)}
          aria-label={open ? "Close chat" : "Chat with IVAN"}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-ink shadow-[0_0_40px_-6px_var(--glow)] transition hover:scale-105"
        >
          {open ? <X size={24} /> : <MessageCircle size={24} />}
        </button>
      </div>
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

/** Switches the whole site (store, chat, admin) between dark and light. */
export default function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  useEffect(() => { setTheme(document.documentElement.dataset.theme === "light" ? "light" : "dark"); }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem("ivan-theme", next); } catch { /* private mode */ }
    setTheme(next);
  };

  return (
    <button onClick={toggle} aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"} title={theme === "dark" ? "Light mode" : "Dark mode"} className={`rounded-full p-2.5 text-muted transition hover:bg-surface-2 hover:text-accent-text ${className}`}>
      {theme === "dark" ? <Sun size={19} /> : <Moon size={19} />}
    </button>
  );
}

"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import BrandLogo from "./BrandLogo";
import { ArrowUpRight, Instagram } from "lucide-react";

export default function HeroVideo() {
  return (
    <main className="noise relative min-h-[100svh] overflow-hidden bg-[#09090d] text-[#f4f4f6]">
      {/* INSERT HIGH-RES BRAND HERO VIDEO HERE: e.g. /public/videos/hero.mp4 */}
      <video className="absolute inset-0 h-full w-full object-cover opacity-45" autoPlay muted loop playsInline poster="/images/ivan-logo-light.png">
        <source src="/videos/hero.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(9,9,13,.88),rgba(9,9,13,.28),rgba(9,9,13,.82))]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_5%,rgba(9,9,13,.58)_100%)]" />
      <header className="relative z-10 flex items-center justify-between px-5 py-5 md:px-10">
        <BrandLogo onDark className="w-[72px]" />
        <span className="hidden text-[10px] font-bold uppercase tracking-[.35em] text-white/60 md:block">Lagos, Nigeria · Est. 2026</span>
        <a href="https://www.instagram.com/" target="_blank" rel="noreferrer" aria-label="Instagram" className="rounded-full border border-white/30 p-3 transition hover:border-[#00ff85] hover:text-[#00ff85]"><Instagram size={17}/></a>
      </header>
      <section className="relative z-10 flex min-h-[76svh] flex-col items-center justify-center px-5 text-center">
        <motion.h1 initial={{ y: 25 }} animate={{ y: 0 }} transition={{ duration: .7 }} className="display-font max-w-5xl text-[clamp(4.5rem,15vw,12rem)] leading-[.76]">
          NOT MADE<br/><span className="text-accent">TO FIT IN.</span>
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .65 }} className="mt-8 max-w-sm text-xs leading-6 text-white/65 md:text-sm">Custom art. Street culture. Individual expression.<br/>Wear your own kind of different.</motion.p>
        <motion.div initial={{ opacity: 0, scale: .9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: .8 }} className="mt-10">
          <Link href="/shop" className="group inline-flex items-center gap-5 border border-accent bg-accent px-7 py-4 text-xs font-black tracking-[.2em] text-accent-ink transition hover:-rotate-1 hover:bg-accent/90">
            SHOP NOW <ArrowUpRight className="transition group-hover:translate-x-1 group-hover:-translate-y-1" size={18}/>
          </Link>
        </motion.div>
        <div className="absolute bottom-[-10vh] left-1/2 -z-0 h-40 w-40 -translate-x-1/2 rounded-full bg-[#ff0055]/20 blur-[90px]"/>
      </section>
      <footer className="relative z-10 flex items-center justify-between px-5 pb-6 text-[9px] font-bold uppercase tracking-[.25em] text-white/45 md:px-10">
        <span>Wear it your way.</span><span>Scroll less. Express more.</span><span>01 / 04</span>
      </footer>
    </main>
  );
}

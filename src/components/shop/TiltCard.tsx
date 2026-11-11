"use client";
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from "framer-motion";

/** A card that tilts toward the pointer and catches a moving glare. */
export default function TiltCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(y, [0, 1], [6, -6]), { stiffness: 220, damping: 22 });
  const rotateY = useSpring(useTransform(x, [0, 1], [-6, 6]), { stiffness: 220, damping: 22 });
  const gx = useTransform(x, v => `${v * 100}%`);
  const gy = useTransform(y, v => `${v * 100}%`);
  const glare = useMotionTemplate`radial-gradient(280px circle at ${gx} ${gy}, rgba(255,255,255,.2), transparent 62%)`;

  return (
    <motion.div
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      onPointerMove={e => {
        if (e.pointerType === "touch") return;
        const r = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - r.left) / r.width);
        y.set((e.clientY - r.top) / r.height);
      }}
      onPointerLeave={() => { x.set(0.5); y.set(0.5); }}
      className={`relative ${className}`}
    >
      {children}
      <motion.div style={{ background: glare }} className="pointer-events-none absolute inset-0 z-20 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </motion.div>
  );
}

"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { Sparkles, ArrowRight, Star } from "lucide-react";
import { useRef } from "react";

// Replace these with your actual product images in /public/hero/
const FLOATING_OUTFITS = [
  { src: "/hero/lehenga.jpg", alt: "Bridal Lehenga", tag: "Bridal", delay: 0 },
  { src: "/hero/saree.jpg", alt: "Designer Saree", tag: "Festive", delay: 0.2 },
  { src: "/hero/anarkali.webp", alt: "Anarkali Gown", tag: "Reception", delay: 0.4 },
];

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-300, 300], [8, -8]), {
    stiffness: 150,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(mouseX, [-300, 300], [-8, 8]), {
    stiffness: 150,
    damping: 20,
  });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <section className="section-shell pt-10 md:pt-14">
      <motion.div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        style={{ perspective: 1200 }}
        className="relative overflow-hidden rounded-[2rem] border border-studio-primary/10 bg-gradient-to-br from-studio-cream via-white to-studio-cream px-6 py-12 shadow-[0_40px_80px_-40px_rgba(32,29,26,0.35)] md:px-14 md:py-16"
      >
        {/* Animated background orbs */}
        <motion.div
          className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-studio-accent/20 blur-3xl"
          animate={{ x: [0, 40, 0], y: [0, 30, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="pointer-events-none absolute -bottom-40 -right-20 h-[28rem] w-[28rem] rounded-full bg-studio-primary/15 blur-3xl"
          animate={{ x: [0, -30, 0], y: [0, -20, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Floating sparkles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="pointer-events-none absolute"
            style={{
              left: `${15 + i * 14}%`,
              top: `${20 + (i % 3) * 25}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 1, 0.3],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 4 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.3,
            }}
          >
            <Sparkles className="h-3 w-3 text-studio-accent" />
          </motion.div>
        ))}

        <motion.div
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          className="relative grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]"
        >
          {/* LEFT: Copy */}
          <div style={{ transform: "translateZ(40px)" }}>
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 rounded-full border border-studio-primary/15 bg-white/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-studio-primary backdrop-blur-sm"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-studio-accent opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-studio-accent" />
              </span>
              Vasireddy Designer Studio
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="mt-6 max-w-2xl text-4xl font-semibold leading-[1.05] tracking-tight text-studio-primary md:text-6xl lg:text-7xl"
            >
              Crafted for grand{" "}
              <span className="relative inline-block">
                <span className="relative z-10 bg-gradient-to-r from-studio-accent via-studio-primary to-studio-accent bg-[length:200%_auto] bg-clip-text text-transparent animate-gradient-shine">
                  celebrations
                </span>
                <motion.svg
                  className="absolute -bottom-2 left-0 w-full"
                  height="10"
                  viewBox="0 0 200 10"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 1, duration: 1.2 }}
                >
                  <motion.path
                    d="M2 6 Q 50 1, 100 5 T 198 6"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    fill="none"
                    className="text-studio-accent"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 1, duration: 1.2 }}
                  />
                </motion.svg>
              </span>{" "}
              and couture confidence.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-6 max-w-xl text-base leading-7 text-studio-ink/80 md:text-lg"
            >
             Explore bridal, festive, and everyday styles for modern Indian wear.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="mt-9 flex flex-wrap gap-4"
            >
              <Link
                href="/collections"
                className="group relative overflow-hidden rounded-full bg-studio-primary px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-studio-primary/25 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-studio-primary/35"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Shop Collections
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-studio-accent to-studio-primary transition-transform duration-500 group-hover:translate-x-0" />
              </Link>
              <Link
                href="/products"
                className="group rounded-full border border-studio-primary/20 bg-white/90 px-7 py-3.5 text-sm font-semibold text-studio-primary backdrop-blur transition-all hover:-translate-y-0.5 hover:border-studio-accent hover:text-studio-accent hover:shadow-lg"
              >
                <span className="flex items-center gap-2">
                  Explore Products
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </motion.div>

            {/* Trust row */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="mt-10 flex items-center gap-6"
            >
              <div className="flex -space-x-3">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="h-9 w-9 rounded-full border-2 border-white bg-gradient-to-br from-studio-accent to-studio-primary"
                  />
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1 text-studio-accent">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="text-xs text-studio-ink/70">30,000+ happy shoppers</p>
              </div>
            </motion.div>
          </div>

          {/* RIGHT: Floating 3D outfit cards */}
          <div
            style={{ transform: "translateZ(60px)" }}
            className="relative h-[520px] w-full"
          >
            {FLOATING_OUTFITS.map((outfit, i) => (
              <motion.div
                key={outfit.alt}
                initial={{ opacity: 0, y: 60, rotate: i % 2 === 0 ? -8 : 8 }}
                animate={{ opacity: 1, y: 0, rotate: i % 2 === 0 ? -4 : 4 }}
                transition={{
                  delay: 0.4 + outfit.delay,
                  duration: 1,
                  ease: [0.22, 1, 0.36, 1],
                }}
                whileHover={{ scale: 1.05, rotate: 0, zIndex: 10 }}
                className="absolute overflow-hidden rounded-3xl border border-white/80 bg-white/90 shadow-2xl shadow-studio-primary/20 backdrop-blur"
                style={{
                  width: "60%",
                  height: "70%",
                  top: `${i * 12}%`,
                  left: `${i * 18}%`,
                  zIndex: FLOATING_OUTFITS.length - i,
                }}
              >
                <motion.div
                  animate={{ y: [0, -12, 0] }}
                  transition={{
                    duration: 4 + i * 0.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.3,
                  }}
                  className="relative h-full w-full"
                >
                  {/* Fallback gradient if image missing */}
                  <div className="absolute inset-0 bg-gradient-to-br from-studio-cream via-studio-accent/20 to-studio-primary/30" />

                  {/* Uncomment when you have images in /public/hero/ */}
                  <Image
                    src={outfit.src}
                    alt={outfit.alt}
                    fill
                    className="object-cover"
                    priority={i === 0}
                  />

                  <div className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-studio-primary">
                    {outfit.tag}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                    <p className="text-sm font-semibold text-white">{outfit.alt}</p>
                  </div>
                </motion.div>
              </motion.div>
            ))}

            {/* Floating badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.2, type: "spring" }}
              className="absolute -right-2 top-6 z-20 rounded-2xl bg-studio-primary p-4 text-white shadow-2xl"
              style={{ transform: "translateZ(80px)" }}
            >
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <p className="text-[10px] uppercase tracking-widest text-studio-accent">
                  New Drop
                </p>
                <p className="text-lg font-bold">Wedding Luxe</p>
                <p className="text-[10px] opacity-80">2026 Edit</p>
              </motion.div>
            </motion.div>

            {/* Rating chip */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.4 }}
              className="absolute -bottom-2 left-2 z-20 flex items-center gap-3 rounded-2xl bg-white/95 p-4 shadow-2xl backdrop-blur"
              style={{ transform: "translateZ(80px)" }}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-studio-accent to-studio-primary text-white">
                <Star className="h-6 w-6 fill-current" />
              </div>
              <div>
                <p className="text-lg font-bold text-studio-primary">4.8/5</p>
                <p className="text-[10px] text-studio-ink/70">Style Rating</p>
              </div>
            </motion.div>
          </div>
        </motion.div>

       
      </motion.div>
    </section>
  );
}
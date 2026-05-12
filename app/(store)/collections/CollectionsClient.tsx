"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ShoppingBag, Sparkles } from "lucide-react";

type Category = {
  id: string;
  name: string;
  slug: string;
  productCount: number;
  imageUrl: string | null;
};

export default function CollectionsClient() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories/stats");
        const result = await response.json();
        // Filter out categories with 0 products
        const activeCategories = (result.data || []).filter((c: Category) => c.productCount > 0);
        setCategories(activeCategories);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="min-h-screen bg-[#faf9f6] pb-24">
      {/* ═══════════════════ BREADCRUMB ═══════════════════ */}
      <section className="section-shell py-6 text-[10px] font-bold uppercase tracking-widest text-studio-ink/40">
        <nav className="flex items-center gap-2">
          <Link href="/" className="transition hover:text-studio-accent">Home</Link>
          <span className="opacity-30">/</span>
          <span className="text-studio-primary">Lookbook</span>
        </nav>
      </section>

      {/* ═══════════════════ HERO ═══════════════════ */}
      <section className="section-shell mb-12">
        <div className="relative overflow-hidden rounded-[3rem] bg-studio-primary py-20 px-8 text-center text-white md:py-28 md:px-12">
          <div className="absolute inset-0 opacity-10" 
               style={{ backgroundImage: "radial-gradient(circle at 2px 2px, #fff 1px, transparent 0)", backgroundSize: "40px 40px" }} />
          
          <div className="relative">
            <div className="inline-flex items-center gap-3 rounded-full bg-white/10 px-4 py-2 backdrop-blur-md border border-white/10">
              <Sparkles size={14} className="text-studio-accent" />
              <span className="text-[10px] font-bold uppercase tracking-[0.3em]">The Vasireddy Edit</span>
            </div>
            <h1 className="mt-8 font-serif text-5xl font-semibold leading-tight tracking-tight md:text-7xl">
              Curated Collections
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base text-white/70 md:text-xl leading-relaxed">
              Discover our artisanal saree edits and couture blouse sets. Each collection is a testament to timeless craftsmanship and contemporary elegance.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════ COLLECTIONS GRID ═══════════════════ */}
      <section className="section-shell">
        {loading ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="aspect-[4/5] animate-pulse rounded-[2rem] bg-studio-light/40" />
            ))}
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/products?category=${category.slug}`}
                className="group relative flex flex-col overflow-hidden rounded-[2rem] bg-white shadow-[0_20px_50px_-20px_rgba(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_40px_80px_-30px_rgba(63,52,143,0.2)]"
              >
                {/* Image Container */}
                <div className="relative aspect-[4/5] w-full overflow-hidden">
                  {category.imageUrl ? (
                    <Image
                      src={category.imageUrl}
                      alt={category.name}
                      fill
                      className="object-cover transition-transform duration-1000 group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-studio-light/30">
                      <ShoppingBag size={64} className="text-studio-primary/10" />
                    </div>
                  )}
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-studio-primary/90 via-studio-primary/20 to-transparent opacity-60 transition-opacity group-hover:opacity-80" />
                  
                  <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between text-white">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-studio-accent">
                        {category.productCount} Handcrafted Pieces
                      </p>
                      <h3 className="mt-1 font-serif text-3xl font-semibold leading-tight">{category.name}</h3>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-studio-primary shadow-xl transition-all duration-500 group-hover:rotate-[-45deg] group-hover:scale-110 group-hover:bg-studio-accent group-hover:text-white">
                      <ArrowRight size={24} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
            
            {categories.length === 0 && (
              <div className="col-span-full py-20 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-studio-light">
                  <ShoppingBag className="text-studio-primary/30" />
                </div>
                <h3 className="text-lg font-semibold text-studio-primary">No collections live yet</h3>
                <p className="text-studio-ink/40">Check back soon for our latest designer edits.</p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* ═══════════════════ CTA SECTION ═══════════════════ */}
      <section className="section-shell mt-24">
        <div className="relative overflow-hidden rounded-[3rem] border border-studio-primary/10 bg-white p-12 text-center md:p-20">
          {/* Decorative background elements */}
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-studio-accent/5 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-studio-primary/5 blur-3xl" />

          <div className="relative">
            <h2 className="font-serif text-4xl font-semibold text-studio-primary md:text-5xl">Prefer browsing everything?</h2>
            <p className="mx-auto mt-6 max-w-xl text-studio-ink/60">
              Browse our complete catalog with advanced filters for price, latest arrivals, and more.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link 
                href="/products" 
                className="group inline-flex items-center gap-3 rounded-full bg-studio-primary px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] text-white shadow-xl transition-all hover:bg-studio-accent hover:shadow-studio-accent/20"
              >
                Explore All Products
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

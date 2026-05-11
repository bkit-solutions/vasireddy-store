import { Hero } from "@/components/store/Hero";
import { ProductCard } from "@/components/store/ProductCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getActiveProducts, getTrendingProducts, type StoreProduct } from "@/lib/store-data";
import { getActiveBanners } from "@/lib/banner-data";
import {
  Gem,
  ShieldCheck,
  Sparkles,
  Truck,
  ArrowRight,
  Star,
  Heart,
  Award,
  Crown,
  ShoppingBag,
} from "lucide-react";
import Link from "next/link";

export default async function StoreHomePage() {
  const [allProducts, trending, banners] = await Promise.all([
    getActiveProducts({ take: 6 }),
    getTrendingProducts(3),
    getActiveBanners(),
  ]);

  const latest = allProducts.slice(0, 3);
  const featured = allProducts.slice(3, 6);

  return (
    <div className="pb-20">
      <Hero banners={banners} />

      {/* ─────────── TRUST STRIP ─────────── */}
      <section className="section-shell mt-8 animate-reveal-up">
        <div className="grid grid-cols-1 gap-3 rounded-2xl border border-studio-primary/10 bg-white/85 p-4 shadow-[0_20px_38px_-30px_rgba(63,52,143,0.65)] backdrop-blur sm:grid-cols-3 sm:p-5">
          {[
            { icon: Truck, title: "Free Shipping", description: "On orders above ₹1999" },
            { icon: ShieldCheck, title: "Premium Quality", description: "Curated fabrics and finish" },
            { icon: Award, title: "Secure Checkout", description: "100% safe & encrypted" },
          ].map((item) => (
            <div
              key={item.title}
              className="group flex items-center gap-3 rounded-xl bg-studio-light/55 p-3 transition-all hover:bg-studio-light hover:shadow-sm"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm transition-transform group-hover:scale-110">
                <item.icon className="text-studio-primary" size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-studio-primary">{item.title}</p>
                <p className="text-xs text-studio-ink/70">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─────────── LATEST ARRIVALS ─────────── */}
      <section className="section-shell mt-16 animate-reveal-up">
        <SectionBlock
          tag="New Drops"
          title="Latest Arrivals"
          subtitle="Freshly curated drops from our latest edit."
          accent="primary"
          ctaHref="/products"
          ctaLabel="Shop All"
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {latest.length > 0 ? (
            latest.map((product: StoreProduct) => <ProductCard key={product.id} {...product} />)
          ) : (
            <p className="col-span-full py-10 text-center text-studio-ink/40">No products found.</p>
          )}
        </div>
      </section>

      {/* ─────────── TRENDING ─────────── */}
      <section className="section-shell mt-16 animate-reveal-up">
        <SectionBlock
          tag="🔥 Hand-Picked"
          title="Trending Now"
          subtitle="The most loved pieces selected by our studio team."
          accent="accent"
          ctaHref="/collections"
          ctaLabel="Explore Trends"
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {trending.length > 0 ? (
            trending.map((product: StoreProduct) => <ProductCard key={product.id} {...product} />)
          ) : (
            <div className="col-span-full rounded-3xl border border-dashed border-studio-primary/10 bg-studio-light/30 p-12 text-center">
               <p className="text-studio-ink/50 text-sm">Select trending items in the admin panel to show them here!</p>
            </div>
          )}
        </div>
      </section>

      {/* ─────────── PROMO BANNERS - REDESIGNED ─────────── */}
      <section className="section-shell mt-32 animate-reveal-up">
        <div className="grid gap-8 md:grid-cols-2">
          {/* Bridal Banner */}
          <article className="group relative min-h-[420px] overflow-hidden rounded-[3.5rem] bg-[#120f0d] shadow-[0_40px_80px_-20px_rgba(18,15,13,0.4)] transition-all hover:shadow-[0_60px_100px_-20px_rgba(18,15,13,0.5)]">
            {/* Background Texture/Pattern */}
            <div className="absolute inset-0 opacity-15 transition-transform duration-1000 group-hover:scale-110" 
                 style={{ backgroundImage: "linear-gradient(30deg, #333 12%, transparent 12.5%, transparent 87%, #333 87.5%, #333), linear-gradient(150deg, #333 12%, transparent 12.5%, transparent 87%, #333 87.5%, #333), linear-gradient(30deg, #333 12%, transparent 12.5%, transparent 87%, #333 87.5%, #333), linear-gradient(150deg, #333 12%, transparent 12.5%, transparent 87%, #333 87.5%, #333), linear-gradient(60deg, #555 25%, transparent 25.5%, transparent 75%, #555 75%, #555), linear-gradient(60deg, #555 25%, transparent 25.5%, transparent 75%, #555 75%, #555)", backgroundSize: "40px 70px" }} />
            
            <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-studio-accent/20 blur-[100px] transition-all duration-700 group-hover:bg-studio-accent/30" />
            
            <div className="relative flex h-full flex-col justify-between p-10 md:p-14">
              <div>
                <div className="inline-flex items-center gap-3 rounded-full bg-white/5 px-5 py-2 text-[10px] font-bold uppercase tracking-[0.3em] text-studio-accent backdrop-blur-xl border border-white/10">
                  <Crown size={14} strokeWidth={1.5} />
                  Bridal Couture
                </div>
                <h3 className="mt-8 font-serif text-4xl font-semibold leading-tight text-white md:text-5xl lg:text-6xl">
                  Curated Bridal <br /> Statements
                </h3>
                <p className="mt-6 max-w-sm text-base text-white/60 leading-relaxed md:text-lg">
                  Timeless zari work and handcrafted embroidery designed for your most precious moments.
                </p>
              </div>

              <div className="mt-12">
                <Link
                  href="/collections"
                  className="group/btn inline-flex items-center gap-4 rounded-full bg-white px-10 py-5 text-[11px] font-bold uppercase tracking-[0.25em] text-studio-primary shadow-2xl transition-all hover:bg-studio-accent hover:text-white"
                >
                  Shop Collection
                  <ArrowRight size={18} className="transition-transform group-hover/btn:translate-x-2" />
                </Link>
              </div>
            </div>
            
            <div className="pointer-events-none absolute bottom-0 right-0 p-10 text-white/[0.03] transition-transform duration-700 group-hover:translate-x-4 group-hover:-translate-y-4">
              <ShoppingBag size={240} strokeWidth={0.5} />
            </div>
          </article>

          {/* Festive Banner */}
          <article className="group relative min-h-[420px] overflow-hidden rounded-[3.5rem] bg-[#1a1635] shadow-[0_40px_80px_-20px_rgba(26,22,53,0.4)] transition-all hover:shadow-[0_60px_100px_-20px_rgba(26,22,53,0.5)]">
             {/* Background Texture/Pattern */}
             <div className="absolute inset-0 opacity-10 transition-transform duration-1000 group-hover:scale-110" 
                 style={{ backgroundImage: "radial-gradient(circle at 2px 2px, #fff 1px, transparent 0)", backgroundSize: "32px 32px" }} />

            <div className="absolute -left-20 -bottom-20 h-80 w-80 rounded-full bg-studio-accent/20 blur-[100px] transition-all duration-700 group-hover:bg-studio-accent/30" />
            
            <div className="relative flex h-full flex-col justify-between p-10 md:p-14">
              <div>
                <div className="inline-flex items-center gap-3 rounded-full bg-white/5 px-5 py-2 text-[10px] font-bold uppercase tracking-[0.3em] text-studio-accent backdrop-blur-xl border border-white/10">
                  <Sparkles size={14} strokeWidth={1.5} />
                  Festive Edit
                </div>
                <h3 className="mt-8 font-serif text-4xl font-semibold leading-tight text-white md:text-5xl lg:text-6xl">
                  The Celebration <br /> Boutique
                </h3>
                <p className="mt-6 max-w-sm text-base text-white/60 leading-relaxed md:text-lg">
                  Luminous palettes and contemporary silhouettes for the modern woman of celebration.
                </p>
              </div>

              <div className="mt-12">
                <Link
                  href="/collections"
                  className="group/btn inline-flex items-center gap-4 rounded-full bg-white px-10 py-5 text-[11px] font-bold uppercase tracking-[0.25em] text-studio-accent shadow-2xl transition-all hover:bg-studio-primary hover:text-white"
                >
                  Explore Festive
                  <ArrowRight size={18} className="transition-transform group-hover/btn:translate-x-2" />
                </Link>
              </div>
            </div>

            <div className="pointer-events-none absolute bottom-0 right-0 p-10 text-white/[0.03] transition-transform duration-700 group-hover:translate-x-4 group-hover:-translate-y-4">
              <Star size={240} strokeWidth={0.5} />
            </div>
          </article>
        </div>
      </section>

      {/* ─────────── FEATURED ─────────── */}
      <section className="section-shell mt-32 animate-reveal-up">
        <SectionBlock
          tag="Editor's Pick"
          title="Featured Products"
          subtitle="Luxe looks crafted for celebrations all year round."
          accent="primary"
          ctaHref="/products"
          ctaLabel="View All"
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.length > 0 ? (
            featured.map((product: StoreProduct) => <ProductCard key={product.id} {...product} />)
          ) : (
            <p className="col-span-full py-10 text-center text-studio-ink/40">No featured products.</p>
          )}
        </div>
      </section>

      {/* ─────────── WHY CHOOSE US - REDESIGNED ─────────── */}
      <section className="section-shell mt-24 animate-reveal-up">
        {/* Header */}
        <div className="mb-16 text-center">
          <div className="inline-flex items-center gap-3 rounded-full bg-studio-accent/10 px-4 py-2 backdrop-blur">
            <div className="h-2 w-2 rounded-full bg-studio-accent" />
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-studio-accent">
              Quality & Craftsmanship
            </p>
          </div>
          <h2 className="mt-5 font-serif text-4xl font-semibold tracking-tight text-studio-primary md:text-5xl">
            Why Vasireddy
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base text-studio-ink/70 md:text-lg">
            Every piece tells a story of heritage, artistry, and meticulous attention to detail.
          </p>
        </div>

        {/* Three Feature Cards - Full Width with Visual Appeal */}
        <div className="grid gap-6 lg:grid-cols-3 mb-16">
          {[
            {
              icon: Gem,
              title: "Artisan Heritage",
              description: "Hand-finished sarees and blouses crafted with traditional techniques",
              details: "Exclusive zari work, silk threads, and handcrafted embroidery for timeless elegance.",
              highlights: ["Traditional Zari Work", "Premium Silk Threads", "Festive Detailing"],
              bgGradient: "from-studio-primary/5 to-studio-accent/5",
              iconBg: "from-studio-primary to-studio-primary/70",
            },
            {
              icon: ShieldCheck,
              title: "Quality Assurance",
              description: "Rigorous inspection at every step of production",
              details: "Each piece is measured, inspected, and carefully packed by our expert studio team.",
              highlights: ["Pre-Dispatch QC", "Perfect Fit Guarantee", "Expert Packaging"],
              bgGradient: "from-studio-accent/5 to-emerald-500/5",
              iconBg: "from-studio-accent to-studio-accent/70",
            },
            {
              icon: Sparkles,
              title: "Style Support",
              description: "Personal styling guidance for your perfect look",
              details: "Get WhatsApp-ready expert advice on styling, pairings, and occasion-specific recommendations.",
              highlights: ["Live Styling Tips", "Pairing Suggestions", "Occasion Guidance"],
              bgGradient: "from-emerald-500/5 to-studio-primary/5",
              iconBg: "from-emerald-500 to-emerald-600",
            },
          ].map((item) => (
            <article
              key={item.title}
              className={`group relative overflow-hidden rounded-2xl border border-studio-primary/10 bg-gradient-to-br ${item.bgGradient} p-8 backdrop-blur transition-all duration-300 hover:-translate-y-2 hover:border-studio-accent/30 hover:shadow-[0_24px_48px_-24px_rgba(63,52,143,0.6)]`}
            >
              {/* Icon */}
              <div
                className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${item.iconBg} text-white shadow-lg transition-transform duration-300 group-hover:scale-110`}
              >
                <item.icon size={28} />
              </div>

              {/* Content */}
              <h3 className="mt-6 text-xl font-semibold text-studio-primary">{item.title}</h3>
              <p className="mt-2 text-sm font-medium text-studio-ink/70">{item.description}</p>
              <p className="mt-3 text-sm leading-6 text-studio-ink/65">{item.details}</p>

              {/* Highlights */}
              <ul className="mt-6 space-y-2">
                {item.highlights.map((highlight) => (
                  <li key={highlight} className="flex items-center gap-3 text-xs font-medium text-studio-ink/70">
                    <span className="h-1.5 w-1.5 rounded-full bg-studio-accent" />
                    {highlight}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        {/* Stats Section - Redesigned */}
        <div className="relative overflow-hidden rounded-2xl border border-studio-accent/20 bg-gradient-to-r from-studio-primary/5 via-white to-studio-accent/5 p-8 md:p-12">
          <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-studio-accent/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-studio-primary/10 blur-3xl" />

          <div className="relative grid gap-8 sm:grid-cols-3">
            {[
              {
                icon: Heart,
                value: "5000+",
                label: "Happy Customers",
                subtext: "Trusted by brides and celebration lovers",
              },
              {
                icon: Truck,
                value: "48h",
                label: "Express Dispatch",
                subtext: "Quick turnaround on orders",
              },
              {
                icon: Award,
                value: "4.8★",
                label: "Average Rating",
                subtext: "Consistently loved by our community",
              },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center text-center">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-studio-accent/20 text-studio-accent transition-transform duration-300 hover:scale-110">
                  <stat.icon size={24} />
                </div>
                <p className="mt-4 font-serif text-3xl font-semibold text-studio-primary md:text-4xl">
                  {stat.value}
                </p>
                <p className="mt-2 font-semibold text-sm text-studio-ink/80">{stat.label}</p>
                <p className="mt-1 text-xs text-studio-ink/60">{stat.subtext}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


    </div>
  );
}

/* ─────────────────────────────────────────────
   Reusable section heading with tag + CTA
   ───────────────────────────────────────────── */
function SectionBlock({
  tag,
  title,
  subtitle,
  ctaHref,
  ctaLabel,
  accent = "primary",
}: {
  tag: string;
  title: string;
  subtitle: string;
  ctaHref?: string;
  ctaLabel?: string;
  accent?: "primary" | "accent";
}) {
  const accentColor =
    accent === "accent" ? "text-studio-accent" : "text-studio-primary";
  const accentBar = accent === "accent" ? "bg-studio-accent" : "bg-studio-primary";

  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-xl">
        <div className="flex items-center gap-2">
          <span className={`h-px w-8 ${accentBar}`} />
          <p className={`text-xs font-semibold uppercase tracking-[0.25em] ${accentColor}`}>
            {tag}
          </p>
        </div>
        <h2 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-studio-primary md:text-4xl">
          {title}
        </h2>
        <p className="mt-2 text-sm text-studio-ink/70 md:text-base">{subtitle}</p>
      </div>
      {ctaHref && ctaLabel && (
        <Link
          href={ctaHref}
          className="group inline-flex shrink-0 items-center gap-2 rounded-full border border-studio-primary/20 bg-white px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-studio-primary transition-all hover:border-studio-primary hover:bg-studio-primary hover:text-white"
        >
          {ctaLabel}
          <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  );
}
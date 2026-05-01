import { Hero } from "@/components/store/Hero";
import { ProductCard } from "@/components/store/ProductCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getActiveProducts, type StoreProduct } from "@/lib/store-data";
import {
  Gem,
  ShieldCheck,
  Sparkles,
  Truck,
  ArrowRight,
  Star,
  Heart,
  Award,
} from "lucide-react";
import Link from "next/link";

export default async function StoreHomePage() {
  const products = (await getActiveProducts({ take: 9 })) as StoreProduct[];

  const latest = products.slice(0, 3);
  const trending = products.slice(3, 6);
  const featured = products.slice(6, 9);

  return (
    <div className="pb-20">
      <Hero />

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
          ctaHref="/collections"
          ctaLabel="Shop New"
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {latest.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </section>

      {/* ─────────── TRENDING ─────────── */}
      <section className="section-shell mt-16 animate-reveal-up">
        <SectionBlock
          tag="🔥 Hot Right Now"
          title="Trending Now"
          subtitle="Most viewed picks for current wedding and festive edits."
          accent="accent"
          ctaHref="/collections"
          ctaLabel="Explore Trends"
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {trending.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </section>

      {/* ─────────── PROMO BANNERS ─────────── */}
      <section className="section-shell mt-16 animate-reveal-up">
        <div className="grid gap-4 md:grid-cols-2">
          {/* Bridal Banner */}
          <article className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-studio-primary via-studio-primary to-studio-primary/90 px-6 py-10 text-white shadow-[0_24px_45px_-30px_rgba(63,52,143,0.8)] transition-all hover:shadow-[0_30px_55px_-30px_rgba(63,52,143,0.95)] md:px-10 md:py-12">
            {/* Decorative elements */}
            <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5 blur-2xl transition-transform duration-700 group-hover:scale-125" />
            <div className="pointer-events-none absolute -bottom-12 -left-12 h-44 w-44 rounded-full bg-studio-accent/20 blur-2xl" />
            <div className="pointer-events-none absolute right-6 top-6 text-white/10">
              <Gem size={80} />
            </div>

            <div className="relative">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] backdrop-blur">
                <Sparkles size={12} />
                Wedding Collection
              </span>
              <h3 className="mt-4 font-serif text-3xl font-semibold leading-tight md:text-4xl">
                Curated Bridal <br /> Statements
              </h3>
              <p className="mt-3 max-w-sm text-sm text-white/80 md:text-base">
                Exclusive zari, silk, and handcrafted embroidery for your big day.
              </p>
              <Link
                href="/collections?category=sarees"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-studio-primary transition-all hover:gap-3 hover:bg-studio-light"
              >
                Shop Bridal
                <ArrowRight size={14} />
              </Link>
            </div>
          </article>

          {/* Festive Banner */}
          <article className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-studio-accent via-studio-accent to-studio-accent/90 px-6 py-10 text-white shadow-[0_24px_45px_-30px_rgba(84,70,203,0.8)] transition-all hover:shadow-[0_30px_55px_-30px_rgba(84,70,203,0.95)] md:px-10 md:py-12">
            <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5 blur-2xl transition-transform duration-700 group-hover:scale-125" />
            <div className="pointer-events-none absolute -bottom-12 -left-12 h-44 w-44 rounded-full bg-studio-primary/30 blur-2xl" />
            <div className="pointer-events-none absolute right-6 top-6 text-white/10">
              <Sparkles size={80} />
            </div>

            <div className="relative">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] backdrop-blur">
                <Star size={12} />
                Festive Collection
              </span>
              <h3 className="mt-4 font-serif text-3xl font-semibold leading-tight md:text-4xl">
                The Celebration <br /> Edit
              </h3>
              <p className="mt-3 max-w-sm text-sm text-white/80 md:text-base">
                Luminous palettes and festive silhouettes for every occasion.
              </p>
              <Link
                href="/collections?category=blouses"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-studio-accent transition-all hover:gap-3 hover:bg-studio-light"
              >
                Shop Festive
                <ArrowRight size={14} />
              </Link>
            </div>
          </article>
        </div>
      </section>

      {/* ─────────── FEATURED ─────────── */}
      <section className="section-shell mt-16 animate-reveal-up">
        <SectionBlock
          tag="Editor's Pick"
          title="Featured Products"
          subtitle="Luxe looks crafted for celebrations all year round."
          accent="primary"
          ctaHref="/collections"
          ctaLabel="View Featured"
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
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
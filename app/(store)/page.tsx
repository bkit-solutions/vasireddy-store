import { CategoryGrid } from "@/components/store/CategoryGrid";
import { Hero } from "@/components/store/Hero";
import { ProductCard } from "@/components/store/ProductCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getActiveProducts, getStoreCategories, type StoreProduct } from "@/lib/store-data";
import {
  Gem,
  RefreshCw,
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
  const [categories, products] = (await Promise.all([
    getStoreCategories(),
    getActiveProducts({ take: 9 }),
  ])) as [Awaited<ReturnType<typeof getStoreCategories>>, StoreProduct[]];

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
            { icon: RefreshCw, title: "Easy Returns", description: "7-day return support" },
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

      {/* ─────────── CATEGORIES ─────────── */}
      <section className="section-shell mt-16 animate-reveal-up">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-px w-8 bg-studio-accent" />
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-studio-accent">
                Explore Collections
              </p>
            </div>
            <h2 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-studio-primary md:text-4xl">
              Shop Categories
            </h2>
            <p className="mt-2 text-sm text-studio-ink/70 md:text-base">
              Designed for every milestone and memory.
            </p>
          </div>
          <Link
            href="/collections"
            className="group hidden shrink-0 items-center gap-2 rounded-full border border-studio-primary/20 bg-white px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-studio-primary transition-all hover:border-studio-primary hover:bg-studio-primary hover:text-white sm:inline-flex"
          >
            View All
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        <CategoryGrid categories={categories} />
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

      {/* ─────────── WHY CHOOSE US ─────────── */}
      <section className="section-shell mt-20">
        <div className="relative overflow-hidden rounded-[2rem] border border-studio-primary/10 bg-gradient-to-br from-white via-studio-light/30 to-white p-6 shadow-[0_24px_50px_-34px_rgba(63,52,143,0.6)] md:p-10">
          {/* Decorative elements */}
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-studio-accent/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-studio-primary/5 blur-3xl" />

          <div className="relative">
            <div className="mb-10 text-center">
              <div className="inline-flex items-center gap-2">
                <span className="h-px w-8 bg-studio-accent" />
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-studio-accent">
                  The Promise
                </p>
                <span className="h-px w-8 bg-studio-accent" />
              </div>
              <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight text-studio-primary md:text-4xl">
                Why Choose Us
              </h2>
              <p className="mx-auto mt-2 max-w-xl text-sm text-studio-ink/70 md:text-base">
                Designed to feel couture from browse to delivery.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {[
                {
                  icon: Gem,
                  title: "Artisan Craft",
                  text: "Hand-finished sarees and blouses with embroidery and festive detailing.",
                  color: "from-studio-primary to-studio-primary/70",
                },
                {
                  icon: ShieldCheck,
                  title: "QC Before Dispatch",
                  text: "Each product is measured, inspected, and packed by our studio team.",
                  color: "from-studio-accent to-studio-accent/70",
                },
                {
                  icon: Sparkles,
                  title: "Style Assistance",
                  text: "Get WhatsApp-ready styling support for blouses, pairings, and occasions.",
                  color: "from-emerald-500 to-emerald-600",
                },
              ].map((item) => (
                <article
                  key={item.title}
                  className="group relative overflow-hidden rounded-2xl border border-studio-primary/10 bg-white p-6 shadow-[0_14px_30px_-24px_rgba(63,52,143,0.6)] transition-all hover:-translate-y-1 hover:shadow-[0_20px_40px_-24px_rgba(63,52,143,0.75)]"
                >
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${item.color} text-white shadow-md transition-transform group-hover:scale-110`}
                  >
                    <item.icon size={22} />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-studio-primary">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-studio-ink/75">{item.text}</p>
                </article>
              ))}
            </div>

            {/* Stats */}
            <div className="mt-8 grid gap-3 sm:grid-cols-4">
              {[
                { value: "5000+", label: "Happy Customers", icon: Heart },
                { value: "48h", label: "Dispatch Window", icon: Truck },
                { value: "7 Days", label: "Easy Returns", icon: RefreshCw },
                { value: "4.8★", label: "Avg Rating", icon: Award },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="group relative overflow-hidden rounded-2xl border border-studio-primary/10 bg-white/75 px-4 py-4 text-center backdrop-blur transition-all hover:-translate-y-0.5 hover:border-studio-accent/30 hover:shadow-md"
                >
                  <stat.icon
                    className="mx-auto mb-2 text-studio-accent/70 transition-transform group-hover:scale-110"
                    size={18}
                  />
                  <p className="font-serif text-2xl font-semibold text-studio-primary md:text-3xl">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-studio-ink/60">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─────────── NEWSLETTER CTA ─────────── */}
      <section className="section-shell mt-16">
        <div className="relative overflow-hidden rounded-3xl bg-studio-primary px-6 py-10 text-white shadow-[0_30px_55px_-30px_rgba(63,52,143,0.9)] md:px-12 md:py-14">
          <div className="pointer-events-none absolute -right-16 -top-16 h-60 w-60 rounded-full bg-studio-accent/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-white/5 blur-3xl" />

          <div className="relative grid gap-6 md:grid-cols-2 md:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] backdrop-blur">
                <Sparkles size={12} />
                Join the Studio
              </span>
              <h3 className="mt-4 font-serif text-3xl font-semibold leading-tight md:text-4xl">
                Be the first to know <br className="hidden md:block" />
                about new drops
              </h3>
              <p className="mt-3 max-w-md text-sm text-white/80 md:text-base">
                Subscribe for early access to festive edits, styling tips, and exclusive member-only offers.
              </p>
            </div>

            <form className="flex w-full flex-col gap-3 sm:flex-row">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm text-white placeholder:text-white/50 backdrop-blur focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-studio-primary transition-all hover:bg-studio-light"
              >
                Subscribe
                <ArrowRight size={14} />
              </button>
            </form>
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
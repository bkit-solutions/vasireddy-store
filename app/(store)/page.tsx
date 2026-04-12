import { CategoryGrid } from "@/components/store/CategoryGrid";
import { Hero } from "@/components/store/Hero";
import { ProductCard } from "@/components/store/ProductCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getActiveProducts, getStoreCategories, type StoreProduct } from "@/lib/store-data";
import { Gem, RefreshCw, ShieldCheck, Sparkles, Truck } from "lucide-react";

export default async function StoreHomePage() {
  const [categories, products] = await Promise.all([
    getStoreCategories(),
    getActiveProducts({ take: 9 }),
  ]) as [Awaited<ReturnType<typeof getStoreCategories>>, StoreProduct[]];

  const latest = products.slice(0, 3);
  const trending = products.slice(3, 6);
  const featured = products.slice(6, 9);

  return (
    <div className="pb-16">
      <Hero />

      <section className="section-shell mt-8 animate-reveal-up">
        <div className="grid grid-cols-1 gap-3 rounded-2xl border border-studio-primary/10 bg-white/85 p-4 shadow-[0_20px_38px_-30px_rgba(63,52,143,0.65)] backdrop-blur sm:grid-cols-3 sm:p-5">
          {[
            { icon: Truck, title: "Free Shipping", description: "On orders above ₹1999" },
            { icon: ShieldCheck, title: "Premium Quality", description: "Curated fabrics and finish" },
            { icon: RefreshCw, title: "Easy Returns", description: "7-day return support" },
          ].map((item) => (
            <div key={item.title} className="flex items-center gap-3 rounded-xl bg-studio-light/55 p-3">
              <item.icon className="text-studio-primary" size={18} />
              <div>
                <p className="text-sm font-semibold text-studio-primary">{item.title}</p>
                <p className="text-xs text-studio-ink/70">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section-shell mt-14 animate-reveal-up">
        <SectionHeading title="Shop Categories" subtitle="Designed for every milestone and memory." />
        <CategoryGrid categories={categories} />
      </section>

      <section className="section-shell mt-14 animate-reveal-up">
        <SectionHeading title="Latest Arrivals" subtitle="Freshly curated drops from our latest edit." />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {latest.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </section>

      <section className="section-shell mt-14 animate-reveal-up">
        <SectionHeading title="Trending Now" subtitle="Most viewed picks for current wedding and festive edits." />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {trending.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </section>

      <section className="section-shell mt-14 animate-reveal-up">
        <SectionHeading title="Featured Products" subtitle="Luxe looks crafted for celebrations all year round." />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </section>

      <section className="section-shell mt-14 animate-reveal-up">
        <div className="grid gap-4 md:grid-cols-2">
          <article className="rounded-3xl bg-studio-primary px-6 py-8 text-white shadow-[0_24px_45px_-30px_rgba(63,52,143,0.8)] md:px-8">
            <p className="text-xs uppercase tracking-[0.14em] text-white/80">Wedding Collection</p>
            <h3 className="mt-2 text-3xl font-semibold">Curated Bridal Statements</h3>
            <p className="mt-3 text-sm text-white/80">Exclusive zari, silk, and handcrafted embroidery for your big day.</p>
          </article>
          <article className="rounded-3xl bg-studio-accent px-6 py-8 text-white shadow-[0_24px_45px_-30px_rgba(84,70,203,0.8)] md:px-8">
            <p className="text-xs uppercase tracking-[0.14em] text-white/80">Festive Collection</p>
            <h3 className="mt-2 text-3xl font-semibold">The Celebration Edit</h3>
            <p className="mt-3 text-sm text-white/80">Luminous palettes and festive silhouettes for every occasion.</p>
          </article>
        </div>
      </section>

      <section className="section-shell mt-14">
        <SectionHeading title="Why Choose Us" subtitle="Designed to feel couture from browse to delivery." />
        <div className="rounded-3xl border border-studio-primary/10 bg-white p-5 shadow-[0_24px_50px_-34px_rgba(63,52,143,0.6)] md:p-7">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                icon: Gem,
                title: "Artisan Craft",
                text: "Hand-finished sarees and blouses with embroidery and festive detailing.",
              },
              {
                icon: ShieldCheck,
                title: "QC Before Dispatch",
                text: "Each product is measured, inspected, and packed by our studio team.",
              },
              {
                icon: Sparkles,
                title: "Style Assistance",
                text: "Get WhatsApp-ready styling support for blouses, pairings, and occasions.",
              },
            ].map((item) => (
              <article
                key={item.title}
                className="rounded-2xl border border-studio-primary/10 bg-white p-5 shadow-[0_14px_30px_-24px_rgba(63,52,143,0.6)]"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-studio-primary text-white">
                  <item.icon size={18} />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-studio-primary">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-studio-ink/80">{item.text}</p>
              </article>
            ))}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {[
              { value: "5000+", label: "Happy Customers" },
              { value: "48h", label: "Dispatch Window" },
              { value: "7 Days", label: "Easy Returns" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-studio-primary/10 bg-white/75 px-4 py-3 text-center">
                <p className="text-2xl font-semibold text-studio-primary">{stat.value}</p>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-studio-ink/60">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

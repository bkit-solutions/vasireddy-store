import Link from "next/link";

export function Hero() {
  return (
    <section className="section-shell pt-10 md:pt-14">
      <div className="animate-reveal-up overflow-hidden rounded-3xl border border-studio-primary/10 bg-studio-cream px-6 py-10 shadow-[0_24px_50px_-30px_rgba(32,29,26,0.3)] md:px-14 md:py-14">
        <div className="grid items-center gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <span className="inline-flex rounded-full border border-studio-primary/10 bg-white/70 px-4 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-studio-primary">
              Vasireddy Designer Studio
            </span>
            <h1 className="mt-5 max-w-2xl text-4xl font-semibold leading-tight text-studio-primary md:text-6xl">
              Crafted for grand celebrations and couture confidence.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-studio-ink/85 md:text-lg">
              Discover wedding heirlooms, festive edits, and new arrivals made for modern Indian silhouettes.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/collections"
                className="rounded-full bg-studio-primary px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-studio-accent"
              >
                Shop Collections
              </Link>
              <Link
                href="/products"
                className="rounded-full border border-studio-primary/20 bg-white/90 px-6 py-3 text-sm font-semibold text-studio-primary transition hover:-translate-y-0.5 hover:border-studio-accent hover:text-studio-accent"
              >
                Explore Products
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div className="animate-soft-float rounded-2xl border border-white/70 bg-white/85 p-5 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.14em] text-studio-accent">Bridal Edit</p>
              <h3 className="mt-1 text-2xl font-semibold text-studio-primary">Wedding Luxe 2026</h3>
              <p className="mt-2 text-sm text-studio-ink/75">Limited artisanal drops for bridal and reception looks.</p>
            </div>
            <div className="animate-soft-float rounded-2xl border border-white/70 bg-white/85 p-5 backdrop-blur" style={{ animationDelay: "0.35s" }}>
              <p className="text-xs uppercase tracking-[0.14em] text-studio-accent">Customer Love</p>
              <h3 className="mt-1 text-2xl font-semibold text-studio-primary">4.8/5 Style Rating</h3>
              <p className="mt-2 text-sm text-studio-ink/75">Trusted by 30,000+ shoppers across India.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

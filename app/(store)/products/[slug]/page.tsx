import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { AddToCartButton } from "@/components/store/AddToCartButton";
import { WishlistButton } from "@/components/store/WishlistButton";
import { ReviewSection } from "@/components/store/ReviewSection";
import { authOptions } from "@/lib/auth";
import { getProductBySlug } from "@/lib/store-data";
import { formatCurrency } from "@/lib/utils";

/* ─────────────────────────────────────────────
   CATEGORY CONFIG — sizes + details per category
   ───────────────────────────────────────────── */
type SizeOption = {
  label: string;
  sublabel?: string; // e.g. measurements like "34-36"
};

type SizeConfig = {
  type: "standard" | "blouse" | "saree" | "lehenga" | "kurti" | "freesize" | "custom";
  title: string;
  helperText?: string;
  options: SizeOption[];
  allowCustom?: boolean; // show "Custom Stitching" option
};

function getCategoryConfig(categorySlug: string) {
  const key = categorySlug.toLowerCase();

  /* ───── SAREE ───── */
  if (key.includes("saree")) {
    return {
      fitTitle: "Saree Details",
      specs: [
        { label: "Fabric Feel", value: "Soft drape with festive sheen" },
        { label: "Length", value: "Approx. 5.5m saree + 0.8m blouse piece" },
        { label: "Occasion", value: "Festive, Wedding, Reception" },
        { label: "Finish", value: "Rich border and woven motifs" },
      ],
      styleNotes: [
        "Pair with temple jewelry for traditional styling.",
        "Works beautifully with contrast blouse tones.",
        "Drape in classic Nivi style for formal events.",
      ],
      size: {
        type: "saree",
        title: "Blouse Piece Size",
        helperText: "Saree comes with an unstitched blouse piece (0.8m). Select your preferred stitched blouse size or get it tailored.",
        options: [
          { label: "Unstitched", sublabel: "As-is fabric" },
          { label: "32", sublabel: "XS" },
          { label: "34", sublabel: "S" },
          { label: "36", sublabel: "M" },
          { label: "38", sublabel: "L" },
          { label: "40", sublabel: "XL" },
          { label: "42", sublabel: "XXL" },
        ],
        allowCustom: true,
      } as SizeConfig,
    };
  }

  /* ───── BLOUSE ───── */
  if (key.includes("blouse")) {
    return {
      fitTitle: "Blouse Details",
      specs: [
        { label: "Silhouette", value: "Structured festive fit" },
        { label: "Sleeve Profile", value: "Tailorable for custom styling" },
        { label: "Occasion", value: "Wedding, Festive, Cocktail" },
        { label: "Finish", value: "Embellished handcrafted accents" },
      ],
      styleNotes: [
        "Pairs well with silk sarees and lehengas.",
        "Add statement earrings for evening events.",
        "Can be styled as a festive crop top with skirts.",
      ],
      size: {
        type: "blouse",
        title: "Bust Size",
        helperText: "Choose bust size in inches. For custom measurements, select 'Custom Stitching'.",
        options: [
          { label: "32", sublabel: "XS" },
          { label: "34", sublabel: "S" },
          { label: "36", sublabel: "M" },
          { label: "38", sublabel: "L" },
          { label: "40", sublabel: "XL" },
          { label: "42", sublabel: "XXL" },
          { label: "44", sublabel: "3XL" },
        ],
        allowCustom: true,
      } as SizeConfig,
    };
  }

  /* ───── LEHENGA ───── */
  if (key.includes("lehenga") || key.includes("ghagra")) {
    return {
      fitTitle: "Lehenga Details",
      specs: [
        { label: "Set Includes", value: "Lehenga, Choli, Dupatta" },
        { label: "Flare", value: "Semi-stitched with wide flare" },
        { label: "Occasion", value: "Wedding, Sangeet, Reception" },
        { label: "Finish", value: "Heavy embroidery & zari work" },
      ],
      styleNotes: [
        "Style with a contrast dupatta for a regal look.",
        "Complete the look with kundan jewelry.",
        "Perfect for wedding functions and sangeets.",
      ],
      size: {
        type: "lehenga",
        title: "Waist & Choli Size",
        helperText: "Semi-stitched — can be altered up to 4 inches. Select based on your waist size.",
        options: [
          { label: "XS", sublabel: "26-28" },
          { label: "S", sublabel: "28-30" },
          { label: "M", sublabel: "30-32" },
          { label: "L", sublabel: "32-34" },
          { label: "XL", sublabel: "34-36" },
          { label: "XXL", sublabel: "36-38" },
        ],
        allowCustom: true,
      } as SizeConfig,
    };
  }

  /* ───── KURTI / KURTA ───── */
  if (key.includes("kurti") || key.includes("kurta") || key.includes("suit") || key.includes("salwar")) {
    return {
      fitTitle: "Kurti Details",
      specs: [
        { label: "Fit", value: "Regular festive fit" },
        { label: "Length", value: "Knee length" },
        { label: "Occasion", value: "Casual, Office, Festive" },
        { label: "Finish", value: "Premium fabric with detailing" },
      ],
      styleNotes: [
        "Pairs well with palazzos, churidars or leggings.",
        "Add juttis for a traditional vibe.",
        "Layer with a jacket for winter styling.",
      ],
      size: {
        type: "kurti",
        title: "Select Size",
        options: [
          { label: "XS", sublabel: "34" },
          { label: "S", sublabel: "36" },
          { label: "M", sublabel: "38" },
          { label: "L", sublabel: "40" },
          { label: "XL", sublabel: "42" },
          { label: "XXL", sublabel: "44" },
          { label: "3XL", sublabel: "46" },
        ],
        allowCustom: false,
      } as SizeConfig,
    };
  }

  /* ───── DUPATTA / STOLE / SCARF ───── */
  if (key.includes("dupatta") || key.includes("stole") || key.includes("scarf")) {
    return {
      fitTitle: "Dupatta Details",
      specs: [
        { label: "Length", value: "2.25m x 0.9m standard" },
        { label: "Fabric", value: "Lightweight with soft drape" },
        { label: "Occasion", value: "Festive & everyday" },
        { label: "Finish", value: "Decorative borders & tassels" },
      ],
      styleNotes: [
        "Drape over shoulders or style as a cape.",
        "Pair with solid kurtas for contrast.",
        "Perfect finishing touch to ethnic outfits.",
      ],
      size: {
        type: "freesize",
        title: "Size",
        options: [{ label: "Free Size", sublabel: "One size fits all" }],
        allowCustom: false,
      } as SizeConfig,
    };
  }

  /* ───── JEWELRY / ACCESSORIES ───── */
  if (key.includes("jewel") || key.includes("accessor") || key.includes("bag") || key.includes("clutch")) {
    return {
      fitTitle: "Product Details",
      specs: [
        { label: "Material", value: "Premium crafted accents" },
        { label: "Occasion", value: "Festive & Celebration wear" },
        { label: "Care", value: "Store in dry place, avoid moisture" },
        { label: "Finish", value: "Quality-checked studio finish" },
      ],
      styleNotes: [
        "Layer with ethnic outfits for a statement look.",
        "Perfect accent for wedding functions.",
        "Store in pouch to retain shine and finish.",
      ],
      size: {
        type: "freesize",
        title: "Size",
        options: [{ label: "Free Size", sublabel: "Standard" }],
        allowCustom: false,
      } as SizeConfig,
    };
  }

  /* ───── DEFAULT (Gowns, Dresses, etc.) ───── */
  return {
    fitTitle: "Product Details",
    specs: [
      { label: "Craft", value: "Premium festive craftsmanship" },
      { label: "Comfort", value: "Designed for all-day wear" },
      { label: "Occasion", value: "Celebrations and special events" },
      { label: "Finish", value: "Quality-checked studio finish" },
    ],
    styleNotes: [
      "Style with minimal accessories for elegant looks.",
      "Perfect for festive and occasion wear wardrobes.",
      "Store in garment cover to preserve texture and finish.",
    ],
    size: {
      type: "standard",
      title: "Select Size",
      options: [
        { label: "XS" },
        { label: "S" },
        { label: "M" },
        { label: "L" },
        { label: "XL" },
        { label: "XXL" },
      ],
      allowCustom: true,
    } as SizeConfig,
  };
}

const TRUST_BADGES = [
  {
    title: "Premium Quality",
    description: "Handpicked fabrics & finish",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    title: "7-Day Returns",
    description: "Easy returns & exchanges",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
  },
  {
    title: "Secure Checkout",
    description: "100% safe & encrypted",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
  },
  {
    title: "Free Shipping",
    description: "On orders above ₹999",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
      </svg>
    ),
  },
];

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const session = await getServerSession(authOptions);
  if (!session) {
    const callbackUrl = encodeURIComponent(`/products/${resolvedParams.slug}`);
    redirect(`/login?callbackUrl=${callbackUrl}`);
  }

  const product = await getProductBySlug(resolvedParams.slug);
  if (!product) notFound();

  const details = getCategoryConfig(product.categorySlug);
  const sizeConfig = details.size;
  const isFreeSize = sizeConfig.type === "freesize";

  return (
    <section className="section-shell py-8 sm:py-12">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-studio-ink/60">
        <a href="/" className="hover:text-studio-primary transition-colors">Home</a>
        <span>/</span>
        <a href="/products" className="hover:text-studio-primary transition-colors">Products</a>
        <span>/</span>
        <a href={`/categories/${product.categorySlug}`} className="hover:text-studio-primary transition-colors">
          {product.category}
        </a>
        <span>/</span>
        <span className="text-studio-primary font-medium truncate">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
        {/* Product Image */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="group relative aspect-[4/5] overflow-hidden rounded-3xl border border-studio-primary/10 bg-studio-light shadow-[0_20px_60px_-30px_rgba(63,52,143,0.4)]">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-studio-ink/30">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}

            <div className="absolute left-4 top-4 flex flex-col gap-2">
              <span className="rounded-full bg-white/95 backdrop-blur px-3 py-1 text-xs font-semibold text-studio-primary shadow-sm">
                New Arrival
              </span>
            </div>

            <div className="absolute right-4 top-4">
              <WishlistButton productId={product.id} compact={true} />
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          {/* Category & Rating */}
          <div className="flex items-center justify-between gap-3">
            <p className="inline-flex rounded-full border border-studio-primary/15 bg-white px-3 py-1 text-xs uppercase tracking-[0.14em] text-studio-accent font-semibold">
              {product.category}
            </p>
            <div className="flex items-center gap-1.5 text-sm">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-studio-ink/70">4.8 (120 reviews)</span>
            </div>
          </div>

          <h1 className="mt-4 text-3xl sm:text-4xl font-semibold text-studio-primary leading-tight">
            {product.name}
          </h1>

          <div className="mt-5 flex items-baseline gap-3">
            <p className="text-3xl font-bold text-studio-ink">{formatCurrency(product.price)}</p>
            <p className="text-lg text-studio-ink/40 line-through">{formatCurrency(product.price * 1.25)}</p>
            <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
              20% OFF
            </span>
          </div>
          <p className="mt-1 text-xs text-studio-ink/60">Inclusive of all taxes</p>

          <div className="my-6 h-px bg-gradient-to-r from-studio-primary/10 via-studio-primary/20 to-transparent" />

          <p className="text-studio-ink/75 leading-relaxed">{product.description}</p>

          {/* ─────────────────────────────────────────────
              DYNAMIC SIZE SECTION — based on category
              ───────────────────────────────────────────── */}
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-studio-primary">{sizeConfig.title}</p>
                {sizeConfig.helperText && (
                  <p className="mt-0.5 text-xs text-studio-ink/60 max-w-md leading-relaxed">
                    {sizeConfig.helperText}
                  </p>
                )}
              </div>
              {!isFreeSize && (
                <button className="shrink-0 inline-flex items-center gap-1 text-xs text-studio-accent hover:underline font-medium">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h16M4 12h16M4 16h16" />
                  </svg>
                  Size Guide
                </button>
              )}
            </div>

            {/* FREE SIZE badge */}
            {isFreeSize ? (
              <div className="mt-3 inline-flex items-center gap-2 rounded-xl border border-studio-primary/20 bg-studio-light/50 px-4 py-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-studio-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-studio-primary">Free Size</p>
                  <p className="text-xs text-studio-ink/60">{sizeConfig.options[0]?.sublabel}</p>
                </div>
              </div>
            ) : (
              <>
                {/* Size grid — adapts based on whether options have sublabels */}
                <div className={`mt-3 grid gap-2 ${
                  sizeConfig.options.some((o) => o.sublabel)
                    ? "grid-cols-3 sm:grid-cols-4"
                    : "grid-cols-4 sm:grid-cols-6"
                }`}>
                  {sizeConfig.options.map((size) => (
                    <button
                      key={size.label}
                      className="group relative flex flex-col items-center justify-center rounded-lg border border-studio-primary/20 bg-white px-3 py-2.5 text-sm font-medium text-studio-ink transition hover:border-studio-primary hover:bg-studio-light focus:outline-none focus:ring-2 focus:ring-studio-primary/30"
                    >
                      <span className="font-semibold">{size.label}</span>
                      {size.sublabel && (
                        <span className="mt-0.5 text-[10px] text-studio-ink/50 group-hover:text-studio-accent">
                          {size.sublabel}
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Custom stitching option */}
                {sizeConfig.allowCustom && (
                  <button className="mt-3 flex w-full items-center justify-between rounded-xl border border-dashed border-studio-accent/40 bg-gradient-to-r from-studio-light/40 to-white p-3 text-left transition hover:border-studio-accent hover:bg-studio-light/60">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-studio-accent/10 text-studio-accent">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-studio-primary">Custom Stitching</p>
                        <p className="text-xs text-studio-ink/60">Share your measurements & we'll tailor it</p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-studio-accent">Add →</span>
                  </button>
                )}
              </>
            )}
          </div>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <AddToCartButton productId={product.id} />
            </div>
            <WishlistButton productId={product.id} compact={false} />
          </div>

          {/* Trust Badges */}
          <div className="mt-8 grid grid-cols-2 gap-3 rounded-2xl border border-studio-primary/10 bg-white p-4">
            {TRUST_BADGES.map((badge) => (
              <div key={badge.title} className="flex items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-studio-light text-studio-primary shrink-0">
                  {badge.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-studio-primary">{badge.title}</p>
                  <p className="text-xs text-studio-ink/60">{badge.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Delivery info */}
          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-dashed border-studio-primary/20 bg-studio-light/40 p-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-studio-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <div className="flex-1 text-sm">
              <p className="font-medium text-studio-primary">Delivery & Returns</p>
              <p className="text-xs text-studio-ink/70">Free shipping above ₹999 · Delivered in 4-6 days</p>
            </div>
          </div>
        </div>
      </div>

      {/* Details Section */}
      <div className="mt-16 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-studio-primary/10 bg-white p-6 shadow-[0_16px_28px_-24px_rgba(63,52,143,0.4)]">
          <div className="flex items-center gap-2">
            <div className="h-8 w-1 rounded-full bg-gradient-to-b from-studio-primary to-studio-accent" />
            <h2 className="text-xl font-semibold text-studio-primary">{details.fitTitle}</h2>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {details.specs.map((spec) => (
              <div
                key={spec.label}
                className="rounded-xl border border-studio-primary/10 bg-studio-light/30 px-4 py-3 transition hover:border-studio-primary/30 hover:bg-studio-light/60"
              >
                <p className="text-[10px] uppercase tracking-[0.14em] text-studio-accent font-semibold">{spec.label}</p>
                <p className="mt-1 text-sm text-studio-ink/85 font-medium">{spec.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-studio-primary/10 bg-white p-6 shadow-[0_16px_28px_-24px_rgba(63,52,143,0.4)]">
          <div className="flex items-center gap-2">
            <div className="h-8 w-1 rounded-full bg-gradient-to-b from-studio-primary to-studio-accent" />
            <h2 className="text-xl font-semibold text-studio-primary">Styling Notes</h2>
          </div>
          <ul className="mt-5 space-y-3">
            {details.styleNotes.map((note, idx) => (
              <li key={note} className="flex items-start gap-3 text-sm text-studio-ink/80">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-studio-primary/10 text-xs font-semibold text-studio-primary">
                  {idx + 1}
                </span>
                <span className="leading-relaxed">{note}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Reviews */}
      <div className="mt-16">
        <ReviewSection productId={product.id} isAuthenticated={Boolean(session)} />
      </div>
    </section>
  );
}
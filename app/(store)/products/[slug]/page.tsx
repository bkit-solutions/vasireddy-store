import { notFound } from "next/navigation";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { AddToCartButton } from "@/components/store/AddToCartButton";
import { WishlistButton } from "@/components/store/WishlistButton";
import { ReviewSection } from "@/components/store/ReviewSection";
import { authOptions } from "@/lib/auth";
import { getProductBySlug } from "@/lib/store-data";
import { formatCurrency } from "@/lib/utils";

function getCategoryDetails(categorySlug: string) {
  const key = categorySlug.toLowerCase();

  if (key.includes("saree")) {
    return {
      fitTitle: "Saree Details",
      specs: [
        { label: "Fabric Feel", value: "Soft drape with festive sheen" },
        { label: "Length", value: "Approx. 5.5m saree + blouse piece" },
        { label: "Occasion", value: "Festive, Wedding, Reception" },
        { label: "Finish", value: "Rich border and woven motifs" },
      ],
      styleNotes: [
        "Pair with temple jewelry for traditional styling.",
        "Works beautifully with contrast blouse tones.",
        "Drape in classic Nivi style for formal events.",
      ],
    };
  }

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
    };
  }

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
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const session = await getServerSession(authOptions);
  if (!session) {
    const callbackUrl = encodeURIComponent(`/products/${resolvedParams.slug}`);
    redirect(`/login?callbackUrl=${callbackUrl}`);
  }

  const product = await getProductBySlug(resolvedParams.slug);
  if (!product) notFound();

  const details = getCategoryDetails(product.categorySlug);

  return (
    <section className="section-shell py-12">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="relative h-96 overflow-hidden rounded-3xl border border-studio-primary/10 bg-studio-light shadow-[0_20px_42px_-28px_rgba(63,52,143,0.65)]">
          {product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" /> : null}
        </div>
        <div>
          <p className="inline-flex rounded-full border border-studio-primary/15 bg-white px-3 py-1 text-xs uppercase tracking-[0.14em] text-studio-accent">{product.category}</p>
          <h1 className="mt-3 text-4xl font-semibold text-studio-primary">{product.name}</h1>
          <p className="mt-4 text-xl font-semibold text-studio-ink">{formatCurrency(product.price)}</p>
          <p className="mt-5 text-studio-ink/75">{product.description}</p>

          <div className="mt-5 flex flex-wrap gap-2">
            <span className="rounded-full bg-studio-light px-3 py-1 text-xs font-semibold text-studio-primary">Premium Quality</span>
            <span className="rounded-full bg-studio-light px-3 py-1 text-xs font-semibold text-studio-primary">7-Day Returns</span>
            <span className="rounded-full bg-studio-light px-3 py-1 text-xs font-semibold text-studio-primary">Secure Checkout</span>
          </div>

          <div className="mt-8 flex gap-3">
            <AddToCartButton productId={product.id} />
            <WishlistButton productId={product.id} compact={false} />
          </div>

          <div className="mt-8 rounded-2xl border border-studio-primary/10 bg-white p-4 shadow-[0_16px_28px_-24px_rgba(63,52,143,0.55)]">
            <h2 className="text-lg font-semibold text-studio-primary">{details.fitTitle}</h2>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {details.specs.map((spec) => (
                <div key={spec.label} className="rounded-xl border border-studio-primary/10 px-3 py-2">
                  <p className="text-xs uppercase tracking-[0.12em] text-studio-accent">{spec.label}</p>
                  <p className="mt-1 text-sm text-studio-ink/85">{spec.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-studio-primary/10 bg-white p-4 shadow-[0_16px_28px_-24px_rgba(63,52,143,0.55)]">
            <h2 className="text-lg font-semibold text-studio-primary">Styling Notes</h2>
            <ul className="mt-3 space-y-2 text-sm text-studio-ink/80">
              {details.styleNotes.map((note) => (
                <li key={note}>• {note}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <ReviewSection productId={product.id} isAuthenticated={Boolean(session)} />
    </section>
  );
}

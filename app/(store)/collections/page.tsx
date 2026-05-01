"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ProductCard } from "@/components/store/ProductCard";
import { Search, Grid3x3, List, ChevronRight, Loader } from "lucide-react";

type Category = {
  id: string;
  name: string;
  slug: string;
  productCount: number;
};

type Product = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  category: string;
  categorySlug: string;
  price: number;
  description: string;
  stock: number;
  isActive: boolean;
};

export default function CollectionsPage() {
  const searchParams = useSearchParams();
  const categoryFromUrl = searchParams.get("category");
  const searchFromUrl = searchParams.get("q");

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchFromUrl || "");
  const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl || "");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isSearching, setIsSearching] = useState(false);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        const result = await response.json();
        setCategories(result.data || []);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };

    fetchCategories();
  }, []);

  // Fetch products based on category or search
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let url = "/api/products?";

        if (selectedCategory) {
          url += `category=${encodeURIComponent(selectedCategory)}`;
        } else if (searchQuery) {
          url += `q=${encodeURIComponent(searchQuery)}`;
        }

        const response = await fetch(url);
        const result = await response.json();

        // Transform the data to match our StoreProduct type
        const transformedProducts = (result.data || []).map((product: any) => ({
          id: product.id,
          name: product.name,
          slug: product.slug,
          imageUrl: product.imageUrl,
          category: product.category.name,
          categorySlug: product.category.slug,
          price: Math.round(product.basePrice / 100),
          description: product.description,
          stock: product.stock,
          isActive: product.isActive,
        }));

        setProducts(transformedProducts);
      } catch (error) {
        console.error("Failed to fetch products:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory, searchQuery]);

  const activeCategory = categories.find((c) => c.slug === selectedCategory);
  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCategorySelect = (slug: string) => {
    setSelectedCategory(slug === selectedCategory ? "" : slug);
    setSearchQuery("");
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSelectedCategory("");
      // Products will auto-fetch due to useEffect
    }
  };

  const handleClearFilters = () => {
    setSelectedCategory("");
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-white">
      {/* ═══════════════════ BREADCRUMB ═══════════════════ */}
      <section className="section-shell py-4 text-xs font-medium text-studio-ink/60">
        <nav className="flex items-center gap-2">
          <Link href="/" className="transition hover:text-studio-accent">
            Home
          </Link>
          <span>/</span>
          <span className="text-studio-primary">Collections</span>
          {activeCategory && (
            <>
              <span>/</span>
              <span className="text-studio-primary">{activeCategory.name}</span>
            </>
          )}
        </nav>
      </section>

      {/* ═══════════════════ HERO SECTION ═══════════════════ */}
      <section className="section-shell py-8 sm:py-12">
        <div className="animate-reveal-up relative overflow-hidden rounded-[2rem] border border-studio-primary/10 bg-gradient-to-br from-white via-studio-light/40 to-white p-8 shadow-[0_30px_60px_-40px_rgba(32,29,26,0.4)] backdrop-blur md:p-12">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-studio-accent/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-16 h-52 w-52 rounded-full bg-studio-primary/5 blur-3xl" />

          <div className="relative">
            <div className="flex items-center gap-2">
              <span className="h-px w-10 bg-studio-accent" />
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-studio-accent">
                Collections
              </p>
            </div>

            <h1 className="mt-4 font-serif text-5xl font-semibold leading-tight tracking-tight text-studio-primary md:text-6xl">
              {activeCategory
                ? activeCategory.name
                : searchQuery
                  ? `Search Results`
                  : "All Collections"}
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-relaxed text-studio-ink/70 md:text-lg">
              {activeCategory
                ? `Explore our curated ${activeCategory.name.toLowerCase()} collection with style recommendations`
                : searchQuery
                  ? `Results for "${searchQuery}"`
                  : "Explore our curated collections by style. Browse at your own pace with real-time filtering and view options."}
                  : "Discover handcrafted pieces across all our collections. Browse by category or search for exactly what you're looking for."}
            </p>

            {/* Stats */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-studio-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-white shadow-md">
                <span className="h-1.5 w-1.5 rounded-full bg-studio-accent" />
                {products.length} Item{products.length !== 1 ? "s" : ""}
              </div>

              {(selectedCategory || searchQuery) && (
                <button
                  onClick={handleClearFilters}
                  className="inline-flex items-center gap-1.5 rounded-full border border-studio-primary/20 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-studio-primary transition hover:border-studio-accent hover:text-studio-accent"
                >
                  ✕ Clear Filters
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ SEARCH & FILTER SECTION ═══════════════════ */}
      <section className="section-shell py-8">
        <div className="space-y-6">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="relative animate-reveal-up">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-studio-primary/40" />
            <input
              type="text"
              placeholder="Search by product name, style, fabric..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-studio-primary/10 bg-white px-4 py-3 pl-12 text-sm placeholder:text-studio-ink/40 focus:border-studio-accent focus:outline-none focus:ring-2 focus:ring-studio-accent/10"
            />
          </form>

          {/* Categories Grid */}
          <div className="animate-reveal-up">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-[0.1em] text-studio-ink/70">
                Filter by Category ({categories.length})
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`rounded p-2 transition ${
                    viewMode === "grid"
                      ? "bg-studio-primary text-white"
                      : "bg-studio-light text-studio-primary hover:bg-studio-light/80"
                  }`}
                >
                  <Grid3x3 size={18} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`rounded p-2 transition ${
                    viewMode === "list"
                      ? "bg-studio-primary text-white"
                      : "bg-studio-light text-studio-primary hover:bg-studio-light/80"
                  }`}
                >
                  <List size={18} />
                </button>
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleCategorySelect("")}
                className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition ${
                  !selectedCategory
                    ? "border-studio-primary bg-studio-primary text-white shadow-md"
                    : "border-studio-primary/15 bg-white text-studio-primary hover:border-studio-accent hover:text-studio-accent"
                }`}
              >
                All Items
              </button>
              {filteredCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategorySelect(category.slug)}
                  className={`group relative overflow-hidden rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition ${
                    selectedCategory === category.slug
                      ? "border-studio-primary bg-studio-primary text-white shadow-md"
                      : "border-studio-primary/15 bg-white text-studio-primary hover:-translate-y-0.5 hover:border-studio-accent hover:text-studio-accent hover:shadow-sm"
                  }`}
                >
                  <span>{category.name}</span>
                  <span className="ml-2 inline-block rounded-full bg-white/20 px-2 text-[10px] font-bold">
                    {category.productCount}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ PRODUCTS SECTION ═══════════════════ */}
      <section className="section-shell pb-16">
        {loading ? (
          <div className="flex min-h-96 items-center justify-center">
            <div className="text-center">
              <Loader className="mx-auto mb-4 h-8 w-8 animate-spin text-studio-primary" />
              <p className="text-sm text-studio-ink/70">Loading collections...</p>
            </div>
          </div>
        ) : products.length > 0 ? (
          <>
            {/* View Mode Toggle Info */}
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm text-studio-ink/60">
                Showing <span className="font-semibold text-studio-primary">{products.length}</span> items
              </p>
            </div>

            {/* Products Grid */}
            <div
              className={
                viewMode === "grid"
                  ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  : "space-y-4"
              }
            >
              {products.map((product, index) => (
                <div
                  key={product.id}
                  className="animate-reveal-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <ProductCard {...product} />
                </div>
              ))}
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="rounded-3xl border border-dashed border-studio-primary/25 bg-gradient-to-br from-white to-studio-light/30 p-12 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-studio-light">
              <svg
                className="h-8 w-8 text-studio-primary/50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
            <h3 className="mt-4 font-serif text-2xl font-semibold text-studio-primary">
              No items found
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-studio-ink/65">
              {selectedCategory
                ? `We couldn't find any items in this category. Try a different one!`
                : `We couldn't find anything matching "${searchQuery}". Try a different search or explore by category.`}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                onClick={handleClearFilters}
                className="rounded-full bg-studio-primary px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-white transition hover:bg-studio-primary/90"
              >
                Clear Filters
              </button>
              <Link
                href="/collections"
                className="rounded-full border border-studio-primary/20 bg-white px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-studio-primary transition hover:border-studio-accent hover:text-studio-accent"
              >
                View All Collections
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* ═══════════════════ FEATURED CATEGORIES SECTION ═══════════════════ */}
      {!selectedCategory && !searchQuery && categories.length > 0 && (
        <section className="section-shell py-16">
          <div className="mb-8">
            <div className="flex items-center gap-2">
              <span className="h-px w-8 bg-studio-accent" />
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-studio-accent">
                Browse By Category
              </p>
            </div>
            <h2 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-studio-primary md:text-4xl">
              Featured Collections
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categories.slice(0, 6).map((category) => (
              <Link
                key={category.id}
                href={`/collections?category=${category.slug}`}
                className="group relative overflow-hidden rounded-2xl border border-studio-primary/10 bg-gradient-to-br from-studio-light/50 to-white p-6 shadow-[0_16px_28px_-24px_rgba(63,52,143,0.55)] transition hover:-translate-y-1 hover:border-studio-accent/40 hover:shadow-[0_20px_40px_-30px_rgba(63,52,143,0.75)]"
              >
                <div className="relative">
                  <h3 className="font-serif text-2xl font-semibold text-studio-primary">
                    {category.name}
                  </h3>
                  <p className="mt-2 text-sm text-studio-ink/60">
                    {category.productCount} item{category.productCount !== 1 ? "s" : ""}
                  </p>
                  <p className="mt-3 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.12em] text-studio-accent transition group-hover:translate-x-1">
                    Explore <ChevronRight size={14} />
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
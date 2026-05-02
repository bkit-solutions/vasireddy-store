"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ProductCard } from "@/components/store/ProductCard";
import { Search, Grid3x3, List } from "lucide-react";

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

export default function CollectionsClient() {
  const searchParams = useSearchParams();
  const categoryFromUrl = searchParams.get("category");
  const searchFromUrl = searchParams.get("q");

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchFromUrl || "");
  const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl || "");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

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
    }
  };

  const handleClearFilters = () => {
    setSelectedCategory("");
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-white">
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

      <section className="section-shell py-8 sm:py-12">
        <div className="animate-reveal-up relative overflow-hidden rounded-[2rem] border border-studio-primary/10 bg-gradient-to-br from-white via-studio-light/40 to-white p-8 shadow-[0_30px_60px_-40px_rgba(32,29,26,-0.4)] backdrop-blur md:p-12">
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
                : "Discover handcrafted pieces across all our collections. Browse by category or search for exactly what you&apos;re looking for."}
            </p>

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

      <section className="section-shell py-8">
        <div className="space-y-6">
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

          <div className="animate-reveal-up">
            {loading ? (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-80 rounded-3xl border border-studio-primary/10 bg-studio-light/70 p-6"
                  />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="rounded-3xl border border-studio-primary/10 bg-studio-light/60 p-12 text-center text-studio-primary">
                No items found. Try adjusting your search or category filters.
              </div>
            ) : (
              <div className={`grid gap-6 ${viewMode === "grid" ? "md:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"}`}>
                {products.map((product) => (
                  <ProductCard key={product.id} {...product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

type SearchBoxProps = {
  compact?: boolean;
};

export function SearchBox({ compact = true }: SearchBoxProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const q = query.trim();

    if (!q) {
      router.push("/products");
      return;
    }

    router.push(`/products?q=${encodeURIComponent(q)}`);
  }

  if (compact) {
    return (
      <form onSubmit={handleSubmit} className="hidden items-center md:flex">
        <label htmlFor="header-search" className="sr-only">
          Search products
        </label>
        <input
          id="header-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search looks"
          className="w-36 rounded-full border border-studio-primary/15 bg-white/90 px-3 py-1.5 text-xs text-studio-ink outline-none transition focus:w-52 focus:border-studio-accent"
        />
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center rounded-full border border-studio-primary/15 bg-white px-3 py-1.5 shadow-sm">
      <Search size={16} className="text-studio-primary" />
      <label htmlFor="mobile-search" className="sr-only">
        Search products
      </label>
      <input
        id="mobile-search"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search products"
        className="ml-2 w-full bg-transparent text-sm text-studio-ink outline-none"
      />
    </form>
  );
}

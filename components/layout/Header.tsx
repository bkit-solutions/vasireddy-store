import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { getServerSession } from "next-auth";
import { Heart, ShoppingBag, User } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { MobileNav } from "@/components/layout/MobileNav";
import { SearchBox } from "@/components/layout/SearchBox";
import { BrandLogo } from "@/components/ui/BrandLogo";

const navLinks: ReadonlyArray<{ href: Route; label: string }> = [
  { href: "/collections", label: "Collections" },
  { href: "/products", label: "Products" },
  { href: "/wishlist", label: "Wishlist" },
];

export async function Header() {
  const session = await getServerSession(authOptions);
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <header className="sticky top-0 z-30 border-b border-studio-primary/10 bg-studio-cream/75 backdrop-blur-xl">
      <div className="section-shell relative py-2.5 md:py-3">
        <div className="relative flex h-14 items-center justify-between gap-2 rounded-2xl border border-studio-primary/10 bg-white/80 px-3 shadow-[0_18px_36px_-24px_rgba(26,22,48,0.55)] backdrop-blur md:h-[4.15rem] md:gap-4 md:px-4">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-studio-primary/30" />
          <Link href="/" className="flex min-w-0 items-center gap-2.5 text-lg font-semibold tracking-wide text-studio-primary md:gap-3 md:text-xl">
            <BrandLogo size="header" />
            <div className="hidden min-w-0 lg:block">
              <span className="block truncate leading-tight">Vasireddy Designer Studio</span>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-studio-muted">Our Desire Our Design</span>
            </div>
          </Link>
          <nav className="hidden items-center gap-2 rounded-full border border-studio-primary/10 bg-studio-cream/70 p-1 text-sm font-semibold text-studio-ink md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full px-3 py-1.5 transition hover:bg-white hover:text-studio-accent"
              >
                {link.label}
              </Link>
            ))}
            {isAdmin ? (
              <Link
                href="/admin/dashboard"
                className="rounded-full bg-studio-primary px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-studio-accent"
              >
                Admin Dashboard
              </Link>
            ) : null}
          </nav>
          <div className="flex shrink-0 items-center gap-1 text-studio-primary md:gap-2">
            <SearchBox />
            <Link
              href="/wishlist"
              aria-label="Wishlist"
              className="rounded-full border border-transparent p-2 transition hover:border-studio-primary/10 hover:bg-white"
            >
              <Heart size={18} />
            </Link>
            <Link
              href="/cart"
              aria-label="Cart"
              className="rounded-full border border-transparent p-2 transition hover:border-studio-primary/10 hover:bg-white"
            >
              <ShoppingBag size={18} />
            </Link>
            <Link
              href="/account"
              aria-label="Account"
              className="rounded-full border border-transparent p-2 transition hover:border-studio-primary/10 hover:bg-white"
            >
              <User size={18} />
            </Link>
            {!session ? (
              <>
                <Link
                  href="/register"
                  className="hidden rounded-full border border-studio-primary/20 bg-white px-4 py-2 text-xs font-semibold text-studio-primary transition hover:-translate-y-0.5 hover:border-studio-accent hover:text-studio-accent xl:inline-flex"
                >
                  Register
                </Link>
                <Link
                  href="/login"
                  className="hidden rounded-full bg-studio-primary px-4 py-2 text-xs font-semibold text-white transition hover:-translate-y-0.5 hover:bg-studio-accent xl:inline-flex"
                >
                  Login
                </Link>
              </>
            ) : null}
            <MobileNav isAdmin={isAdmin} isAuthenticated={Boolean(session)} />
          </div>
        </div>
      </div>
    </header>
  );
}

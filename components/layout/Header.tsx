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
    <header
      className="sticky top-0 z-30 border-b border-white/20 backdrop-blur-xl"
      style={{
        background:
          "linear-gradient(135deg, #f8f5ff 0%, #f3ecff 25%, #fdf8f3 60%, #f6f0ff 100%)",
      }}
    >
      <div className="section-shell relative py-3">
        <div
          className="relative flex h-14 items-center justify-between gap-3 rounded-2xl
          border border-white/30 px-4
          shadow-[0_25px_60px_-20px_rgba(59,31,107,0.45)]
          backdrop-blur-xl md:h-[4.2rem]"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.75), rgba(255,255,255,0.45))",
          }}
        >
          {/* Gradient glow overlay */}
          <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-r from-studio-primary/5 via-transparent to-studio-accent/5" />

          {/* Top shimmer line */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-studio-gold/70 to-transparent" />

          {/* Logo */}
          <Link href="/" className="flex min-w-0 items-center gap-3 z-10">
            <BrandLogo size="header" />
            <div className="hidden min-w-0 lg:block">
              <span className="block truncate font-serif text-lg tracking-wide text-studio-ink">
                Vasireddy Designer Studio
              </span>
             <span className="block text-[10px]  tracking-[0.25em] text-studio-gold italic font-light opacity-90">
  Your Desire Our Design
</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav
            className="hidden md:flex items-center gap-1 rounded-full p-1
            border border-white/30 shadow-inner backdrop-blur-md z-10"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.6), rgba(255,255,255,0.3))",
            }}
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full px-4 py-1.5 text-sm font-medium
                text-studio-ink/80 transition-all duration-300
                hover:bg-white hover:shadow-md hover:text-studio-primary"
              >
                {link.label}
              </Link>
            ))}

            {isAdmin && (
              <Link
                href="/admin/dashboard"
                className="rounded-full bg-gradient-to-r from-studio-primary to-studio-accent
                px-4 py-1.5 text-xs font-semibold text-white shadow-md
                transition hover:scale-[1.03]"
              >
                Admin Dashboard
              </Link>
            )}
          </nav>

          {/* Right Section */}
          <div className="flex shrink-0 items-center gap-2 z-10">
            <SearchBox />

            <Link
              href="/wishlist"
              className="rounded-full p-2 transition-all duration-300 hover:bg-white hover:shadow-md hover:scale-105"
            >
              <Heart size={18} />
            </Link>

            <Link
              href="/cart"
              className="rounded-full p-2 transition-all duration-300 hover:bg-white hover:shadow-md hover:scale-105"
            >
              <ShoppingBag size={18} />
            </Link>

            <Link
              href="/account"
              className="rounded-full p-2 transition-all duration-300 hover:bg-white hover:shadow-md hover:scale-105"
            >
              <User size={18} />
            </Link>

            {!session && (
              <>
                <Link
                  href="/register"
                  className="hidden xl:inline-flex rounded-full border border-studio-primary/20
                  bg-white px-4 py-2 text-xs font-semibold text-studio-primary
                  transition hover:-translate-y-0.5 hover:border-studio-accent hover:text-studio-accent"
                >
                  Register
                </Link>

                <Link
                  href="/login"
                  className="hidden xl:inline-flex rounded-full
                  bg-gradient-to-r from-studio-primary to-studio-accent
                  px-4 py-2 text-xs font-semibold text-white shadow-md
                  transition hover:-translate-y-0.5"
                >
                  Login
                </Link>
              </>
            )}

            <MobileNav isAdmin={isAdmin} isAuthenticated={Boolean(session)} />
          </div>
        </div>
      </div>
    </header>
  );
}
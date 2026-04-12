"use client";

import Link from "next/link";
import type { Route } from "next";
import { Menu, X } from "lucide-react";
import { useState } from "react";

type MobileNavProps = {
  isAdmin: boolean;
  isAuthenticated: boolean;
};

export function MobileNav({ isAdmin, isAuthenticated }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  const links: { href: Route; label: string }[] = [
    { href: "/collections", label: "Collections" },
    { href: "/products", label: "Products" },
    { href: "/wishlist", label: "Wishlist" },
    { href: "/cart", label: "Cart" },
    { href: "/account", label: "Account" },
  ];

  if (isAdmin) {
    links.push({ href: "/admin/dashboard", label: "Admin Dashboard" });
  }

  if (!isAuthenticated) {
    links.push({ href: "/register", label: "Register" });
    links.push({ href: "/login", label: "Login" });
  }

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="rounded-full border border-transparent p-2 text-studio-primary transition hover:border-studio-primary/10 hover:bg-white"
        aria-label="Toggle menu"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>
      {open ? (
        <div className="absolute left-4 right-4 top-16 z-40 overflow-hidden rounded-2xl border border-studio-primary/10 bg-white/95 p-3 shadow-[0_24px_40px_-24px_rgba(26,22,48,0.6)] backdrop-blur">
          <div className="mb-3 rounded-xl bg-studio-primary px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white">
            Explore the collection
          </div>
          <nav className="space-y-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2 text-sm font-semibold text-studio-ink transition hover:bg-studio-light"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      ) : null}
    </div>
  );
}

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
      {/* Toggle Button */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="rounded-full p-2 transition-all duration-300 hover:bg-white hover:shadow-md"
        aria-label="Toggle menu"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute left-4 right-4 top-16 z-40 rounded-2xl
          bg-[linear-gradient(135deg,rgba(255,255,255,0.95),rgba(255,255,255,0.75))]
          border border-white/50 backdrop-blur-xl
          p-4 shadow-[0_30px_60px_-20px_rgba(59,31,107,0.5)]"
        >
          {/* Header */}
          <div
            className="mb-3 rounded-lg bg-gradient-to-r from-studio-primary to-studio-accent
            px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white"
          >
            Explore the collection
          </div>

          {/* Links */}
          <nav className="space-y-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2 text-sm font-medium
                text-studio-ink transition-all duration-200
                hover:bg-studio-light hover:pl-4"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}
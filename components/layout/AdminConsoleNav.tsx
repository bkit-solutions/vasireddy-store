"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FolderTree, LayoutDashboard, Menu, Package, ShoppingBag, Tag, Users, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/coupons", label: "Coupons", icon: Tag },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="space-y-2">
      {navItems.map((item) => {
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition",
              isActive
                ? "bg-studio-primary text-white"
                : "text-studio-ink hover:bg-studio-light",
            )}
          >
            <item.icon size={16} className={isActive ? "text-white" : "text-studio-primary"} />
            {item.label}
          </Link>
        );
      })}

      <Link
        href="/"
        onClick={onNavigate}
        className="mt-3 flex items-center gap-3 rounded-xl border border-studio-primary/10 bg-white px-3 py-2 text-sm font-semibold text-studio-primary"
      >
        Back to Store
      </Link>
    </nav>
  );
}

export function AdminConsoleNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between rounded-2xl border border-studio-primary/10 bg-white/90 px-4 py-3 shadow-sm backdrop-blur lg:hidden">
        <div>
          <p className="text-base font-semibold text-studio-primary">Admin Console</p>
          <p className="text-xs text-studio-ink/65">Vasireddy Designer Studio</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open admin menu"
          className="rounded-full border border-studio-primary/15 p-2 text-studio-primary"
        >
          <Menu size={18} />
        </button>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/35"
            onClick={() => setOpen(false)}
            aria-label="Close admin menu"
          />
          <aside className="relative ml-auto h-full w-[290px] bg-[#f8f7ff] p-4 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold text-studio-primary">Admin Console</p>
                <p className="text-xs text-studio-ink/65">Vasireddy Designer Studio</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="rounded-full border border-studio-primary/15 p-2 text-studio-primary"
              >
                <X size={16} />
              </button>
            </div>
            <div className="mb-4 rounded-xl bg-studio-primary px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white">
              Command Center
            </div>
            <NavLinks onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      ) : null}

      <aside className="hidden rounded-3xl border border-studio-primary/10 bg-white/90 p-4 shadow-sm backdrop-blur lg:block">
        <p className="text-lg font-semibold text-studio-primary">Admin Console</p>
        <p className="mt-1 text-xs text-studio-ink/65">Vasireddy Designer Studio</p>
        <div className="mt-4 rounded-xl bg-studio-primary px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white">
          Command Center
        </div>
        <div className="mt-6">
          <NavLinks />
        </div>
      </aside>
    </>
  );
}

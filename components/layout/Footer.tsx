import Link from "next/link";
import { BrandLogo } from "@/components/ui/BrandLogo";

const quickLinks = [
  { href: "/collections", label: "Collections" },
  { href: "/products", label: "Products" },
  { href: "/wishlist", label: "Wishlist" },
  { href: "/account", label: "Account" },
];

export function Footer() {
  return (
    <footer className="relative mt-24 overflow-hidden border-t border-studio-primary/10 bg-[linear-gradient(180deg,#fbf8f2_0%,#ffffff_45%,#f7f2ea_100%)]">
      {/* Top hairline */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-studio-primary/25 to-transparent" />
      {/* Ambient glows */}
      <div className="pointer-events-none absolute -left-20 top-16 h-56 w-56 rounded-full bg-studio-light/50 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -right-12 h-60 w-60 rounded-full bg-studio-primary/10 blur-3xl" />

      <div className="section-shell py-16 md:py-20">
        <div className="relative overflow-hidden rounded-[2rem] border border-studio-primary/10 bg-white/85 p-8 shadow-[0_20px_60px_-35px_rgba(63,52,143,0.25)] backdrop-blur-sm md:p-12">
          
          <div className="grid gap-12 lg:grid-cols-[1.25fr_0.75fr_0.9fr] lg:gap-16">
            
            {/* ─── Brand Column ─── */}
            <div className="flex flex-col">
              <div className="inline-flex w-fit rounded-2xl border border-studio-primary/10 bg-white p-3 shadow-sm">
                <BrandLogo size="footer" />
              </div>

              <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.28em] text-studio-accent">
                Crafted For Celebrations
              </p>

              <h3 className="mt-2.5 max-w-md text-[26px] font-semibold leading-[1.2] text-studio-primary md:text-[30px]">
                Vasireddy Designer Studio
              </h3>

              <p className="mt-4 max-w-md text-sm leading-7 text-studio-ink/70">
                Timeless sarees and couture blouses shaped for weddings, festive evenings, and elegant statement dressing with a boutique touch.
              </p>

              {/* Refined chips */}
              <div className="mt-7 flex flex-wrap gap-2">
                <span className="rounded-full bg-studio-primary px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white">
                  Bridal Edit Weekly
                </span>
                <span className="rounded-full border border-studio-primary/15 bg-studio-light/40 px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-studio-primary">
                  7 Day Returns
                </span>
                <span className="rounded-full border border-studio-primary/15 bg-studio-light/40 px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-studio-primary">
                  Secure Checkout
                </span>
              </div>
            </div>

            {/* ─── Quick Links ─── */}
            <div className="flex flex-col">
              <h4 className="text-xs font-semibold uppercase tracking-[0.24em] text-studio-primary">
                Quick Links
              </h4>

              <ul className="mt-6 space-y-4">
                {quickLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="group inline-flex items-center text-sm text-studio-ink/75 transition-colors hover:text-studio-accent"
                    >
                      <span className="mr-3 h-px w-3 bg-studio-primary/30 transition-all duration-300 group-hover:w-5 group-hover:bg-studio-accent" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="mt-8 rounded-2xl border border-studio-primary/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.9),rgba(247,242,234,0.85))] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-studio-accent">
                  Style Support
                </p>
                <p className="mt-2 text-sm leading-6 text-studio-ink/70">
                  Available Monday to Saturday,<br />10 AM to 7 PM.
                </p>
              </div>
            </div>

            {/* ─── Support Column ─── */}
            <div className="flex flex-col">
              <h4 className="text-xs font-semibold uppercase tracking-[0.24em] text-studio-primary">
                Support
              </h4>

              <div className="mt-6 space-y-4">
                <div className="flex flex-col gap-1 border-b border-studio-primary/10 pb-3">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-studio-ink/50">
                    Email
                  </span>
                  <a
                    href="mailto:vasireddydesigners@gmail.com"
                    className="text-sm text-studio-ink/80 transition hover:text-studio-accent"
                  >
                    vasireddydesigners@gmail.com
                  </a>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-studio-ink/50">
                    Phone
                  </span>
                  <a
                    href="tel:+919951677333"
                    className="text-sm text-studio-ink/80 transition hover:text-studio-accent"
                  >
                    +91 99516 77333
                  </a>
                </div>
              </div>

              <div className="mt-7 flex flex-col gap-2.5">
                <Link
                  href="/collections"
                  className="group inline-flex items-center justify-center rounded-full bg-studio-primary px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-white transition-all hover:bg-studio-accent"
                >
                  Shop Collections
                  <span className="ml-2 transition-transform group-hover:translate-x-0.5">→</span>
                </Link>
                <Link
                  href="/account"
                  className="inline-flex items-center justify-center rounded-full border border-studio-primary/20 bg-white px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-studio-primary transition-all hover:border-studio-accent hover:text-studio-accent"
                >
                  My Account
                </Link>
              </div>
            </div>
          </div>

          {/* ─── Bottom Bar ─── */}
          <div className="mt-12 flex flex-col items-center gap-3 border-t border-studio-primary/10 pt-6 text-xs text-studio-ink/55 md:flex-row md:justify-between">
            <p className="tracking-wide">
              © {new Date().getFullYear()} Vasireddy Designer Studio. All rights reserved.
            </p>
            <p className="flex items-center gap-2 tracking-[0.16em]">
              <span>Powered by</span>
              <span className="h-1 w-1 rounded-full bg-studio-primary/30" />
              <a
                href="https://itseasynow.in"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-studio-primary transition hover:text-studio-accent"
              >
                itseasynow.in
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
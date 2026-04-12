import Link from "next/link";
import { BrandLogo } from "@/components/ui/BrandLogo";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-studio-primary/10 bg-white">
      <div className="section-shell py-14">
        <div className="relative overflow-hidden rounded-3xl border border-studio-primary/10 bg-white/85 p-6 shadow-[0_26px_48px_-36px_rgba(63,52,143,0.65)] backdrop-blur md:p-8">
          <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-studio-light/70 blur-2xl" />

          <div className="grid gap-8 md:grid-cols-[1.2fr_0.85fr_0.95fr]">
            <div>
              <BrandLogo size="footer" />
              <h3 className="mt-3 text-2xl font-semibold text-studio-primary">Vasireddy Designer Studio</h3>
              <p className="mt-3 max-w-md text-sm leading-6 text-studio-ink/80">
                Timeless sarees and couture blouses crafted for weddings, celebrations, and statement festive moments.
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-full bg-studio-primary px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-white">
                  Bridal Edit Weekly
                </span>
                <span className="rounded-full border border-studio-primary/20 bg-white px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-studio-primary">
                  7 Day Returns
                </span>
                <span className="rounded-full border border-studio-primary/20 bg-white px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-studio-primary">
                  Secure Checkout
                </span>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold uppercase tracking-[0.12em] text-studio-primary">Quick Links</h4>
              <ul className="mt-3 space-y-2.5 text-sm text-studio-ink/80">
                <li>
                  <Link href="/collections" className="transition hover:text-studio-accent">Collections</Link>
                </li>
                <li>
                  <Link href="/products" className="transition hover:text-studio-accent">Products</Link>
                </li>
                <li>
                  <Link href="/wishlist" className="transition hover:text-studio-accent">Wishlist</Link>
                </li>
                <li>
                  <Link href="/account" className="transition hover:text-studio-accent">Account</Link>
                </li>
              </ul>

              <div className="mt-5 rounded-xl border border-studio-primary/10 bg-studio-light/40 p-3 text-xs text-studio-ink/70">
                Style support available Monday to Saturday, 10 AM to 7 PM.
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold uppercase tracking-[0.12em] text-studio-primary">Support</h4>
              <p className="mt-3 text-sm text-studio-ink/80">Email: vasireddydesigners@gmail.com</p>
              <p className="mt-1 text-sm text-studio-ink/80">Phone: +91 99516 77333</p>

              <div className="mt-5 grid gap-2 sm:grid-cols-2 md:grid-cols-1">
                <Link
                  href="/collections"
                  className="rounded-full bg-studio-primary px-4 py-2 text-center text-xs font-semibold uppercase tracking-[0.1em] text-white transition hover:bg-studio-accent"
                >
                  Shop Collections
                </Link>
                <Link
                  href="/account"
                  className="rounded-full border border-studio-primary/20 bg-white px-4 py-2 text-center text-xs font-semibold uppercase tracking-[0.1em] text-studio-primary transition hover:border-studio-accent hover:text-studio-accent"
                >
                  My Account
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-2 border-t border-studio-primary/10 pt-4 text-xs text-studio-ink/60 sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} Vasireddy Designer Studio. All rights reserved.</p>
           <p className="lowercase tracking-[0.1em]">
  Powered by <a href="https://itseasynow.in" target="_blank" rel="noopener noreferrer">itseasynow.in</a>
</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";
import { getSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

type LoginFormProps = {
  title: string;
  subtitle: string;
  adminOnly?: boolean;
  callbackUrl?: string;
};

export function LoginForm({ title, subtitle, adminOnly = false, callbackUrl = "/" }: LoginFormProps) {
  const router = useRouter();

  const [email, setEmail] = useState(adminOnly ? "admin@vasireddydesigner.com" : "");
  const [password, setPassword] = useState(adminOnly ? "Admin@123" : "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    });

    if (result?.error) {
      setLoading(false);
      setError("Invalid credentials. Please check email and password.");
      return;
    }

    const session = await getSession();
    if (adminOnly && session?.user?.role !== "ADMIN") {
      await signOut({ redirect: false });
      setLoading(false);
      setError("This login is only for admin users.");
      return;
    }

    if (session?.user?.role === "ADMIN" && !adminOnly) {
      router.push("/admin/dashboard");
      return;
    }

    router.push(adminOnly ? "/admin/dashboard" : callbackUrl);
    router.refresh();
  }

  return (
    <section className="section-shell py-10 md:py-14">
      <div className="mx-auto max-w-md rounded-3xl border border-studio-primary/10 bg-white/90 p-6 shadow-[0_24px_44px_-28px_rgba(63,52,143,0.65)] backdrop-blur md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-studio-accent">Secure Access</p>
        <h1 className="text-3xl font-semibold text-studio-primary">{title}</h1>
        <p className="mt-2 text-sm text-studio-ink/75">{subtitle}</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.12em] text-studio-ink/70" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1 w-full rounded-xl border border-studio-primary/15 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-studio-accent"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.12em] text-studio-ink/70" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1 w-full rounded-xl border border-studio-primary/15 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-studio-accent"
            />
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-studio-primary px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-studio-accent disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="mt-5 text-xs text-studio-ink/70">
          {adminOnly ? (
            <Link href="/login" className="font-semibold text-studio-primary hover:text-studio-accent">
              Back to customer login
            </Link>
          ) : (
            <>
              New customer?{" "}
              <Link href="/register" className="font-semibold text-studio-primary hover:text-studio-accent">
                Register
              </Link>
            </>
          )}
        </p>
      </div>
    </section>
  );
}

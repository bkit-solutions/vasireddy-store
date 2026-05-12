"use client";

import Link from "next/link";
import { useState } from "react";
import { getSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Mail, Lock, ArrowRight, AlertCircle } from "lucide-react";

type LoginFormProps = {
  title: string;
  subtitle: string;
  adminOnly?: boolean;
  callbackUrl?: string;
};

export function LoginForm({ title, subtitle, adminOnly = false, callbackUrl = "/" }: LoginFormProps) {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    <section className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12">
      <div className="animate-reveal-up w-full max-w-md">
        <div className="relative overflow-hidden rounded-[2.5rem] border border-studio-primary/10 bg-white/80 p-8 shadow-[0_32px_64px_-16px_rgba(63,52,143,0.2)] backdrop-blur-xl md:p-10">
          {/* Decorative element */}
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-studio-primary/5 blur-2xl" />
          <div className="absolute -bottom-4 -left-4 h-24 w-24 rounded-full bg-studio-accent/5 blur-2xl" />

          <div className="relative">
            <div className="mb-8 text-center">
              <span className="studio-pill mb-3 inline-block">Secure Access</span>
              <h1 className="text-4xl font-semibold tracking-tight text-studio-primary">{title}</h1>
              <p className="mt-3 text-balance text-sm leading-relaxed text-studio-ink/60">{subtitle}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.15em] text-studio-ink/50" htmlFor="email">
                  <Mail className="h-3 w-3" />
                  Email Address
                </label>
                <div className="group relative">
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="Enter your email"
                    className="w-full rounded-2xl border border-studio-primary/10 bg-white/50 px-4 py-3.5 text-sm outline-none transition-all duration-300 focus:border-studio-accent focus:bg-white focus:ring-4 focus:ring-studio-accent/5"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.15em] text-studio-ink/50" htmlFor="password">
                    <Lock className="h-3 w-3" />
                    Password
                  </label>
                  {!adminOnly && (
                    <Link
                      href="/forgot-password"
                      className="text-[10px] font-bold uppercase tracking-wider text-studio-accent transition-colors hover:text-studio-primary"
                    >
                      Forgot Password?
                    </Link>
                  )}
                </div>
                <div className="group relative">
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-2xl border border-studio-primary/10 bg-white/50 px-4 py-3.5 text-sm outline-none transition-all duration-300 focus:border-studio-accent focus:bg-white focus:ring-4 focus:ring-studio-accent/5"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 p-3 text-xs font-medium text-red-600">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-studio-primary px-6 py-4 text-sm font-bold text-white transition-all duration-300 hover:-translate-y-1 hover:bg-studio-accent hover:shadow-lg active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <span className="relative z-10">{loading ? "Authenticating..." : "Sign In to Account"}</span>
                {!loading && <ArrowRight className="relative z-10 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />}
              </button>
            </form>

            <div className="mt-10 border-t border-studio-primary/5 pt-6 text-center">
              <p className="text-xs font-medium text-studio-ink/50">
                {adminOnly ? (
                  <Link href="/login" className="text-studio-primary transition-colors hover:text-studio-accent">
                    ← Back to customer portal
                  </Link>
                ) : (
                  <>
                    Don&apos;t have an account?{" "}
                    <Link href="/register" className="font-bold text-studio-primary transition-colors hover:text-studio-accent">
                      Create one now
                    </Link>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

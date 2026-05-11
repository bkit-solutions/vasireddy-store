"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { requestPasswordReset } from "./actions";
import { Mail, ArrowRight, ChevronLeft, AlertCircle, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await requestPasswordReset(email);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setSent(true);
      setTimeout(() => {
        router.push(`/forgot-password/verify?email=${encodeURIComponent(email)}`);
      }, 1500);
    }
  }

  return (
    <section className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12">
      <div className="animate-reveal-up w-full max-w-md">
        <div className="relative overflow-hidden rounded-[2.5rem] border border-studio-primary/10 bg-white/80 p-8 shadow-[0_32px_64px_-16px_rgba(63,52,143,0.2)] backdrop-blur-xl md:p-10">
          {/* Decorative element */}
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-studio-primary/5 blur-2xl" />
          
          <div className="relative">
            <div className="mb-8 text-center">
              <span className="studio-pill mb-3 inline-block">Recovery</span>
              <h1 className="text-4xl font-semibold tracking-tight text-studio-primary">Forgot Password?</h1>
              <p className="mt-3 text-balance text-sm leading-relaxed text-studio-ink/60">
                Enter your email address and we&apos;ll send you a 6-digit code to reset your password.
              </p>
            </div>

            {sent ? (
              <div className="space-y-6 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-green-600">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-studio-primary">Code Sent!</h3>
                  <p className="text-sm text-studio-ink/60">Redirecting you to the verification page...</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
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
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
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
                  <span className="relative z-10">{loading ? "Sending..." : "Send Reset Code"}</span>
                  {!loading && <ArrowRight className="relative z-10 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />}
                </button>
              </form>
            )}

            <div className="mt-10 border-t border-studio-primary/5 pt-6 text-center">
              <Link href="/login" className="inline-flex items-center gap-2 text-xs font-bold text-studio-primary transition-colors hover:text-studio-accent">
                <ChevronLeft className="h-3 w-3" />
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

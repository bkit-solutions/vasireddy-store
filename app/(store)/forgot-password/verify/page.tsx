"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { resetPassword } from "../actions";
import { toast } from "sonner";
import { Lock, ArrowRight, ChevronLeft, AlertCircle, ShieldCheck } from "lucide-react";

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("email", email);
    formData.append("otp", otp);
    formData.append("password", password);

    const result = await resetPassword(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      toast.success("Password reset successfully!");
      router.push("/login?message=Password reset successful. Please login.");
    }
  }

  return (
    <div className="animate-reveal-up w-full max-w-md">
      <div className="relative overflow-hidden rounded-[2.5rem] border border-studio-primary/10 bg-white/80 p-8 shadow-[0_32px_64px_-16px_rgba(63,52,143,0.2)] backdrop-blur-xl md:p-10">
        <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-studio-primary/5 blur-2xl" />
        
        <div className="relative">
          <div className="mb-8 text-center">
            <span className="studio-pill mb-3 inline-block">Security Verification</span>
            <h1 className="text-4xl font-semibold tracking-tight text-studio-primary">Verify Code</h1>
            <p className="mt-3 text-balance text-sm leading-relaxed text-studio-ink/60">
              We&apos;ve sent a 6-digit code to <strong className="text-studio-primary">{email}</strong>. Enter it below along with your new password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.15em] text-studio-ink/50" htmlFor="otp">
                <ShieldCheck className="h-3 w-3" />
                6-Digit Verification Code
              </label>
              <input
                id="otp"
                type="text"
                required
                maxLength={6}
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                className="w-full text-center text-3xl tracking-[0.5em] font-bold rounded-2xl border border-studio-primary/10 bg-white/50 px-4 py-4 outline-none transition-all duration-300 focus:border-studio-accent focus:bg-white focus:ring-4 focus:ring-studio-accent/5"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.15em] text-studio-ink/50" htmlFor="password">
                <Lock className="h-3 w-3" />
                New Password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-studio-primary/10 bg-white/50 px-4 py-3.5 text-sm outline-none transition-all duration-300 focus:border-studio-accent focus:bg-white focus:ring-4 focus:ring-studio-accent/5"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.15em] text-studio-ink/50" htmlFor="confirmPassword">
                <Lock className="h-3 w-3" />
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-2xl border border-studio-primary/10 bg-white/50 px-4 py-3.5 text-sm outline-none transition-all duration-300 focus:border-studio-accent focus:bg-white focus:ring-4 focus:ring-studio-accent/5"
              />
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
              <span className="relative z-10">{loading ? "Resetting..." : "Reset Password"}</span>
              {!loading && <ArrowRight className="relative z-10 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />}
            </button>
          </form>

          <div className="mt-10 border-t border-studio-primary/5 pt-6 text-center">
            <Link href={`/forgot-password?email=${encodeURIComponent(email)}`} className="inline-flex items-center gap-2 text-xs font-bold text-studio-primary transition-colors hover:text-studio-accent">
              <ChevronLeft className="h-3 w-3" />
              Resend Code
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyResetPage() {
  return (
    <section className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12">
      <Suspense fallback={<div className="text-center text-sm font-medium text-studio-ink/50">Initializing secure session...</div>}>
        <VerifyContent />
      </Suspense>
    </section>
  );
}

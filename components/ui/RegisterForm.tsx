"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

type RegisterFormProps = {
  callbackUrl?: string;
};

export function RegisterForm({ callbackUrl = "/" }: RegisterFormProps) {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const registerResponse = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const payload = (await registerResponse.json()) as { error?: string };

    if (!registerResponse.ok) {
      setLoading(false);
      setError(payload.error ?? "Unable to create account. Please try again.");
      return;
    }

    const loginResult = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (loginResult?.error) {
      setLoading(false);
      setError("Account created, but automatic login failed. Please sign in.");
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <section className="section-shell py-10 md:py-14">
      <div className="mx-auto max-w-md rounded-3xl border border-studio-primary/10 bg-white/90 p-6 shadow-[0_24px_44px_-28px_rgba(63,52,143,0.65)] backdrop-blur md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-studio-accent">Create Profile</p>
        <h1 className="text-3xl font-semibold text-studio-primary">Create Your Account</h1>
        <p className="mt-2 text-sm text-studio-ink/75">Register to access cart, wishlist, and order management.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.12em] text-studio-ink/70" htmlFor="name">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-1 w-full rounded-xl border border-studio-primary/15 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-studio-accent"
            />
          </div>

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
              minLength={8}
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
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="mt-5 text-xs text-studio-ink/70">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-studio-primary hover:text-studio-accent">
            Sign in
          </Link>
        </p>
      </div>
    </section>
  );
}

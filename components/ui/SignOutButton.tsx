"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="rounded-full border border-studio-primary/25 px-5 py-2.5 text-sm font-semibold text-studio-primary transition hover:border-studio-accent hover:text-studio-accent"
    >
      Sign Out
    </button>
  );
}

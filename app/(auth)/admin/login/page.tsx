import { LoginForm } from "@/components/ui/LoginForm";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ callbackUrl?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const callbackUrl = resolvedSearchParams?.callbackUrl ?? "/admin/dashboard";

  return (
    <div className="min-h-screen bg-transparent py-8">
      <LoginForm
        title="Admin Login"
        subtitle="Sign in with an admin account to access dashboard, products, orders, and customers."
        adminOnly
        callbackUrl={callbackUrl}
      />
    </div>
  );
}

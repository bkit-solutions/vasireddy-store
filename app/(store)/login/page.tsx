import { LoginForm } from "@/components/ui/LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ callbackUrl?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const callbackUrl = resolvedSearchParams?.callbackUrl ?? "/";

  return (
    <LoginForm
      title="Welcome Back"
      subtitle="Sign in to track orders, manage your account, and continue checkout."
      callbackUrl={callbackUrl}
    />
  );
}

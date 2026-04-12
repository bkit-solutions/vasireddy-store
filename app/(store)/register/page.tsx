import { RegisterForm } from "@/components/ui/RegisterForm";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams?: Promise<{ callbackUrl?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const callbackUrl = resolvedSearchParams?.callbackUrl ?? "/";

  return <RegisterForm callbackUrl={callbackUrl} />;
}

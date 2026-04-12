import Link from "next/link";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 10;

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const q = resolvedSearchParams.q?.trim() ?? "";
  const page = Math.max(1, Number(resolvedSearchParams.page ?? "1") || 1);
  const where = {
    role: "CUSTOMER" as const,
    ...(q
      ? {
          OR: [
            { name: { contains: q } },
            { email: { contains: q } },
          ],
        }
      : {}),
  };

  const customers = await prisma.user.findMany({
    where,
    include: {
      _count: {
        select: {
          orders: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });
  const totalCount = await prisma.user.count({ where });
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  function buildPageHref(targetPage: number) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (targetPage > 1) params.set("page", String(targetPage));
    const query = params.toString();
    return query ? `/admin/customers?${query}` : "/admin/customers";
  }

  return (
    <section className="py-2 sm:py-4">
      <h1 className="text-3xl font-semibold text-studio-primary sm:text-4xl">Customers</h1>
      <p className="mt-3 text-studio-ink/75">View customer profiles, order history, and support activity.</p>

      <form action="/admin/customers" className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search by customer name or email"
          className="w-full rounded-xl border border-studio-primary/15 px-3 py-2 text-sm sm:max-w-md"
        />
        <button type="submit" className="rounded-full bg-studio-primary px-5 py-2 text-sm font-semibold text-white transition hover:bg-studio-accent">
          Search
        </button>
        {q ? (
          <Link href="/admin/customers" className="rounded-full border border-studio-primary/20 px-4 py-2 text-xs font-semibold text-studio-primary">
            Clear
          </Link>
        ) : null}
      </form>

      {!customers.length ? (
        <div className="mt-6 rounded-2xl border border-dashed border-studio-primary/20 bg-white p-6 text-sm text-studio-ink/70">
          No customer accounts found.
        </div>
      ) : null}

      <div className="mt-6 space-y-3">
        {customers.map((customer) => (
          <article key={customer.id} className="rounded-2xl border border-studio-primary/10 bg-white p-4 shadow-[0_16px_30px_-24px_rgba(63,52,143,0.55)]">
            <h3 className="text-lg font-semibold text-studio-primary">{customer.name}</h3>
            <p className="text-sm text-studio-ink/70">{customer.email}</p>
            <p className="mt-2 text-xs text-studio-ink/65">
              Orders: {customer._count.orders} · Joined {new Date(customer.createdAt).toLocaleDateString("en-IN")}
            </p>
          </article>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-studio-primary/10 bg-white px-4 py-3 shadow-[0_16px_30px_-26px_rgba(63,52,143,0.45)]">
        <p className="text-sm text-studio-ink/70">
          Showing {(page - 1) * PAGE_SIZE + (customers.length ? 1 : 0)}-{(page - 1) * PAGE_SIZE + customers.length} of {totalCount}
        </p>
        <div className="flex items-center gap-2">
          <Link
            href={buildPageHref(Math.max(1, page - 1))}
            className={`rounded-full px-4 py-2 text-xs font-semibold ${
              page <= 1 ? "pointer-events-none border border-studio-primary/10 text-studio-ink/35" : "border border-studio-primary/20 text-studio-primary"
            }`}
          >
            Prev
          </Link>
          <span className="text-xs font-semibold text-studio-ink/65">Page {page} / {totalPages}</span>
          <Link
            href={buildPageHref(Math.min(totalPages, page + 1))}
            className={`rounded-full px-4 py-2 text-xs font-semibold ${
              page >= totalPages ? "pointer-events-none border border-studio-primary/10 text-studio-ink/35" : "border border-studio-primary/20 text-studio-primary"
            }`}
          >
            Next
          </Link>
        </div>
      </div>
    </section>
  );
}

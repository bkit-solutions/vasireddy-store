import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";

const PAGE_SIZE = 10;

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; sort?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const q = resolvedSearchParams.q?.trim() ?? "";
  const sort = resolvedSearchParams.sort ?? "recent";
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

  const orderBy =
    sort === "orders"
      ? { orders: { _count: "desc" as const } }
      : sort === "name"
        ? { name: "asc" as const }
        : { createdAt: "desc" as const };

  const [customers, totalCount, totalCustomers, activeCustomers, newThisMonth] =
    await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          _count: { select: { orders: true } },
          orders: {
            select: { totalAmount: true, createdAt: true, status: true },
            orderBy: { createdAt: "desc" },
          },
        },
        orderBy,
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
      prisma.user.count({ where }),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.user.count({
        where: {
          role: "CUSTOMER",
          orders: { some: {} },
        },
      }),
      prisma.user.count({
        where: {
          role: "CUSTOMER",
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
    ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  function buildHref(overrides: { page?: number; sort?: string; q?: string }) {
    const params = new URLSearchParams();
    const nextQ = overrides.q !== undefined ? overrides.q : q;
    const nextSort = overrides.sort !== undefined ? overrides.sort : sort;
    const nextPage = overrides.page ?? 1;
    if (nextQ) params.set("q", nextQ);
    if (nextSort && nextSort !== "recent") params.set("sort", nextSort);
    if (nextPage > 1) params.set("page", String(nextPage));
    const query = params.toString();
    return query ? `/admin/customers?${query}` : "/admin/customers";
  }

  function getInitials(name: string | null, email: string) {
    const source = (name || email || "?").trim();
    const parts = source.split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return source.slice(0, 2).toUpperCase();
  }

  return (
    <section className="py-4">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-studio-primary sm:text-3xl">Customers</h1>
          <p className="mt-1 text-sm text-studio-ink/70">
            Customer profiles, order history, and lifetime spend.
          </p>
        </div>
        <div className="text-xs text-studio-ink/60">
          <span className="font-semibold text-studio-primary">{totalCustomers}</span> total
        </div>
      </div>

      {/* Stat Cards */}
      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="rounded-2xl border border-studio-primary/10 bg-white p-4 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-studio-ink/55">
            Total Customers
          </p>
          <p className="mt-2 text-2xl font-semibold text-studio-primary">{totalCustomers}</p>
        </div>
        <div className="rounded-2xl border border-studio-primary/10 bg-white p-4 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-studio-ink/55">
            Active (Ordered)
          </p>
          <p className="mt-2 text-2xl font-semibold text-emerald-600">{activeCustomers}</p>
          <p className="mt-1 text-[11px] text-studio-ink/50">
            {totalCustomers ? Math.round((activeCustomers / totalCustomers) * 100) : 0}% conversion
          </p>
        </div>
        <div className="rounded-2xl border border-studio-primary/10 bg-white p-4 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-studio-ink/55">
            New This Month
          </p>
          <p className="mt-2 text-2xl font-semibold text-sky-600">{newThisMonth}</p>
        </div>
        <div className="rounded-2xl border border-studio-primary/10 bg-white p-4 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-studio-ink/55">
            Inactive
          </p>
          <p className="mt-2 text-2xl font-semibold text-studio-ink/70">
            {totalCustomers - activeCustomers}
          </p>
          <p className="mt-1 text-[11px] text-studio-ink/50">No orders yet</p>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-5 rounded-2xl border border-studio-primary/10 bg-white p-4 shadow-sm">
        <form
          action="/admin/customers"
          className="flex flex-col gap-2 sm:flex-row sm:items-center"
        >
          {sort !== "recent" ? <input type="hidden" name="sort" value={sort} /> : null}
          <input
            name="q"
            defaultValue={q}
            placeholder="Search by name or email"
            className="w-full rounded-xl border border-studio-primary/15 px-3 py-2 text-sm focus:border-studio-primary focus:outline-none sm:max-w-md"
          />
          <button
            type="submit"
            className="rounded-full bg-studio-primary px-5 py-2 text-sm font-semibold text-white transition hover:bg-studio-accent"
          >
            Search
          </button>
          {q || sort !== "recent" ? (
            <Link
              href="/admin/customers"
              className="rounded-full border border-studio-primary/20 px-4 py-2 text-xs font-semibold text-studio-primary hover:bg-studio-light"
            >
              Clear
            </Link>
          ) : null}
        </form>

        {/* Sort pills */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-studio-ink/50">
            Sort:
          </span>
          {[
            { key: "recent", label: "Recently Joined" },
            { key: "orders", label: "Most Orders" },
            { key: "name", label: "Name (A–Z)" },
          ].map((s) => (
            <Link
              key={s.key}
              href={buildHref({ sort: s.key })}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                sort === s.key
                  ? "border-studio-primary bg-studio-primary text-white"
                  : "border-studio-primary/15 text-studio-ink/70 hover:bg-studio-light"
              }`}
            >
              {s.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Empty state */}
      {!customers.length ? (
        <div className="mt-6 rounded-2xl border border-dashed border-studio-primary/20 bg-white p-8 text-center text-sm text-studio-ink/60">
          {q ? "No customers match your search." : "No customer accounts yet."}
        </div>
      ) : null}

      {/* Customer List */}
      <div className="mt-5 space-y-3">
        {customers.map((customer) => {
          const orderCount = customer._count.orders;
          const lifetimeSpend = customer.orders
            .filter((o) => ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"].includes(o.status))
            .reduce((sum, o) => sum + o.totalAmount, 0);
          const lastOrder = customer.orders[0];
          const initials = getInitials(customer.name, customer.email);

          const tier =
            lifetimeSpend >= 5000000
              ? { label: "VIP", color: "bg-amber-50 text-amber-700 border-amber-200" }
              : orderCount >= 3
                ? { label: "Loyal", color: "bg-violet-50 text-violet-700 border-violet-200" }
                : orderCount >= 1
                  ? { label: "Active", color: "bg-emerald-50 text-emerald-700 border-emerald-200" }
                  : { label: "New", color: "bg-sky-50 text-sky-700 border-sky-200" };

          return (
            <article
              key={customer.id}
              className="rounded-2xl border border-studio-primary/10 bg-white p-4 shadow-sm transition hover:shadow-md sm:p-5"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                {/* Identity */}
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-studio-primary to-studio-accent text-sm font-semibold text-white">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate text-base font-semibold text-studio-primary">
                        {customer.name || "Unnamed Customer"}
                      </h3>
                      <span
                        className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${tier.color}`}
                      >
                        {tier.label}
                      </span>
                    </div>
                    <p className="truncate text-xs text-studio-ink/65">{customer.email}</p>
                    <p className="mt-0.5 text-[11px] text-studio-ink/50">
                      Joined{" "}
                      {new Date(customer.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 lg:gap-6">
                  <div className="text-center lg:text-right">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-studio-ink/50">
                      Orders
                    </p>
                    <p className="mt-0.5 text-lg font-semibold text-studio-primary">
                      {orderCount}
                    </p>
                  </div>
                  <div className="text-center lg:text-right">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-studio-ink/50">
                      Lifetime
                    </p>
                    <p className="mt-0.5 text-lg font-semibold text-studio-primary">
                      {formatCurrency(Math.round(lifetimeSpend / 100))}
                    </p>
                  </div>
                  <div className="text-center lg:text-right">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-studio-ink/50">
                      Last Order
                    </p>
                    <p className="mt-0.5 text-xs font-semibold text-studio-ink">
                      {lastOrder
                        ? new Date(lastOrder.createdAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                          })
                        : "—"}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 lg:shrink-0">
                  <Link
                    href={`/admin/orders?q=${encodeURIComponent(customer.email)}`}
                    className="rounded-full border border-studio-primary/20 px-3 py-1.5 text-xs font-semibold text-studio-primary transition hover:bg-studio-light"
                  >
                    View Orders
                  </Link>
                  <a
                    href={`mailto:${customer.email}`}
                    className="rounded-full bg-studio-primary px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-studio-accent"
                  >
                    Email
                  </a>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Pagination */}
      {totalCount > 0 ? (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-studio-primary/10 bg-white px-4 py-3 shadow-sm">
          <p className="text-xs text-studio-ink/70">
            Showing{" "}
            <span className="font-semibold text-studio-ink">
              {(page - 1) * PAGE_SIZE + (customers.length ? 1 : 0)}–
              {(page - 1) * PAGE_SIZE + customers.length}
            </span>{" "}
            of <span className="font-semibold text-studio-ink">{totalCount}</span>
          </p>
          <div className="flex items-center gap-2">
            <Link
              href={buildHref({ page: Math.max(1, page - 1) })}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                page <= 1
                  ? "pointer-events-none border border-studio-primary/10 text-studio-ink/35"
                  : "border border-studio-primary/20 text-studio-primary hover:bg-studio-light"
              }`}
            >
              ← Prev
            </Link>
            <span className="text-xs font-semibold text-studio-ink/65">
              Page {page} / {totalPages}
            </span>
            <Link
              href={buildHref({ page: Math.min(totalPages, page + 1) })}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                page >= totalPages
                  ? "pointer-events-none border border-studio-primary/10 text-studio-ink/35"
                  : "border border-studio-primary/20 text-studio-primary hover:bg-studio-light"
              }`}
            >
              Next →
            </Link>
          </div>
        </div>
      ) : null}
    </section>
  );
}
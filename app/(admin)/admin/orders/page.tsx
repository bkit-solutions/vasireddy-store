import Link from "next/link";
import { revalidatePath } from "next/cache";
import { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { sendOrderStatusUpdateEmail } from "@/lib/mailer";
import { formatCurrency } from "@/lib/utils";

const PAGE_SIZE = 8;

// ── Status Config (UI only) ──────────────────────────────────────────────────

const STATUS_STYLES: Record<string, { dot: string; badge: string; label: string }> = {
  PENDING: {
    label: "Pending",
    dot: "bg-amber-500",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
  },
  PAID: {
    label: "Paid",
    dot: "bg-sky-500",
    badge: "bg-sky-50 text-sky-700 border-sky-200",
  },
  PROCESSING: {
    label: "Processing",
    dot: "bg-indigo-500",
    badge: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
  SHIPPED: {
    label: "Shipped",
    dot: "bg-violet-500",
    badge: "bg-violet-50 text-violet-700 border-violet-200",
  },
  DELIVERED: {
    label: "Delivered",
    dot: "bg-emerald-500",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  CANCELLED: {
    label: "Cancelled",
    dot: "bg-rose-500",
    badge: "bg-rose-50 text-rose-700 border-rose-200",
  },
  RETURN_REQUESTED: {
    label: "Return Requested",
    dot: "bg-orange-500",
    badge: "bg-orange-50 text-orange-700 border-orange-200",
  },
  RETURNED: {
    label: "Returned",
    dot: "bg-slate-500",
    badge: "bg-slate-50 text-slate-700 border-slate-200",
  },
};

function getStatusStyle(status: string) {
  return (
    STATUS_STYLES[status] ?? {
      label: status,
      dot: "bg-slate-400",
      badge: "bg-slate-50 text-slate-700 border-slate-200",
    }
  );
}

// ── Server Action (UNCHANGED from your original) ─────────────────────────────

async function updateOrderStatus(formData: FormData) {
  "use server";

  const orderId = String(formData.get("orderId") ?? "");
  const status = String(formData.get("status") ?? "") as OrderStatus;

  if (!orderId || !Object.values(OrderStatus).includes(status)) {
    return;
  }

  const existingOrder = await prisma.order.findUnique({
    where: { id: orderId },
    select: { deliveredAt: true, returnRequestedAt: true },
  });

  if (!existingOrder) {
    return;
  }

  const nextDeliveredAt =
    status === OrderStatus.DELIVERED
      ? existingOrder.deliveredAt ?? new Date()
      : existingOrder.deliveredAt;

  const nextReturnRequestedAt =
    status === OrderStatus.RETURN_REQUESTED
      ? existingOrder.returnRequestedAt ?? new Date()
      : existingOrder.returnRequestedAt;

  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: {
      status,
      deliveredAt: nextDeliveredAt,
      returnRequestedAt: nextReturnRequestedAt,
    },
    include: {
      user: {
        select: {
          email: true,
        },
      },
      items: {
        select: {
          quantity: true,
          unitPrice: true,
          product: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  if (updatedOrder.user.email) {
    try {
      await sendOrderStatusUpdateEmail(updatedOrder.user.email, updatedOrder.id, updatedOrder.status, {
        items: updatedOrder.items.map((item) => ({
          name: item.product.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
        totalAmount: updatedOrder.totalAmount,
        createdAt: updatedOrder.createdAt,
      });
    } catch (error) {
      console.error("Failed to send order status email", error);
    }
  }

  revalidatePath("/admin/orders");
}

// ── Page (logic UNCHANGED, UI enhanced) ──────────────────────────────────────

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const q = resolvedSearchParams.q?.trim() ?? "";
  const page = Math.max(1, Number(resolvedSearchParams.page ?? "1") || 1);
  const where = q
    ? {
        OR: [
          { id: { contains: q } },
          { user: { name: { contains: q } } },
          { user: { email: { contains: q } } },
          { items: { some: { product: { name: { contains: q } } } } },
        ],
      }
    : {};

  const orders = await prisma.order.findMany({
    where,
    include: {
      user: true,
      items: {
        include: {
          product: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });
  const totalCount = await prisma.order.count({ where });
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  function buildPageHref(targetPage: number) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (targetPage > 1) params.set("page", String(targetPage));
    const query = params.toString();
    return query ? `/admin/orders?${query}` : "/admin/orders";
  }

  return (
    <section className="py-4">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-studio-primary sm:text-3xl">Orders</h1>
          <p className="mt-1 text-sm text-studio-ink/70">
            Monitor order lifecycle from payment to fulfillment.
          </p>
        </div>
        <div className="text-xs text-studio-ink/60">
          Total: <span className="font-semibold text-studio-primary">{totalCount}</span>
        </div>
      </div>

      {/* Search */}
      <div className="mt-5 rounded-2xl border border-studio-primary/10 bg-white p-4 shadow-sm">
        <form action="/admin/orders" className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search by order ID, customer name, email, or product"
            className="w-full rounded-xl border border-studio-primary/15 px-3 py-2 text-sm focus:border-studio-primary focus:outline-none sm:max-w-md"
          />
          <button
            type="submit"
            className="rounded-full bg-studio-primary px-5 py-2 text-sm font-semibold text-white transition hover:bg-studio-accent"
          >
            Search
          </button>
          {q ? (
            <Link
              href="/admin/orders"
              className="rounded-full border border-studio-primary/20 px-4 py-2 text-xs font-semibold text-studio-primary hover:bg-studio-light"
            >
              Clear
            </Link>
          ) : null}
        </form>
      </div>

      {/* Empty state */}
      {!orders.length ? (
        <div className="mt-6 rounded-2xl border border-dashed border-studio-primary/20 bg-white p-8 text-center text-sm text-studio-ink/60">
          {q ? "No orders match your search." : "No orders found yet."}
        </div>
      ) : null}

      {/* Orders list */}
      <div className="mt-5 space-y-3">
        {orders.map((order) => {
          const statusStyle = getStatusStyle(order.status);
          const itemCount = order.items.reduce((sum, it) => sum + it.quantity, 0);
          const createdAt = new Date(order.createdAt);

          return (
            <article
              key={order.id}
              className="overflow-hidden rounded-2xl border border-studio-primary/10 bg-white shadow-sm transition hover:shadow-md"
            >
              {/* Top bar */}
              <div className="flex flex-col gap-3 border-b border-studio-primary/10 bg-studio-light/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${statusStyle.badge}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`} />
                    {statusStyle.label}
                  </span>
                  <span className="font-mono text-xs text-studio-ink/60">
                    #{order.id.slice(-10).toUpperCase()}
                  </span>
                  <span className="text-xs text-studio-ink/55">
                    {createdAt.toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}{" "}
                    ·{" "}
                    {createdAt.toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="text-base font-semibold text-studio-primary">
                  {formatCurrency(Math.round(order.totalAmount / 100))}
                </p>
              </div>

              {/* Body */}
              <div className="grid gap-4 p-4 sm:px-5 lg:grid-cols-[1fr_1fr_auto]">
                {/* Customer */}
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-studio-ink/50">
                    Customer
                  </p>
                  <p className="mt-1 text-sm font-semibold text-studio-ink">
                    {order.user.name ?? "Guest"}
                  </p>
                  <p className="text-xs text-studio-ink/65">{order.user.email}</p>
                </div>

                {/* Items */}
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-studio-ink/50">
                    Items ({itemCount})
                  </p>
                  <ul className="mt-1 space-y-0.5 text-xs text-studio-ink/70">
                    {order.items.slice(0, 3).map((item) => (
                      <li key={item.id} className="flex items-center justify-between gap-2">
                        <span className="truncate">
                          {item.quantity}× {item.product.name}
                        </span>
                        <span className="shrink-0 text-studio-ink/55">
                          {formatCurrency(Math.round((item.unitPrice * item.quantity) / 100))}
                        </span>
                      </li>
                    ))}
                    {order.items.length > 3 ? (
                      <li className="text-studio-ink/50">
                        +{order.items.length - 3} more item
                        {order.items.length - 3 === 1 ? "" : "s"}
                      </li>
                    ) : null}
                  </ul>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 lg:items-end">
                  <form action={updateOrderStatus} className="flex items-center gap-2">
                    <input type="hidden" name="orderId" value={order.id} />
                    <select
                      name="status"
                      defaultValue={order.status}
                      className="rounded-xl border border-studio-primary/15 px-3 py-2 text-sm focus:border-studio-primary focus:outline-none"
                    >
                      {Object.values(OrderStatus).map((status) => (
                        <option key={status} value={status}>
                          {getStatusStyle(status).label}
                        </option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      className="rounded-full bg-studio-primary px-4 py-2 text-xs font-semibold text-white transition hover:bg-studio-accent"
                    >
                      Update
                    </button>
                  </form>
                </div>
              </div>

              {/* Timeline footer */}
              {order.deliveredAt || order.returnRequestedAt ? (
                <div className="flex flex-wrap gap-4 border-t border-studio-primary/10 bg-studio-light/10 px-4 py-2 text-[11px] text-studio-ink/60 sm:px-5">
                  {order.deliveredAt ? (
                    <span className="text-emerald-700">
                      ✓ Delivered{" "}
                      {new Date(order.deliveredAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  ) : null}
                  {order.returnRequestedAt ? (
                    <span className="text-orange-700">
                      ↩ Return requested{" "}
                      {new Date(order.returnRequestedAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  ) : null}
                </div>
              ) : null}
            </article>
          );
        })}
      </div>

      {/* Pagination */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-studio-primary/10 bg-white px-4 py-3 shadow-sm">
        <p className="text-xs text-studio-ink/70">
          Showing{" "}
          <span className="font-semibold text-studio-ink">
            {(page - 1) * PAGE_SIZE + (orders.length ? 1 : 0)}–
            {(page - 1) * PAGE_SIZE + orders.length}
          </span>{" "}
          of <span className="font-semibold text-studio-ink">{totalCount}</span>
        </p>
        <div className="flex items-center gap-2">
          <Link
            href={buildPageHref(Math.max(1, page - 1))}
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
            href={buildPageHref(Math.min(totalPages, page + 1))}
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
    </section>
  );
}
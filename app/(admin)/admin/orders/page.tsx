import Link from "next/link";
import { revalidatePath } from "next/cache";
import { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { sendOrderStatusUpdateEmail } from "@/lib/mailer";
import { formatCurrency } from "@/lib/utils";

const PAGE_SIZE = 8;

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
    <section className="py-2 sm:py-4">
      <h1 className="text-3xl font-semibold text-studio-primary sm:text-4xl">Order Management</h1>
      <p className="mt-3 text-studio-ink/75">Monitor order lifecycle from payment to fulfillment.</p>

      <form action="/admin/orders" className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search by order id, customer, email, product"
          className="w-full rounded-xl border border-studio-primary/15 px-3 py-2 text-sm sm:max-w-md"
        />
        <button type="submit" className="rounded-full bg-studio-primary px-5 py-2 text-sm font-semibold text-white transition hover:bg-studio-accent">
          Search
        </button>
        {q ? (
          <Link href="/admin/orders" className="rounded-full border border-studio-primary/20 px-4 py-2 text-xs font-semibold text-studio-primary">
            Clear
          </Link>
        ) : null}
      </form>

      {!orders.length ? (
        <div className="mt-6 rounded-2xl border border-dashed border-studio-primary/20 bg-white p-6 text-sm text-studio-ink/70">
          No orders found yet.
        </div>
      ) : null}

      <div className="mt-6 space-y-3">
        {orders.map((order) => (
          <article key={order.id} className="rounded-2xl border border-studio-primary/10 bg-white p-4 shadow-[0_16px_30px_-24px_rgba(63,52,143,0.55)]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-studio-accent">Order #{order.id.slice(-8)}</p>
                <h3 className="mt-1 text-lg font-semibold text-studio-primary">{order.user.name}</h3>
                <p className="text-sm text-studio-ink/70">{order.user.email}</p>
                <p className="mt-1 text-sm font-semibold text-studio-ink">
                  {formatCurrency(Math.round(order.totalAmount / 100))}
                </p>
              </div>
              <form action={updateOrderStatus} className="flex items-center gap-2">
                <input type="hidden" name="orderId" value={order.id} />
                <select
                  name="status"
                  defaultValue={order.status}
                  className="rounded-xl border border-studio-primary/15 px-3 py-2 text-sm"
                >
                  {Object.values(OrderStatus).map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <button type="submit" className="rounded-full bg-studio-primary px-4 py-2 text-xs font-semibold text-white transition hover:bg-studio-accent">
                  Update
                </button>
              </form>
            </div>
            <div className="mt-3 text-xs text-studio-ink/65">
              {order.items.length} item(s) · {new Date(order.createdAt).toLocaleDateString("en-IN")}
            </div>
          </article>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-studio-primary/10 bg-white px-4 py-3 shadow-[0_16px_30px_-26px_rgba(63,52,143,0.45)]">
        <p className="text-sm text-studio-ink/70">
          Showing {(page - 1) * PAGE_SIZE + (orders.length ? 1 : 0)}-{(page - 1) * PAGE_SIZE + orders.length} of {totalCount}
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

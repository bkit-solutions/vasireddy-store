import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { OrderStatus } from "@prisma/client";
import { SignOutButton } from "@/components/ui/SignOutButton";
import { authOptions } from "@/lib/auth";
import { sendOrderStatusUpdateEmail } from "@/lib/mailer";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";

const statusStyles: Record<OrderStatus, string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  PAID: "bg-emerald-50 text-emerald-700 border-emerald-200",
  SHIPPED: "bg-sky-50 text-sky-700 border-sky-200",
  DELIVERED: "bg-green-50 text-green-700 border-green-200",
  RETURN_REQUESTED: "bg-orange-50 text-orange-700 border-orange-200",
  RETURNED: "bg-slate-100 text-slate-700 border-slate-300",
  CANCELLED: "bg-rose-50 text-rose-700 border-rose-200",
};

const PAGE_SIZE = 5;
const RETURN_WINDOW_DAYS = 7;
const RETURN_WINDOW_MS = RETURN_WINDOW_DAYS * 24 * 60 * 60 * 1000;

const deliveredOrReturnedStatuses = [
  OrderStatus.DELIVERED,
  OrderStatus.RETURN_REQUESTED,
  OrderStatus.RETURNED,
].filter(Boolean) as OrderStatus[];

const noticeContent: Record<string, { tone: "success" | "error"; text: string }> = {
  "return-requested": { tone: "success", text: "Return request submitted successfully. Our team will review and update you soon." },
  "return-window-expired": { tone: "error", text: "Return request window has expired. Returns are allowed only within 7 days after delivery." },
  "return-not-eligible": { tone: "error", text: "This order is currently not eligible for return." },
  "order-not-found": { tone: "error", text: "We could not find that order for your account." },
};

function buildAccountHref(page: number, notice?: string) {
  const params = new URLSearchParams();
  if (page > 1) params.set("page", String(page));
  if (notice) params.set("notice", notice);
  const query = params.toString();
  return query ? `/account?${query}` : "/account";
}

async function requestReturnAction(formData: FormData) {
  "use server";

  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }

  const orderId = String(formData.get("orderId") ?? "").trim();
  const currentPage = Math.max(1, Number(formData.get("page") ?? "1") || 1);

  if (!orderId) {
    redirect(buildAccountHref(currentPage, "order-not-found"));
  }

  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      userId: session.user.id,
    },
    include: {
      items: {
        include: {
          product: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  if (!order) {
    redirect(buildAccountHref(currentPage, "order-not-found"));
  }

  if (order.status !== OrderStatus.DELIVERED) {
    redirect(buildAccountHref(currentPage, "return-not-eligible"));
  }

  // Legacy delivered orders may not have deliveredAt populated; fall back to createdAt.
  const deliveredAnchor = order.deliveredAt ?? order.createdAt;
  const returnDeadline = new Date(deliveredAnchor.getTime() + RETURN_WINDOW_MS);
  if (Date.now() > returnDeadline.getTime()) {
    redirect(buildAccountHref(currentPage, "return-window-expired"));
  }

  const updatedOrder = await prisma.order.update({
    where: { id: order.id },
    data: {
      status: OrderStatus.RETURN_REQUESTED,
      returnRequestedAt: new Date(),
      deliveredAt: order.deliveredAt ?? deliveredAnchor,
    },
  });

  if (session.user.email) {
    try {
      await sendOrderStatusUpdateEmail(session.user.email, updatedOrder.id, updatedOrder.status, {
        items: order.items.map((item) => ({
          name: item.product.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
        totalAmount: updatedOrder.totalAmount,
        createdAt: updatedOrder.createdAt,
      });
    } catch (error) {
      console.error("Failed to send return request email", error);
    }
  }

  revalidatePath("/account");
  revalidatePath("/admin/orders");
  redirect(buildAccountHref(currentPage, "return-requested"));
}

export default async function AccountPage({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string; notice?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const session = await getServerSession(authOptions);

  if (!session) {
    return (
      <section className="section-shell py-12">
        <h1 className="text-4xl font-semibold text-studio-primary">Account & Orders</h1>
        <p className="mt-3 text-studio-ink/75">Please sign in to view your account and order history.</p>
        <Link
          href="/login"
          className="mt-6 inline-flex rounded-full bg-studio-primary px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-studio-accent"
        >
          Login to Continue
        </Link>
      </section>
    );
  }

  const requestedPage = Math.max(1, Number(resolvedSearchParams?.page ?? "1") || 1);
  const where = { userId: session.user.id };

  const [totalOrders, deliveredCount, totalSpendAggregate, latestOrder] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.count({
      where: {
        userId: session.user.id,
        status: {
          in: deliveredOrReturnedStatuses,
        },
      },
    }),
    prisma.order.aggregate({
      where,
      _sum: { totalAmount: true },
    }),
    prisma.order.findFirst({
      where,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalOrders / PAGE_SIZE));
  const page = Math.min(requestedPage, totalPages);

  const orders = await prisma.order.findMany({
    where,
    include: {
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

  const totalSpend = totalSpendAggregate._sum.totalAmount ?? 0;
  const selectedNotice = (resolvedSearchParams?.notice ?? "").trim();
  const notice = noticeContent[selectedNotice];

  const now = Date.now();

  function daysLeftInWindow(anchorDate: Date) {
    const remainingMs = anchorDate.getTime() + RETURN_WINDOW_MS - now;
    return Math.max(0, Math.ceil(remainingMs / (24 * 60 * 60 * 1000)));
  }

  function deliveryAnchor(order: (typeof orders)[number]) {
    return order.deliveredAt ?? order.createdAt;
  }

  function canRequestReturn(order: (typeof orders)[number]) {
    if (order.status !== OrderStatus.DELIVERED) return false;
    return now <= deliveryAnchor(order).getTime() + RETURN_WINDOW_MS;
  }

  return (
    <section className="section-shell py-12">
      <div className="animate-reveal-up rounded-3xl border border-studio-primary/10 bg-white/90 p-6 shadow-[0_20px_42px_-30px_rgba(32,29,26,0.3)] md:p-8">
        <h1 className="text-4xl font-semibold text-studio-primary">My Account</h1>
        <p className="mt-3 text-studio-ink/75">
          Signed in as <span className="font-semibold text-studio-primary">{session.user.email}</span>
        </p>

        {notice ? (
          <div
            className={`mt-5 rounded-2xl border px-4 py-3 text-sm font-medium ${
              notice.tone === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-rose-200 bg-rose-50 text-rose-700"
            }`}
          >
            {notice.text}
          </div>
        ) : null}

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-studio-primary/10 bg-studio-light/35 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-studio-muted">Total Orders</p>
            <p className="mt-2 text-3xl font-semibold text-studio-primary">{totalOrders}</p>
          </div>
          <div className="rounded-2xl border border-studio-primary/10 bg-studio-light/35 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-studio-muted">Delivered</p>
            <p className="mt-2 text-3xl font-semibold text-studio-primary">{deliveredCount}</p>
          </div>
          <div className="rounded-2xl border border-studio-primary/10 bg-studio-light/35 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-studio-muted">Total Spend</p>
            <p className="mt-2 text-3xl font-semibold text-studio-primary">{formatCurrency(Math.round(totalSpend / 100))}</p>
          </div>
          <div className="rounded-2xl border border-studio-primary/10 bg-studio-light/35 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-studio-muted">Latest Order</p>
            <p className="mt-2 text-base font-semibold text-studio-primary">{latestOrder ? `#${latestOrder.id.slice(-8)}` : "No orders yet"}</p>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between gap-3">
          <h2 className="text-2xl font-semibold text-studio-primary">Order History</h2>
          <SignOutButton />
        </div>

        {!orders.length ? (
          <p className="mt-3 text-sm text-studio-ink/70">No orders yet. Complete checkout to create your first order.</p>
        ) : (
          <div className="mt-5 space-y-4">
            {orders.map((order) => (
              <article key={order.id} className="rounded-2xl border border-studio-primary/10 bg-white p-4 shadow-[0_16px_28px_-24px_rgba(32,29,26,0.24)]">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.12em] text-studio-accent">Order #{order.id.slice(-8)}</p>
                    <p className="mt-1 text-sm text-studio-ink/70">{new Date(order.createdAt).toLocaleDateString("en-IN")}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full border px-3 py-1 text-xs font-semibold tracking-[0.08em] ${statusStyles[order.status]}`}>
                      {order.status}
                    </span>
                    <p className="text-sm font-semibold text-studio-ink">{formatCurrency(Math.round(order.totalAmount / 100))}</p>
                  </div>
                </div>

                <div className="mt-4 grid gap-2 md:grid-cols-2">
                  {order.items.map((item) => (
                    <div key={item.id} className="rounded-xl border border-studio-primary/10 bg-studio-light/25 px-3 py-2">
                      <p className="text-sm font-semibold text-studio-primary">{item.product.name}</p>
                      <p className="text-xs text-studio-ink/65">
                        Qty {item.quantity} · {formatCurrency(Math.round(item.unitPrice / 100))} each
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 rounded-xl border border-studio-primary/10 bg-studio-light/20 p-3">
                  {order.status === OrderStatus.RETURN_REQUESTED ? (
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-orange-700">
                      Return requested {order.returnRequestedAt ? `on ${new Date(order.returnRequestedAt).toLocaleDateString("en-IN")}` : ""}
                    </p>
                  ) : null}

                  {order.status === OrderStatus.RETURNED ? (
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-700">Order returned</p>
                  ) : null}

                  {order.status === OrderStatus.DELIVERED ? (
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-studio-primary">
                          Delivered on {new Date(deliveryAnchor(order)).toLocaleDateString("en-IN")}
                        </p>
                        <p className="text-xs text-studio-ink/70">
                          {canRequestReturn(order)
                            ? `Return window closes in ${daysLeftInWindow(deliveryAnchor(order))} day(s).`
                            : "Return window closed (7 days from delivery)."}
                        </p>
                      </div>

                      {canRequestReturn(order) ? (
                        <form action={requestReturnAction}>
                          <input type="hidden" name="orderId" value={order.id} />
                          <input type="hidden" name="page" value={String(page)} />
                          <button
                            type="submit"
                            className="rounded-full border border-studio-primary/30 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-studio-primary transition hover:-translate-y-0.5 hover:border-studio-primary hover:bg-studio-light/35"
                          >
                            Request Return
                          </button>
                        </form>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </article>
            ))}

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-studio-primary/10 bg-white px-4 py-3">
              <p className="text-sm text-studio-ink/70">
                Showing {(page - 1) * PAGE_SIZE + 1}-{(page - 1) * PAGE_SIZE + orders.length} of {totalOrders}
              </p>
              <div className="flex items-center gap-2">
                <Link
                  href={buildAccountHref(Math.max(1, page - 1))}
                  className={`rounded-full px-4 py-2 text-xs font-semibold ${
                    page <= 1
                      ? "pointer-events-none border border-studio-primary/10 text-studio-ink/35"
                      : "border border-studio-primary/20 text-studio-primary"
                  }`}
                >
                  Prev
                </Link>
                <span className="text-xs font-semibold text-studio-ink/65">Page {page} / {totalPages}</span>
                <Link
                  href={buildAccountHref(Math.min(totalPages, page + 1))}
                  className={`rounded-full px-4 py-2 text-xs font-semibold ${
                    page >= totalPages
                      ? "pointer-events-none border border-studio-primary/10 text-studio-ink/35"
                      : "border border-studio-primary/20 text-studio-primary"
                  }`}
                >
                  Next
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

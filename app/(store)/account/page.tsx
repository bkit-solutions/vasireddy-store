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

const statusStyles: Record<OrderStatus, { badge: string; dot: string }> = {
  PENDING: { badge: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500" },
  PAID: { badge: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  SHIPPED: { badge: "bg-sky-50 text-sky-700 border-sky-200", dot: "bg-sky-500" },
  DELIVERED: { badge: "bg-green-50 text-green-700 border-green-200", dot: "bg-green-500" },
  RETURN_REQUESTED: { badge: "bg-orange-50 text-orange-700 border-orange-200", dot: "bg-orange-500" },
  RETURNED: { badge: "bg-slate-100 text-slate-700 border-slate-300", dot: "bg-slate-500" },
  CANCELLED: { badge: "bg-rose-50 text-rose-700 border-rose-200", dot: "bg-rose-500" },
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
          product: { select: { name: true } },
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

  // ─── Signed-out state ────────────────────────────────────
  if (!session) {
    return (
      <section className="section-shell py-16">
        <div className="mx-auto max-w-xl rounded-3xl border border-studio-primary/10 bg-white/90 p-10 text-center shadow-[0_20px_60px_-35px_rgba(63,52,143,0.25)] backdrop-blur-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-studio-light/60 text-2xl">
            🔒
          </div>
          <h1 className="mt-5 text-3xl font-semibold text-studio-primary">Account & Orders</h1>
          <p className="mt-3 text-sm leading-7 text-studio-ink/70">
            Please sign in to view your account details, order history, and manage returns.
          </p>
          <Link
            href="/login"
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-studio-primary px-7 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-studio-accent"
          >
            Login to Continue
            <span>→</span>
          </Link>
        </div>
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
        status: { in: deliveredOrReturnedStatuses },
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
      items: { include: { product: true } },
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

  // Initials for avatar
  const initial = (session.user.email ?? "U").charAt(0).toUpperCase();

  return (
    <section className="section-shell py-12 md:py-16">
      {/* ─── Hero / Header Card ─── */}
      <div className="animate-reveal-up overflow-hidden rounded-[2rem] border border-studio-primary/10 bg-[linear-gradient(180deg,#fbf8f2_0%,#ffffff_60%)] shadow-[0_20px_60px_-35px_rgba(63,52,143,0.25)] backdrop-blur-sm">
        
        {/* Profile strip */}
        <div className="flex flex-col gap-5 border-b border-studio-primary/10 p-6 md:flex-row md:items-center md:justify-between md:p-8">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-studio-primary text-xl font-semibold text-white shadow-[0_10px_25px_-10px_rgba(63,52,143,0.5)]">
              {initial}
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-studio-accent">
                Welcome Back
              </p>
              <h1 className="mt-1 text-2xl font-semibold text-studio-primary md:text-3xl">
                My Account
              </h1>
              <p className="mt-1 text-sm text-studio-ink/65">
                {session.user.email}
              </p>
            </div>
          </div>
          <SignOutButton />
        </div>

        {/* Notice banner */}
        {notice ? (
          <div className="px-6 pt-6 md:px-8">
            <div
              className={`flex items-start gap-3 rounded-2xl border px-4 py-3.5 text-sm font-medium ${
                notice.tone === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-rose-200 bg-rose-50 text-rose-700"
              }`}
            >
              <span className="mt-0.5 text-base">
                {notice.tone === "success" ? "✓" : "⚠"}
              </span>
              <p className="leading-6">{notice.text}</p>
            </div>
          </div>
        ) : null}

        {/* ─── Stats Grid ─── */}
        <div className="grid gap-3 p-6 sm:grid-cols-2 lg:grid-cols-4 md:p-8">
          {[
            { label: "Total Orders", value: totalOrders, icon: "📦" },
            { label: "Delivered", value: deliveredCount, icon: "✓" },
            { label: "Total Spend", value: formatCurrency(Math.round(totalSpend / 100)), icon: "₹" },
            { label: "Latest Order", value: latestOrder ? `#${latestOrder.id.slice(-8)}` : "—", icon: "🕒" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="group relative overflow-hidden rounded-2xl border border-studio-primary/10 bg-white p-5 transition-all hover:border-studio-primary/25 hover:shadow-[0_15px_35px_-20px_rgba(63,52,143,0.3)]"
            >
              <div className="flex items-start justify-between">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-studio-muted">
                  {stat.label}
                </p>
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-studio-light/60 text-xs">
                  {stat.icon}
                </span>
              </div>
              <p className="mt-3 text-2xl font-semibold text-studio-primary md:text-[26px]">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* ─── Order History Section ─── */}
        <div className="border-t border-studio-primary/10 p-6 md:p-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-studio-primary md:text-2xl">
                Order History
              </h2>
              <p className="mt-1 text-xs text-studio-ink/60">
                Track, manage, and request returns for your orders.
              </p>
            </div>
            {totalOrders > 0 ? (
              <span className="rounded-full border border-studio-primary/15 bg-studio-light/40 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-studio-primary">
                {totalOrders} {totalOrders === 1 ? "Order" : "Orders"}
              </span>
            ) : null}
          </div>

          {!orders.length ? (
            // ─── Empty State ───
            <div className="mt-8 rounded-2xl border border-dashed border-studio-primary/20 bg-studio-light/20 p-10 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-2xl shadow-sm">
                🛍️
              </div>
              <p className="mt-4 text-sm font-semibold text-studio-primary">No orders yet</p>
              <p className="mt-1 text-xs text-studio-ink/60">
                Complete checkout to create your first order.
              </p>
              <Link
                href="/collections"
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-studio-primary px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-studio-accent"
              >
                Explore Collections <span>→</span>
              </Link>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {orders.map((order) => {
                const status = statusStyles[order.status];
                const daysLeft = daysLeftInWindow(deliveryAnchor(order));
                const windowProgress = Math.max(0, Math.min(100, (daysLeft / RETURN_WINDOW_DAYS) * 100));

                return (
                  <article
                    key={order.id}
                    className="group overflow-hidden rounded-2xl border border-studio-primary/10 bg-white transition-all hover:border-studio-primary/20 hover:shadow-[0_20px_40px_-28px_rgba(63,52,143,0.3)]"
                  >
                    {/* Order header */}
                    <div className="flex flex-col gap-3 border-b border-studio-primary/5 p-5 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-studio-accent">
                            Order
                          </p>
                          <span className="text-[10px] font-semibold text-studio-ink/40">#{order.id.slice(-8)}</span>
                        </div>
                        <p className="mt-1.5 text-sm font-medium text-studio-primary">
                          {new Date(order.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${status.badge}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                          {order.status.replace("_", " ")}
                        </span>
                        <p className="text-base font-semibold text-studio-primary">
                          {formatCurrency(Math.round(order.totalAmount / 100))}
                        </p>
                      </div>
                    </div>

                    {/* Order items */}
                    <div className="grid gap-2 p-5 md:grid-cols-2">
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between rounded-xl border border-studio-primary/10 bg-studio-light/20 px-4 py-3"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-studio-primary">
                              {item.product.name}
                            </p>
                            <p className="mt-0.5 text-[11px] text-studio-ink/60">
                              Qty {item.quantity} · {formatCurrency(Math.round(item.unitPrice / 100))} each
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Return / status footer */}
                    {(order.status === OrderStatus.DELIVERED ||
                      order.status === OrderStatus.RETURN_REQUESTED ||
                      order.status === OrderStatus.RETURNED) && (
                      <div className="border-t border-studio-primary/5 bg-studio-light/15 p-5">
                        {order.status === OrderStatus.RETURN_REQUESTED ? (
                          <div className="flex items-center gap-3">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                              ↻
                            </span>
                            <div>
                              <p className="text-sm font-semibold text-orange-700">Return Requested</p>
                              <p className="text-[11px] text-studio-ink/60">
                                {order.returnRequestedAt
                                  ? `Submitted on ${new Date(order.returnRequestedAt).toLocaleDateString("en-IN")}`
                                  : "Pending review"}
                              </p>
                            </div>
                          </div>
                        ) : null}

                        {order.status === OrderStatus.RETURNED ? (
                          <div className="flex items-center gap-3">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                              ✓
                            </span>
                            <p className="text-sm font-semibold text-slate-700">Order Returned</p>
                          </div>
                        ) : null}

                        {order.status === OrderStatus.DELIVERED ? (
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-green-100 text-green-600 text-xs">
                                  ✓
                                </span>
                                <p className="text-sm font-semibold text-studio-primary">
                                  Delivered on{" "}
                                  {new Date(deliveryAnchor(order)).toLocaleDateString("en-IN")}
                                </p>
                              </div>

                              {/* Return window progress */}
                              <div className="mt-3 max-w-sm">
                                <div className="flex items-center justify-between text-[11px] text-studio-ink/60">
                                  <span>
                                    {canRequestReturn(order)
                                      ? `Return window: ${daysLeft} day${daysLeft === 1 ? "" : "s"} left`
                                      : "Return window closed"}
                                  </span>
                                  <span className="font-semibold text-studio-primary/70">
                                    {RETURN_WINDOW_DAYS}d
                                  </span>
                                </div>
                                <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-studio-primary/10">
                                  <div
                                    className={`h-full rounded-full transition-all ${
                                      canRequestReturn(order)
                                        ? "bg-studio-primary"
                                        : "bg-studio-ink/20"
                                    }`}
                                    style={{ width: `${windowProgress}%` }}
                                  />
                                </div>
                              </div>
                            </div>

                            {canRequestReturn(order) ? (
                              <form action={requestReturnAction}>
                                <input type="hidden" name="orderId" value={order.id} />
                                <input type="hidden" name="page" value={String(page)} />
                                <button
                                  type="submit"
                                  className="inline-flex items-center gap-2 rounded-full border border-studio-primary/25 bg-white px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-studio-primary transition hover:border-studio-accent hover:bg-studio-primary hover:text-white"
                                >
                                  Request Return <span>→</span>
                                </button>
                              </form>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    )}
                  </article>
                );
              })}

              {/* ─── Pagination ─── */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-studio-primary/10 bg-white px-5 py-4">
                <p className="text-xs text-studio-ink/65">
                  Showing{" "}
                  <span className="font-semibold text-studio-primary">
                    {(page - 1) * PAGE_SIZE + 1}–{(page - 1) * PAGE_SIZE + orders.length}
                  </span>{" "}
                  of <span className="font-semibold text-studio-primary">{totalOrders}</span>
                </p>
                <div className="flex items-center gap-2">
                  <Link
                    href={buildAccountHref(Math.max(1, page - 1))}
                    className={`inline-flex items-center gap-1 rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] transition ${
                      page <= 1
                        ? "pointer-events-none border border-studio-primary/10 text-studio-ink/30"
                        : "border border-studio-primary/20 text-studio-primary hover:border-studio-accent hover:text-studio-accent"
                    }`}
                  >
                    ← Prev
                  </Link>
                  <span className="rounded-full bg-studio-light/50 px-3 py-1.5 text-[11px] font-semibold text-studio-primary">
                    {page} / {totalPages}
                  </span>
                  <Link
                    href={buildAccountHref(Math.min(totalPages, page + 1))}
                    className={`inline-flex items-center gap-1 rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] transition ${
                      page >= totalPages
                        ? "pointer-events-none border border-studio-primary/10 text-studio-ink/30"
                        : "border border-studio-primary/20 text-studio-primary hover:border-studio-accent hover:text-studio-accent"
                    }`}
                  >
                    Next →
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
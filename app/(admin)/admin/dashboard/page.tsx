import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import {
  ShoppingBag,
  Package,
  Users,
  Ticket,
  TrendingUp,
  TrendingDown,
  Plus,
  ArrowUpRight,
} from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Helper to compute % change safely
function percentChange(current: number, previous: number) {
  if (previous === 0) return current === 0 ? 0 : 100;
  return ((current - previous) / previous) * 100;
}

export default async function AdminDashboardPage() {
  const now = new Date();
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  const [
    orders,
    products,
    customers,
    coupons,
    revenueAgg,
    ordersThisMonth,
    ordersLastMonth,
    productsThisMonth,
    productsLastMonth,
    customersThisMonth,
    customersLastMonth,
    couponsThisMonth,
    couponsLastMonth,
    revenueThisMonth,
    revenueLastMonth,
    recentOrders,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.product.count({ where: { isActive: true } }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.coupon.count(),
    prisma.order.aggregate({ _sum: { totalAmount: true } }),

    // This month counts
    prisma.order.count({ where: { createdAt: { gte: startOfThisMonth } } }),
    prisma.order.count({
      where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } },
    }),
    prisma.product.count({
      where: { isActive: true, createdAt: { gte: startOfThisMonth } },
    }),
    prisma.product.count({
      where: {
        isActive: true,
        createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
      },
    }),
    prisma.user.count({
      where: { role: "CUSTOMER", createdAt: { gte: startOfThisMonth } },
    }),
    prisma.user.count({
      where: {
        role: "CUSTOMER",
        createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
      },
    }),
    prisma.coupon.count({ where: { createdAt: { gte: startOfThisMonth } } }),
    prisma.coupon.count({
      where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } },
    }),

    // Revenue this/last month
    prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { createdAt: { gte: startOfThisMonth } },
    }),
    prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } },
    }),

    // Recent orders list
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { user: true },
    }),
  ]);

  const totalRevenue = Math.round((revenueAgg._sum.totalAmount ?? 0) / 100);
  const thisMonthRevenue = Math.round((revenueThisMonth._sum.totalAmount ?? 0) / 100);
  const lastMonthRevenue = Math.round((revenueLastMonth._sum.totalAmount ?? 0) / 100);

  const cards = [
    {
      label: "Total Orders",
      value: orders.toLocaleString(),
      change: percentChange(ordersThisMonth, ordersLastMonth),
      icon: ShoppingBag,
      href: "/admin/orders",
      accent: "from-indigo-500/10 to-indigo-500/0",
      iconColor: "text-indigo-600 bg-indigo-50",
    },
    {
      label: "Active Products",
      value: products.toLocaleString(),
      change: percentChange(productsThisMonth, productsLastMonth),
      icon: Package,
      href: "/admin/products",
      accent: "from-emerald-500/10 to-emerald-500/0",
      iconColor: "text-emerald-600 bg-emerald-50",
    },
    {
      label: "Customers",
      value: customers.toLocaleString(),
      change: percentChange(customersThisMonth, customersLastMonth),
      icon: Users,
      href: "/admin/customers",
      accent: "from-amber-500/10 to-amber-500/0",
      iconColor: "text-amber-600 bg-amber-50",
    },
    {
      label: "Coupons",
      value: coupons.toLocaleString(),
      change: percentChange(couponsThisMonth, couponsLastMonth),
      icon: Ticket,
      href: "/admin/coupons",
      accent: "from-rose-500/10 to-rose-500/0",
      iconColor: "text-rose-600 bg-rose-50",
    },
  ];

  const revenueChange = percentChange(thisMonthRevenue, lastMonthRevenue);

  const quickActions = [
    { label: "Add Product", href: "/admin/products", icon: Plus },
    { label: "Create Coupon", href: "/admin/coupons", icon: Ticket },
    { label: "View Orders", href: "/admin/orders", icon: ShoppingBag },
  ];

  return (
    <section className="py-2 sm:py-4">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-studio-primary sm:text-4xl">
            Admin Dashboard
          </h1>
          <p className="mt-2 text-studio-ink/75">
            Live overview of your store — updates in real time as activity happens.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="inline-flex items-center gap-2 rounded-xl bg-studio-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:opacity-90"
            >
              <action.icon className="h-4 w-4" />
              {action.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="mt-8 grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const isUp = card.change >= 0;
          return (
            <Link
              key={card.label}
              href={card.href}
              className="group relative overflow-hidden rounded-2xl border border-studio-primary/10 bg-white p-5 shadow-[0_16px_30px_-24px_rgba(63,52,143,0.55)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_40px_-20px_rgba(63,52,143,0.45)] sm:p-6"
            >
              <div
                className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${card.accent} opacity-0 transition group-hover:opacity-100`}
              />
              <div className="relative flex items-start justify-between">
                <div>
                  <p className="text-sm text-studio-ink/70">{card.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-studio-primary sm:text-3xl">
                    {card.value}
                  </p>
                </div>
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.iconColor}`}
                >
                  <card.icon className="h-5 w-5" />
                </span>
              </div>
              <div className="relative mt-4 flex items-center justify-between text-xs">
                <span
                  className={`inline-flex items-center gap-1 font-medium ${
                    isUp ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {isUp ? (
                    <TrendingUp className="h-3.5 w-3.5" />
                  ) : (
                    <TrendingDown className="h-3.5 w-3.5" />
                  )}
                  {isUp ? "+" : ""}
                  {card.change.toFixed(1)}%
                </span>
                <span className="flex items-center gap-1 text-studio-ink/60">
                  View <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Revenue + Recent Orders */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {/* Revenue Card */}
        <div className="relative overflow-hidden rounded-2xl border border-studio-primary/10 bg-gradient-to-br from-studio-primary to-studio-primary/80 p-6 text-white shadow-[0_20px_36px_-20px_rgba(63,52,143,0.65)] lg:col-span-1">
          <div className="flex items-center justify-between">
            <p className="text-sm text-white/80">Total Revenue</p>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
              <TrendingUp className="h-5 w-5" />
            </span>
          </div>
          <p className="mt-4 text-3xl font-semibold sm:text-4xl">
            {formatCurrency(totalRevenue)}
          </p>
          <div className="mt-3 flex items-center gap-2 text-sm">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                revenueChange >= 0
                  ? "bg-emerald-400/20 text-emerald-100"
                  : "bg-rose-400/20 text-rose-100"
              }`}
            >
              {revenueChange >= 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {revenueChange >= 0 ? "+" : ""}
              {revenueChange.toFixed(1)}%
            </span>
            <span className="text-white/70 text-xs">vs last month</span>
          </div>
          <p className="mt-4 text-sm text-white/80">
            This month: {formatCurrency(thisMonthRevenue)}
          </p>
          <div className="pointer-events-none absolute -right-8 -bottom-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
        </div>

        {/* Recent Orders */}
        <div className="rounded-2xl border border-studio-primary/10 bg-white p-5 shadow-[0_16px_30px_-24px_rgba(63,52,143,0.55)] sm:p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-studio-primary">
              Recent Orders
            </h2>
            <Link
              href="/admin/orders"
              className="text-sm text-studio-primary hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="mt-4 divide-y divide-studio-primary/5">
            {recentOrders.length === 0 ? (
              <p className="py-8 text-center text-sm text-studio-ink/60">
                No orders yet. They'll appear here as customers check out.
              </p>
            ) : (
              recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-studio-ink">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="text-xs text-studio-ink/60">
                      {order.user?.name ?? order.user?.email ?? "Guest"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-studio-primary">
                      {formatCurrency(Math.round(order.totalAmount / 100))}
                    </p>
                    <p className="text-xs text-studio-ink/60">
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const [orders, products, customers, coupons, revenueAgg] = await Promise.all([
    prisma.order.count(),
    prisma.product.count({ where: { isActive: true } }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.coupon.count(),
    prisma.order.aggregate({ _sum: { totalAmount: true } }),
  ]);

  const cards = [
    { label: "Total Orders", value: String(orders) },
    { label: "Active Products", value: String(products) },
    { label: "Customers", value: String(customers) },
    { label: "Coupons", value: String(coupons) },
  ];

  return (
    <section className="py-2 sm:py-4">
      <h1 className="text-3xl font-semibold text-studio-primary sm:text-4xl">Admin Dashboard</h1>
      <p className="mt-3 text-studio-ink/75">Manage products, orders, customers, and marketing assets.</p>
      <div className="mt-6 grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-studio-primary/10 bg-white p-4 shadow-[0_16px_30px_-24px_rgba(63,52,143,0.55)] sm:p-6">
            <p className="text-sm text-studio-ink/70">{card.label}</p>
            <p className="mt-2 text-2xl font-semibold text-studio-primary sm:text-3xl">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-studio-primary/10 bg-white p-4 shadow-[0_20px_36px_-30px_rgba(63,52,143,0.65)] sm:p-6">
        <p className="text-sm text-studio-ink/70">Total Revenue</p>
        <p className="mt-2 text-2xl font-semibold text-studio-primary sm:text-3xl">
          {formatCurrency(Math.round((revenueAgg._sum.totalAmount ?? 0) / 100))}
        </p>
      </div>
    </section>
  );
}

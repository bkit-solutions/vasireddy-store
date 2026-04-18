import Link from "next/link";
import { revalidatePath } from "next/cache";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { sendOfferAnnouncementEmail } from "@/lib/mailer";

const PAGE_SIZE = 10;

// ── Helpers ──────────────────────────────────────────────────────────────────

async function notifyCustomersAboutOffer(input: {
  subject: string;
  heading: string;
  message: string;
}) {
  try {
    const recipients = await prisma.user.findMany({
      where: { role: UserRole.CUSTOMER },
      select: { email: true },
    });
    const recipientEmails = recipients.map((u) => u.email).filter(Boolean);
    await sendOfferAnnouncementEmail({
      recipients: recipientEmails,
      subject: input.subject,
      heading: input.heading,
      message: input.message,
    });
  } catch (error) {
    console.error("Failed to send coupon offer notifications", error);
  }
}

// ── Server Actions ───────────────────────────────────────────────────────────

async function createCoupon(formData: FormData) {
  "use server";

  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  const description = String(formData.get("description") ?? "").trim();
  const discountPercent = Number(formData.get("discountPercent") ?? 0);
  const notify = String(formData.get("notify") ?? "") === "on";

  if (!code || !Number.isFinite(discountPercent) || discountPercent < 1 || discountPercent > 90) {
    return;
  }

  await prisma.coupon.create({
    data: {
      code,
      description: description || null,
      discountPercent: Math.round(discountPercent),
      active: true,
    },
  });

  if (notify) {
    await notifyCustomersAboutOffer({
      subject: `New Offer: ${code}`,
      heading: "A new discount offer is live",
      message: `Use code ${code} to get ${Math.round(discountPercent)}% off on your next order. ${description || "Limited period offer."}`,
    });
  }

  revalidatePath("/admin/coupons");
}

async function toggleCouponStatus(formData: FormData) {
  "use server";

  const couponId = String(formData.get("couponId") ?? "");
  const nextValue = String(formData.get("nextValue") ?? "") === "true";
  if (!couponId) return;

  const updatedCoupon = await prisma.coupon.update({
    where: { id: couponId },
    data: { active: nextValue },
    select: { code: true, discountPercent: true },
  });

  await notifyCustomersAboutOffer({
    subject: nextValue
      ? `Offer Active Again: ${updatedCoupon.code}`
      : `Offer Update: ${updatedCoupon.code}`,
    heading: nextValue ? "Offer is active" : "Offer has been paused",
    message: nextValue
      ? `Coupon ${updatedCoupon.code} is now active with ${updatedCoupon.discountPercent}% off.`
      : `Coupon ${updatedCoupon.code} is currently inactive. Watch for upcoming promotions.`,
  });

  revalidatePath("/admin/coupons");
}

async function deleteCoupon(formData: FormData) {
  "use server";
  const couponId = String(formData.get("couponId") ?? "");
  if (!couponId) return;
  await prisma.coupon.delete({ where: { id: couponId } });
  revalidatePath("/admin/coupons");
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function AdminCouponsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; status?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const q = resolvedSearchParams.q?.trim() ?? "";
  const statusFilter = resolvedSearchParams.status?.trim() ?? "";
  const page = Math.max(1, Number(resolvedSearchParams.page ?? "1") || 1);

  const where: any = {};
  if (q) {
    where.OR = [
      { code: { contains: q } },
      { description: { contains: q } },
    ];
  }
  if (statusFilter === "active") where.active = true;
  if (statusFilter === "inactive") where.active = false;

  const [coupons, totalCount, activeCount, inactiveCount] = await Promise.all([
    prisma.coupon.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.coupon.count({ where }),
    prisma.coupon.count({ where: { active: true } }),
    prisma.coupon.count({ where: { active: false } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const totalCoupons = activeCount + inactiveCount;
  const avgDiscount =
    coupons.length > 0
      ? Math.round(
          coupons.reduce((sum, c) => sum + c.discountPercent, 0) / coupons.length,
        )
      : 0;

  function buildHref(overrides: { page?: number; status?: string | null; q?: string }) {
    const params = new URLSearchParams();
    const nextQ = overrides.q !== undefined ? overrides.q : q;
    const nextStatus = overrides.status !== undefined ? overrides.status : statusFilter;
    const nextPage = overrides.page ?? 1;
    if (nextQ) params.set("q", nextQ);
    if (nextStatus) params.set("status", nextStatus);
    if (nextPage > 1) params.set("page", String(nextPage));
    const query = params.toString();
    return query ? `/admin/coupons?${query}` : "/admin/coupons";
  }

  return (
    <section className="py-4">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-studio-primary sm:text-3xl">Coupons</h1>
          <p className="mt-1 text-sm text-studio-ink/70">
            Create and manage discount campaigns for festive and wedding launches.
          </p>
        </div>
        <div className="text-xs text-studio-ink/60">
          <span className="font-semibold text-emerald-600">{activeCount}</span> active ·{" "}
          <span className="font-semibold text-studio-ink/60">{inactiveCount}</span> paused
        </div>
      </div>

      {/* Stat Cards */}
      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="rounded-2xl border border-studio-primary/10 bg-white p-4 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-studio-ink/55">
            Total Coupons
          </p>
          <p className="mt-2 text-2xl font-semibold text-studio-primary">{totalCoupons}</p>
        </div>
        <div className="rounded-2xl border border-studio-primary/10 bg-white p-4 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-studio-ink/55">
            Active
          </p>
          <p className="mt-2 text-2xl font-semibold text-emerald-600">{activeCount}</p>
        </div>
        <div className="rounded-2xl border border-studio-primary/10 bg-white p-4 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-studio-ink/55">
            Paused
          </p>
          <p className="mt-2 text-2xl font-semibold text-studio-ink/70">{inactiveCount}</p>
        </div>
        <div className="rounded-2xl border border-studio-primary/10 bg-white p-4 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-studio-ink/55">
            Avg Discount (page)
          </p>
          <p className="mt-2 text-2xl font-semibold text-studio-primary">{avgDiscount}%</p>
        </div>
      </div>

      {/* Create Form */}
      <div className="mt-5 rounded-2xl border border-studio-primary/10 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-studio-primary/10 text-studio-primary">
            🎟️
          </span>
          <div>
            <h2 className="text-base font-semibold text-studio-primary">Create New Coupon</h2>
            <p className="text-xs text-studio-ink/55">
              Codes are auto-uppercased. Discount must be between 1% and 90%.
            </p>
          </div>
        </div>
        <form action={createCoupon} className="mt-4 grid gap-3 md:grid-cols-[1fr_160px_auto]">
          <input
            name="code"
            required
            placeholder="e.g. WEDDING25"
            className="rounded-xl border border-studio-primary/15 px-3 py-2 text-sm font-mono uppercase focus:border-studio-primary focus:outline-none"
          />
          <input
            name="discountPercent"
            type="number"
            required
            min="1"
            max="90"
            placeholder="Discount %"
            className="rounded-xl border border-studio-primary/15 px-3 py-2 text-sm focus:border-studio-primary focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-full bg-studio-primary px-5 py-2 text-sm font-semibold text-white transition hover:bg-studio-accent"
          >
            Create Coupon
          </button>
          <input
            name="description"
            placeholder="Description (optional) — e.g. Diwali festive offer"
            className="rounded-xl border border-studio-primary/15 px-3 py-2 text-sm focus:border-studio-primary focus:outline-none md:col-span-3"
          />
          <label className="flex items-center gap-2 text-xs text-studio-ink/70 md:col-span-3">
            <input
              type="checkbox"
              name="notify"
              defaultChecked
              className="h-4 w-4 rounded border-studio-primary/30 text-studio-primary focus:ring-studio-primary"
            />
            Email all customers about this new offer
          </label>
        </form>
      </div>

      {/* Filters */}
      <div className="mt-5 rounded-2xl border border-studio-primary/10 bg-white p-4 shadow-sm">
        <form action="/admin/coupons" className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {statusFilter ? <input type="hidden" name="status" value={statusFilter} /> : null}
          <input
            name="q"
            defaultValue={q}
            placeholder="Search by code or description"
            className="w-full rounded-xl border border-studio-primary/15 px-3 py-2 text-sm focus:border-studio-primary focus:outline-none sm:max-w-md"
          />
          <button
            type="submit"
            className="rounded-full bg-studio-primary px-5 py-2 text-sm font-semibold text-white transition hover:bg-studio-accent"
          >
            Search
          </button>
          {q || statusFilter ? (
            <Link
              href="/admin/coupons"
              className="rounded-full border border-studio-primary/20 px-4 py-2 text-xs font-semibold text-studio-primary hover:bg-studio-light"
            >
              Clear
            </Link>
          ) : null}
        </form>

        <div className="mt-3 flex flex-wrap gap-2">
          {[
            { key: null, label: `All (${totalCoupons})` },
            { key: "active", label: `Active (${activeCount})`, dot: "bg-emerald-500" },
            { key: "inactive", label: `Paused (${inactiveCount})`, dot: "bg-slate-400" },
          ].map((f) => {
            const active = (statusFilter || null) === f.key;
            return (
              <Link
                key={f.label}
                href={buildHref({ status: f.key })}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition ${
                  active
                    ? "border-studio-primary bg-studio-primary text-white"
                    : "border-studio-primary/15 text-studio-ink/70 hover:bg-studio-light"
                }`}
              >
                {f.dot ? <span className={`h-1.5 w-1.5 rounded-full ${f.dot}`} /> : null}
                {f.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Empty state */}
      {!coupons.length ? (
        <div className="mt-6 rounded-2xl border border-dashed border-studio-primary/20 bg-white p-8 text-center text-sm text-studio-ink/60">
          {q || statusFilter
            ? "No coupons match your filters."
            : "No coupons yet. Create your first one above."}
        </div>
      ) : null}

      {/* Coupon List */}
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {coupons.map((coupon) => {
          const createdDays = Math.floor(
            (Date.now() - new Date(coupon.createdAt).getTime()) / (1000 * 60 * 60 * 24),
          );
          return (
            <article
              key={coupon.id}
              className={`relative overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-md ${
                coupon.active ? "border-studio-primary/10" : "border-studio-ink/10 opacity-80"
              }`}
            >
              {/* Ticket-style notches */}
              <div className="absolute left-0 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-studio-light" />
              <div className="absolute right-0 top-1/2 h-4 w-4 translate-x-1/2 -translate-y-1/2 rounded-full bg-studio-light" />

              <div className="flex items-stretch">
                {/* Discount panel */}
                <div
                  className={`flex min-w-[100px] flex-col items-center justify-center border-r border-dashed p-4 ${
                    coupon.active
                      ? "border-studio-primary/20 bg-gradient-to-br from-studio-primary/10 to-studio-accent/10"
                      : "border-studio-ink/10 bg-studio-ink/5"
                  }`}
                >
                  <p
                    className={`text-3xl font-bold ${
                      coupon.active ? "text-studio-primary" : "text-studio-ink/50"
                    }`}
                  >
                    {coupon.discountPercent}%
                  </p>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-studio-ink/60">
                    OFF
                  </p>
                </div>

                {/* Details */}
                <div className="flex-1 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-mono text-base font-bold text-studio-primary">
                          {coupon.code}
                        </h3>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                            coupon.active
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-slate-200 bg-slate-50 text-slate-600"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              coupon.active ? "bg-emerald-500" : "bg-slate-400"
                            }`}
                          />
                          {coupon.active ? "Active" : "Paused"}
                        </span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs text-studio-ink/70">
                        {coupon.description || "No description provided."}
                      </p>
                      <p className="mt-1 text-[11px] text-studio-ink/50">
                        Created {createdDays === 0 ? "today" : `${createdDays}d ago`}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <form action={toggleCouponStatus}>
                      <input type="hidden" name="couponId" value={coupon.id} />
                      <input type="hidden" name="nextValue" value={String(!coupon.active)} />
                      <button
                        type="submit"
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                          coupon.active
                            ? "border border-amber-200 text-amber-700 hover:bg-amber-50"
                            : "border border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                        }`}
                      >
                        {coupon.active ? "Pause" : "Activate"}
                      </button>
                    </form>
                    <form action={deleteCoupon}>
                      <input type="hidden" name="couponId" value={coupon.id} />
                      <button
                        type="submit"
                        className="rounded-full border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </form>
                  </div>
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
              {(page - 1) * PAGE_SIZE + (coupons.length ? 1 : 0)}–
              {(page - 1) * PAGE_SIZE + coupons.length}
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
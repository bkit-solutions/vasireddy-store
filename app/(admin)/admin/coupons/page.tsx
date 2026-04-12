import Link from "next/link";
import { revalidatePath } from "next/cache";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { sendOfferAnnouncementEmail } from "@/lib/mailer";

const PAGE_SIZE = 8;

async function notifyCustomersAboutOffer(input: { subject: string; heading: string; message: string }) {
  try {
    const recipients = await prisma.user.findMany({
      where: { role: UserRole.CUSTOMER },
      select: { email: true },
    });

    const recipientEmails = recipients.map((user) => user.email).filter(Boolean);
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

async function createCoupon(formData: FormData) {
  "use server";

  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  const description = String(formData.get("description") ?? "").trim();
  const discountPercent = Number(formData.get("discountPercent") ?? 0);

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

  await notifyCustomersAboutOffer({
    subject: `New Offer: ${code}`,
    heading: "A new discount offer is live",
    message: `Use code ${code} to get ${Math.round(discountPercent)}% off on your next order. ${description || "Limited period offer."}`,
  });

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
    select: {
      code: true,
      discountPercent: true,
    },
  });

  await notifyCustomersAboutOffer({
    subject: nextValue ? `Offer Active Again: ${updatedCoupon.code}` : `Offer Update: ${updatedCoupon.code}`,
    heading: nextValue ? "Offer is active" : "Offer has been paused",
    message: nextValue
      ? `Coupon ${updatedCoupon.code} is now active with ${updatedCoupon.discountPercent}% off. Shop before it expires.`
      : `Coupon ${updatedCoupon.code} is currently inactive. Watch for upcoming promotions.`,
  });

  revalidatePath("/admin/coupons");
}

export default async function AdminCouponsPage({
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
          { code: { contains: q } },
          { description: { contains: q } },
        ],
      }
    : {};

  const coupons = await prisma.coupon.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });
  const totalCount = await prisma.coupon.count({ where });
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  function buildPageHref(targetPage: number) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (targetPage > 1) params.set("page", String(targetPage));
    const query = params.toString();
    return query ? `/admin/coupons?${query}` : "/admin/coupons";
  }

  return (
    <section className="py-2 sm:py-4">
      <h1 className="text-3xl font-semibold text-studio-primary sm:text-4xl">Coupons</h1>
      <p className="mt-3 text-studio-ink/75">Create discount campaigns for festive and wedding launches.</p>

      <form action="/admin/coupons" className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search by code or description"
          className="w-full rounded-xl border border-studio-primary/15 px-3 py-2 text-sm sm:max-w-md"
        />
        <button type="submit" className="rounded-full bg-studio-primary px-5 py-2 text-sm font-semibold text-white transition hover:bg-studio-accent">
          Search
        </button>
        {q ? (
          <Link href="/admin/coupons" className="rounded-full border border-studio-primary/20 px-4 py-2 text-xs font-semibold text-studio-primary">
            Clear
          </Link>
        ) : null}
      </form>

      <form action={createCoupon} className="mt-6 grid gap-3 rounded-2xl border border-studio-primary/10 bg-white p-4 shadow-[0_20px_40px_-30px_rgba(63,52,143,0.55)] sm:p-5 md:grid-cols-3">
        <input name="code" required placeholder="CODE" className="rounded-xl border border-studio-primary/15 px-3 py-2 text-sm" />
        <input
          name="discountPercent"
          type="number"
          required
          min="1"
          max="90"
          placeholder="Discount %"
          className="rounded-xl border border-studio-primary/15 px-3 py-2 text-sm"
        />
        <button type="submit" className="rounded-full bg-studio-primary px-5 py-2 text-sm font-semibold text-white transition hover:bg-studio-accent">
          Create Coupon
        </button>
        <input
          name="description"
          placeholder="Description (optional)"
          className="rounded-xl border border-studio-primary/15 px-3 py-2 text-sm md:col-span-3"
        />
      </form>

      {!coupons.length ? (
        <div className="mt-6 rounded-2xl border border-dashed border-studio-primary/20 bg-white p-6 text-sm text-studio-ink/70">
          No coupons found for the current filter.
        </div>
      ) : null}

      <div className="mt-6 space-y-3">
        {coupons.map((coupon) => (
          <article key={coupon.id} className="rounded-2xl border border-studio-primary/10 bg-white p-4 shadow-[0_16px_30px_-24px_rgba(63,52,143,0.55)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-studio-primary">{coupon.code}</h3>
                <p className="text-sm text-studio-ink/70">
                  {coupon.discountPercent}% off {coupon.description ? `· ${coupon.description}` : ""}
                </p>
              </div>
              <form action={toggleCouponStatus}>
                <input type="hidden" name="couponId" value={coupon.id} />
                <input type="hidden" name="nextValue" value={String(!coupon.active)} />
                <button
                  type="submit"
                  className={`rounded-full px-4 py-2 text-xs font-semibold ${
                    coupon.active ? "border border-red-200 text-red-700" : "border border-green-200 text-green-700"
                  }`}
                >
                  {coupon.active ? "Deactivate" : "Activate"}
                </button>
              </form>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-studio-primary/10 bg-white px-4 py-3 shadow-[0_16px_30px_-26px_rgba(63,52,143,0.45)]">
        <p className="text-sm text-studio-ink/70">
          Showing {(page - 1) * PAGE_SIZE + (coupons.length ? 1 : 0)}-{(page - 1) * PAGE_SIZE + coupons.length} of {totalCount}
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

export default function AdminBannersPage() {
  return (
    <section className="py-2 sm:py-4">
      <h1 className="text-3xl font-semibold text-studio-primary sm:text-4xl">Banner Management</h1>
      <p className="mt-3 text-studio-ink/75">Control homepage campaigns and featured collection highlights.</p>

      <div className="mt-6 rounded-2xl border border-studio-primary/10 bg-white p-6 shadow-[0_20px_38px_-30px_rgba(63,52,143,0.6)]">
        <p className="text-sm text-studio-ink/75">
          Banner workflows can be added here with scheduling, start and end dates, and campaign visibility controls.
        </p>
      </div>
    </section>
  );
}

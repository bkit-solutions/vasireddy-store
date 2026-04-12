import { AdminConsoleNav } from "@/components/layout/AdminConsoleNav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-transparent">
      <div className="mx-auto grid min-h-screen max-w-7xl grid-cols-1 gap-4 px-3 py-4 sm:px-4 sm:py-6 lg:grid-cols-[240px_1fr] lg:gap-6">
        <AdminConsoleNav />
        <div className="rounded-3xl border border-studio-primary/10 bg-white/90 p-4 shadow-[0_20px_42px_-26px_rgba(26,22,48,0.65)] backdrop-blur sm:p-5 md:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

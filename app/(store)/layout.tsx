import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { ToastProvider } from "@/components/ui/ToastProvider";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-transparent">
      <Header />
      <main className="flex-1 pb-4">{children}</main>
      <Footer />
      <ToastProvider />
      <WhatsAppButton />
    </div>
  );
}

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { AlertCircle, ArrowRight, UserCheck } from "lucide-react";

export async function ProfileGuard() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) return null;

  const addressCount = await prisma.address.count({
    where: { userId: session.user.id }
  });

  if (addressCount > 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 z-[100] w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 animate-reveal-up sm:bottom-10">
      <div className="overflow-hidden rounded-[2rem] border border-studio-accent/20 bg-white/90 p-1 shadow-[0_20px_50px_-20px_rgba(202,138,4,0.3)] backdrop-blur-xl">
        <div className="flex items-center gap-4 px-6 py-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-studio-accent text-white shadow-lg shadow-studio-accent/20">
            <UserCheck size={24} />
          </div>
          <div className="flex-1">
            <h4 className="font-serif text-lg font-bold text-studio-primary leading-tight">Complete Your Profile</h4>
            <p className="mt-0.5 text-xs text-studio-ink/60">Please add your delivery address to start shopping.</p>
          </div>
          <Link
            href="/account"
            className="group flex items-center gap-2 rounded-full bg-studio-primary px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-white transition hover:bg-studio-accent"
          >
            Add Address
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        <div className="h-1 w-full bg-studio-accent/10">
          <div className="h-full w-1/3 animate-guard-progress bg-studio-accent" />
        </div>
      </div>
    </div>
  );
}

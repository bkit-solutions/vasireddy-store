import { prisma } from "@/lib/prisma";
import { 
  Plus, 
  Trash2, 
  ExternalLink, 
  Eye, 
  EyeOff, 
  Image as ImageIcon,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { 
  createBanner, 
  updateBanner, 
  deleteBanner, 
  toggleBannerStatus 
} from "./actions";

export default async function AdminBannersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const banners = await prisma.banner.findMany({
    orderBy: { order: "asc" },
    take: 3
  });

  const resolvedSearchParams = await searchParams;
  const editingId = resolvedSearchParams.edit as string;
  const editingBanner = editingId ? banners.find(b => b.id === editingId) : null;

  // Ensure we always represent 3 slots
  const slots = [0, 1, 2].map(index => {
    const fallbacks = [
      { alt: "Bridal Lehenga", tag: "Bridal" },
      { alt: "Designer Saree", tag: "Festive" },
      { alt: "Anarkali Gown", tag: "Reception" }
    ];
    return banners.find(b => b.order === index) || { 
      id: `new-${index}`, 
      order: index, 
      imageUrl: "", 
      altText: fallbacks[index].alt, 
      tag: fallbacks[index].tag, 
      link: "",
      active: false 
    };
  });

  return (
    <div className="space-y-8 animate-reveal-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-studio-primary">Hero Banners</h1>
          <p className="text-studio-ink/60">Manage the 3 floating cards in your store&apos;s hero section.</p>
        </div>
      </div>

      {editingId && (
        <div className="rounded-3xl border border-studio-primary/10 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-studio-primary mb-6">
            {editingId.startsWith("new") ? `Setup Slot ${parseInt(editingId.split('-')[1]) + 1}` : "Edit Banner Card"}
          </h2>
          <form action={editingId.startsWith("new") ? createBanner : updateBanner} encType="multipart/form-data" className="space-y-6">
            {editingId.startsWith("new") ? (
              <input type="hidden" name="order" value={editingId.split('-')[1]} />
            ) : (
              <>
                <input type="hidden" name="id" value={editingId} />
                <input type="hidden" name="order" value={editingBanner?.order || 0} />
              </>
            )}
            
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-studio-ink/50">Upload New Image</label>
                <input
                  type="file"
                  name="imageFile"
                  accept="image/*"
                  className="w-full rounded-xl border border-studio-primary/10 px-4 py-2.5 text-sm outline-none focus:border-studio-accent file:mr-4 file:rounded-full file:border-0 file:bg-studio-light file:px-4 file:py-2 file:text-xs file:font-semibold file:text-studio-primary hover:file:bg-studio-primary/10"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-studio-ink/50">Or Image URL</label>
                <input
                  type="text"
                  name="imageUrl"
                  defaultValue={editingBanner?.imageUrl || ""}
                  placeholder="Paste image link here..."
                  className="w-full rounded-xl border border-studio-primary/10 px-4 py-2.5 text-sm outline-none focus:border-studio-accent"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-studio-ink/50">Card Title (Alt Text)</label>
                <input
                  type="text"
                  name="altText"
                  defaultValue={editingBanner?.altText || ""}
                  required
                  placeholder="e.g. Bridal Silk Saree"
                  className="w-full rounded-xl border border-studio-primary/10 px-4 py-2.5 text-sm outline-none focus:border-studio-accent"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-studio-ink/50">Category Tag</label>
                <input
                  type="text"
                  name="tag"
                  defaultValue={editingBanner?.tag || ""}
                  placeholder="e.g. Bridal, Festive, New"
                  className="w-full rounded-xl border border-studio-primary/10 px-4 py-2.5 text-sm outline-none focus:border-studio-accent"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-studio-ink/50">Click Link (Optional)</label>
                <input
                  type="text"
                  name="link"
                  defaultValue={editingBanner?.link || ""}
                  placeholder="/collections/sarees"
                  className="w-full rounded-xl border border-studio-primary/10 px-4 py-2.5 text-sm outline-none focus:border-studio-accent"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4">
              <button
                type="submit"
                className="rounded-full bg-studio-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-studio-accent"
              >
                {editingId.startsWith("new") ? "Initialize Slot" : "Save Changes"}
              </button>
              <Link
                href="/admin/banners"
                className="rounded-full border border-studio-primary/10 px-6 py-2.5 text-sm font-semibold text-studio-primary hover:bg-studio-light"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-3">
        {slots.map((slot) => (
          <div key={slot.id} className="group relative overflow-hidden rounded-3xl border border-studio-primary/10 bg-white shadow-sm transition hover:shadow-md">
            <div className="relative h-72 w-full">
              {slot.imageUrl ? (
                <Image
                  src={slot.imageUrl}
                  alt={slot.altText}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center bg-studio-light/50">
                  <ImageIcon className="text-studio-primary/20 mb-2" size={48} />
                  <p className="text-xs font-medium text-studio-ink/40 tracking-wider uppercase">Empty Slot {slot.order + 1}</p>
                </div>
              )}
              
              <div className="absolute left-3 top-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-studio-primary shadow-sm">
                  Slot {slot.order + 1}
                </span>
              </div>

              <div className="absolute right-3 top-3 flex gap-2">
                <Link
                  href={`/admin/banners?edit=${slot.id}`}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-studio-primary text-white shadow-lg transition hover:scale-110 hover:bg-studio-accent"
                >
                  <Plus className={slot.imageUrl ? "rotate-45" : ""} size={20} />
                </Link>
              </div>
            </div>
            
            <div className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-studio-accent">
                  {slot.tag || "No Tag"}
                </span>
                {slot.imageUrl && (
                  <form action={async () => { "use server"; await toggleBannerStatus(slot.id, slot.active); }}>
                    <button className={`text-[10px] font-bold uppercase tracking-widest ${slot.active ? 'text-green-600' : 'text-studio-ink/40'}`}>
                      {slot.active ? '● Active' : '○ Hidden'}
                    </button>
                  </form>
                )}
              </div>
              <h3 className="font-semibold text-studio-primary truncate">{slot.altText}</h3>
              {slot.link && (
                <p className="text-[10px] text-studio-ink/50 mt-1 truncate uppercase tracking-tighter">
                  Link: {slot.link}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

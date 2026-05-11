"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, MapPin, Trash2, Edit3, CheckCircle2, Phone, Home } from "lucide-react";
import { useRouter } from "next/navigation";

type Address = {
  id: string;
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
};

export function AddressManager({ initialAddresses }: { initialAddresses: Address[] }) {
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = editingId ? `/api/addresses/${editingId}` : "/api/addresses";
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Failed to save address");

      toast.success(editingId ? "Address updated!" : "Address added!");
      setIsAdding(false);
      setEditingId(null);
      setForm({ name: "", phone: "", street: "", city: "", state: "", pincode: "" });
      router.refresh();
      
      // Refresh local state (simple approach)
      const updated = await fetch("/api/addresses").then(r => r.json());
      setAddresses(updated);
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function deleteAddress(id: string) {
    if (!confirm("Are you sure you want to delete this address?")) return;

    try {
      const res = await fetch(`/api/addresses/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("Address deleted");
      setAddresses(addresses.filter(a => a.id !== id));
      router.refresh();
    } catch (err) {
      toast.error("Failed to delete address");
    }
  }

  async function setDefault(id: string) {
    try {
      const res = await fetch(`/api/addresses/${id}/default`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to set default");
      toast.success("Primary address updated");
      setAddresses(addresses.map(a => ({ ...a, isDefault: a.id === id })));
      router.refresh();
    } catch (err) {
      toast.error("Update failed");
    }
  }

  function startEdit(addr: Address) {
    setEditingId(addr.id);
    setForm({
      name: addr.name,
      phone: addr.phone,
      street: addr.street,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
    });
    setIsAdding(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-studio-primary/5 text-studio-primary">
            <Home size={20} />
          </div>
          <div>
            <h3 className="font-serif text-xl font-semibold text-studio-primary">Address Book</h3>
            <p className="text-xs text-studio-ink/50">Manage your delivery locations</p>
          </div>
        </div>
        {!isAdding && (
          <button
            onClick={() => {
              setIsAdding(true);
              setEditingId(null);
              setForm({ name: "", phone: "", street: "", city: "", state: "", pincode: "" });
            }}
            className="group flex items-center gap-2 rounded-full bg-studio-primary px-4 py-2 text-xs font-bold uppercase tracking-wider text-white transition-all hover:bg-studio-accent"
          >
            <Plus size={14} className="transition-transform group-hover:rotate-90" />
            Add New
          </button>
        )}
      </div>

      {isAdding ? (
        <form onSubmit={handleSubmit} className="animate-reveal-up rounded-3xl border border-studio-primary/10 bg-studio-light/10 p-6">
          <h4 className="mb-6 font-serif text-2xl font-bold text-studio-primary">
            {editingId ? "Update Delivery Location" : "New Address Entry"}
          </h4>
          <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-studio-accent ml-1">Full Name</label>
              <input
                required
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full border-b border-studio-primary/10 bg-transparent px-1 py-3 text-sm transition-all focus:border-studio-accent focus:outline-none placeholder:text-studio-ink/20"
                placeholder="Recipient's Name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-studio-accent ml-1">Contact Number</label>
              <input
                required
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                className="w-full border-b border-studio-primary/10 bg-transparent px-1 py-3 text-sm transition-all focus:border-studio-accent focus:outline-none placeholder:text-studio-ink/20"
                placeholder="+91"
              />
            </div>
            <div className="sm:col-span-2 space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-studio-accent ml-1">Street Address</label>
              <input
                required
                value={form.street}
                onChange={e => setForm({ ...form, street: e.target.value })}
                className="w-full border-b border-studio-primary/10 bg-transparent px-1 py-3 text-sm transition-all focus:border-studio-accent focus:outline-none placeholder:text-studio-ink/20"
                placeholder="Flat, House no., Building, Company, Apartment"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-studio-accent ml-1">City / Town</label>
              <input
                required
                value={form.city}
                onChange={e => setForm({ ...form, city: e.target.value })}
                className="w-full border-b border-studio-primary/10 bg-transparent px-1 py-3 text-sm transition-all focus:border-studio-accent focus:outline-none placeholder:text-studio-ink/20"
                placeholder="City"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-studio-accent ml-1">State</label>
                <input
                  required
                  value={form.state}
                  onChange={e => setForm({ ...form, state: e.target.value })}
                  className="w-full border-b border-studio-primary/10 bg-transparent px-1 py-3 text-sm transition-all focus:border-studio-accent focus:outline-none placeholder:text-studio-ink/20"
                  placeholder="State"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-studio-accent ml-1">Pincode</label>
                <input
                  required
                  value={form.pincode}
                  onChange={e => setForm({ ...form, pincode: e.target.value })}
                  className="w-full border-b border-studio-primary/10 bg-transparent px-1 py-3 text-sm transition-all focus:border-studio-accent focus:outline-none placeholder:text-studio-ink/20"
                  placeholder="6-digit"
                />
              </div>
            </div>
          </div>
          <div className="mt-10 flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-studio-primary px-10 py-3.5 text-[11px] font-bold uppercase tracking-[0.2em] text-white shadow-xl shadow-studio-primary/20 transition-all hover:-translate-y-0.5 hover:bg-studio-accent active:translate-y-0 disabled:opacity-50"
            >
              {loading ? "Processing..." : editingId ? "Update Address" : "Save Address"}
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="rounded-full border border-studio-primary/10 px-8 py-3.5 text-[11px] font-bold uppercase tracking-[0.2em] text-studio-primary transition hover:bg-white"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`group relative overflow-hidden rounded-[2rem] border p-7 transition-all hover:shadow-[0_30px_60px_-25px_rgba(32,29,26,0.15)] ${
                addr.isDefault 
                  ? "border-studio-accent bg-[linear-gradient(135deg,#ffffff_0%,#fbf8f2_100%)] ring-1 ring-studio-accent/20" 
                  : "border-studio-primary/10 bg-white"
              }`}
            >
              {addr.isDefault && (
                <div className="absolute right-0 top-0 rounded-bl-2xl bg-studio-accent px-4 py-1.5 text-[9px] font-bold uppercase tracking-widest text-white shadow-sm">
                  Primary
                </div>
              )}

              <div className="flex items-center gap-3 mb-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${addr.isDefault ? "bg-studio-accent text-white" : "bg-studio-primary/5 text-studio-primary"}`}>
                   <MapPin size={18} strokeWidth={1.5} />
                </div>
                <h5 className="font-serif text-lg font-bold text-studio-primary">{addr.name}</h5>
              </div>

              <div className="space-y-1.5 text-[13px] leading-relaxed text-studio-ink/70">
                <p className="max-w-[200px]">{addr.street}</p>
                <p>{addr.city}, {addr.state} - {addr.pincode}</p>
                <p className="mt-3 flex items-center gap-2 font-bold text-studio-primary tracking-wide">
                  <span className="text-studio-accent text-lg">☏</span>
                  {addr.phone}
                </p>
              </div>

              <div className="mt-8 flex items-center gap-5 border-t border-studio-primary/5 pt-5">
                <button
                  onClick={() => startEdit(addr)}
                  className="group/btn flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-studio-ink/40 transition hover:text-studio-primary"
                >
                  <Edit3 size={12} className="transition-transform group-hover/btn:-rotate-12" />
                  Edit
                </button>
                <button
                  onClick={() => deleteAddress(addr.id)}
                  className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-studio-ink/40 transition hover:text-rose-500"
                >
                  <Trash2 size={12} />
                  Remove
                </button>
                {!addr.isDefault && (
                  <button
                    onClick={() => setDefault(addr.id)}
                    className="ml-auto text-[10px] font-bold uppercase tracking-[0.15em] text-studio-accent underline decoration-studio-accent/20 underline-offset-8 transition hover:decoration-studio-accent"
                  >
                    Use as Primary
                  </button>
                )}
              </div>
            </div>
          ))}

          {addresses.length === 0 && (
            <div className="flex h-40 flex-col items-center justify-center rounded-3xl border border-dashed border-studio-primary/20 bg-studio-light/10 text-center sm:col-span-2">
              <p className="text-sm font-semibold text-studio-ink/40 uppercase tracking-widest">No addresses saved yet</p>
              <button 
                onClick={() => setIsAdding(true)}
                className="mt-3 text-xs font-bold text-studio-accent underline underline-offset-4"
              >
                Add your first delivery address
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

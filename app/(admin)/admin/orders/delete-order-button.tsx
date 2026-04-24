"use client";

import { useTransition } from "react";

export function DeleteOrderButton({
  orderId,
  onDelete,
}: {
  orderId: string;
  onDelete: (formData: FormData) => Promise<void>;
}) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this order? This action cannot be undone. All associated order items will also be deleted."
      )
    ) {
      return;
    }

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.set("orderId", orderId);
        await onDelete(formData);
      } catch (error) {
        console.error("Failed to delete order:", error);
        alert("Failed to delete order. Please try again.");
      }
    });
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="rounded-full border border-rose-300 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isPending ? "Deleting..." : "Delete"}
    </button>
  );
}

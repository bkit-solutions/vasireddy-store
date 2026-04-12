"use client";

import { Toaster } from "sonner";

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        style: {
          borderRadius: "14px",
          border: "1px solid rgba(32, 29, 26, 0.14)",
        },
      }}
    />
  );
}

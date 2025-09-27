"use client";

// Minimal toast utility wired to Toaster via a custom event.

export type ToastVariant = "default" | "destructive";

export type ToastOptions = {
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number; // ms
};

export function useToast() {
  function toast({ title, description, variant }: ToastOptions) {
    if (typeof window !== "undefined") {
        const ev = new CustomEvent("app:toast", { detail: { title, description, variant } });
        window.dispatchEvent(ev as any);
    }
  }

  return { toast };
}

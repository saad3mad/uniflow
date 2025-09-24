"use client";

// Minimal toast utility to satisfy imports and provide basic UX.
// You can replace this later with a full-featured toast system (e.g., sonner or shadcn/ui toast).

export type ToastVariant = "default" | "destructive";

export type ToastOptions = {
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number; // ms
};

export function useToast() {
  function toast({ title, description, variant }: ToastOptions) {
    const prefix = variant === "destructive" ? "[Error] " : "";
    if (typeof window !== "undefined") {
      // Very basic fallback; replace with a real toast UI if desired.
      window.console[(variant === "destructive" ? "error" : "log")](`${prefix}${title ?? ""} ${description ?? ""}`.trim());
    }
  }

  return { toast };
}

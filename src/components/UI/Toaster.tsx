"use client";

import { useEffect, useState } from "react";

export type ToastVariant = "default" | "destructive";
export type ToastMsg = {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number; // ms
};

export default function Toaster() {
  const [toasts, setToasts] = useState<ToastMsg[]>([]);

  useEffect(() => {
    function onToast(e: Event) {
      const detail = (e as CustomEvent).detail as Omit<ToastMsg, "id">;
      const id = Math.random().toString(36).slice(2);
      const msg: ToastMsg = { id, duration: 3500, ...detail };
      setToasts((prev) => [...prev, msg]);
      // auto dismiss
      const duration = msg.duration ?? 3500;
      if (duration > 0) {
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
        }, duration);
      }
    }
    window.addEventListener("app:toast" as any, onToast);
    return () => window.removeEventListener("app:toast" as any, onToast);
  }, []);

  function dismiss(id: string) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-[320px] max-w-[90vw]">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`rounded-lg border p-3 shadow-lg backdrop-blur bg-background/90 ${
            t.variant === "destructive" ? "border-red-500/40" : "border-border"
          }`}
          role="status"
          aria-live="polite"
        >
          <div className="flex items-start gap-3">
            <div className={`mt-1 h-2 w-2 rounded-full ${t.variant === "destructive" ? "bg-red-500" : "bg-emerald-500"}`} />
            <div className="flex-1 min-w-0">
              {t.title && <div className="font-medium truncate">{t.title}</div>}
              {t.description && <div className="text-sm text-text-secondary break-words">{t.description}</div>}
            </div>
            <button
              aria-label="Dismiss notification"
              onClick={() => dismiss(t.id)}
              className="ml-2 text-text-secondary hover:text-text-primary"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

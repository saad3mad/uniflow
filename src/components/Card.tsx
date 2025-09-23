import { ReactNode } from "react";

export default function Card({ className = "", children }: { className?: string; children: ReactNode }) {
  return (
    <div className={`card hover-lift ${className}`}>
      {children}
    </div>
  );
}

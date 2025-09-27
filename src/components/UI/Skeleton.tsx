"use client";

import React from "react";

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-background-tertiary ${className}`} />;
}

export function SkeletonText({ lines = 1, className = "" }: { lines?: number; className?: string }) {
  return (
    <div className={className}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={`animate-pulse rounded bg-background-tertiary h-4 ${i < lines - 1 ? "mb-2" : ""}`} />)
      )}
    </div>
  );
}

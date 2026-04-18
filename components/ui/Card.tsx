"use client";

import { cn } from "@/lib/cn";
import type { HTMLAttributes, ReactNode } from "react";

export function Card({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-slate-200/80 bg-white/90 p-4 shadow-card backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

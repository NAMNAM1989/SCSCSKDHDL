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
        "rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900/80",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

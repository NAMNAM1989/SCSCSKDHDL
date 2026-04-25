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
        "rounded-2xl border border-zinc-200/90 bg-white p-4 shadow-sm dark:border-zinc-800/90 dark:bg-zinc-900/50",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

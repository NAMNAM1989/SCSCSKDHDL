"use client";

import { cn } from "@/lib/cn";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const variants: Record<Variant, string> = {
  primary:
    "bg-brand-600 text-white shadow-sm hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600",
  secondary:
    "bg-white text-slate-800 shadow-card border border-slate-200/80 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700 dark:hover:bg-slate-800/80",
  ghost:
    "bg-transparent text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800",
  danger:
    "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 dark:bg-red-950/50 dark:text-red-300 dark:border-red-900",
};

export function Button({
  className,
  variant = "secondary",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-2xl px-4 text-[15px] font-medium transition-[transform,colors] duration-150 ease-out active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950 disabled:opacity-50",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

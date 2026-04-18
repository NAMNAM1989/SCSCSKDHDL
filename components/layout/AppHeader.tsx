"use client";

import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

export function AppHeader({
  title,
  subtitle,
  right,
  className,
  /** Bảng / màn hình cần dùng hết chiều ngang trên desktop (sidebar + không max-w-6xl) */
  fullWidth = false,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  className?: string;
  fullWidth?: boolean;
}) {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900",
        className
      )}
    >
      <div
        className={cn(
          "mx-auto flex w-full items-center justify-between gap-3 px-4 py-3 pt-[max(env(safe-area-inset-top),0.75rem)] lg:py-2.5",
          fullWidth
            ? "max-w-md lg:mx-0 lg:max-w-none lg:px-6"
            : "max-w-md lg:max-w-6xl lg:px-6"
        )}
      >
        <div>
          <h1 className="text-base font-semibold text-slate-900 dark:text-slate-100 lg:text-[15px]">
            {title}
            {subtitle ? (
              <span className="font-normal text-slate-500 dark:text-slate-400">
                {" "}
                · {subtitle}
              </span>
            ) : null}
          </h1>
        </div>
        {right ? <div className="shrink-0">{right}</div> : null}
      </div>
    </header>
  );
}

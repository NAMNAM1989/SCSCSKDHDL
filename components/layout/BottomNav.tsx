"use client";

import { cn } from "@/lib/cn";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MAIN_NAV, isNavActive } from "./navConfig";

/** Tab bar dưới cùng — chỉ mobile (ẩn từ lg) */
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2 dark:border-slate-800 dark:bg-slate-900 lg:hidden"
      aria-label="Điều hướng chính"
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-2">
        {MAIN_NAV.map(({ href, label, Icon }) => {
          const active = isNavActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              className="flex min-h-[48px] flex-1 flex-col items-center justify-center gap-0.5 py-1"
            >
              <span
                className={cn(
                  "flex h-10 w-12 items-center justify-center rounded border text-slate-500 transition-colors dark:text-slate-400",
                  active
                    ? "border-slate-300 bg-slate-100 text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                    : "border-transparent"
                )}
              >
                <Icon className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <span
                className={cn(
                  "text-[10px] font-medium",
                  active ? "text-slate-900 dark:text-slate-100" : "text-slate-500"
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

"use client";

import { cn } from "@/lib/cn";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MAIN_NAV, isNavActive } from "./navConfig";

/** Thanh điều hướng trái — chỉ hiện từ breakpoint lg (desktop / tablet ngang) */
export function DesktopSidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:flex lg:w-60 lg:flex-col lg:border-r lg:border-slate-200/80 lg:bg-white/90 lg:backdrop-blur-xl dark:lg:border-slate-800 dark:lg:bg-slate-950/90"
      aria-label="Điều hướng desktop"
    >
      <div className="border-b border-slate-200/70 px-5 py-6 dark:border-slate-800">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
          SCSC / OPS / EXP
        </p>
        <p className="mt-1 text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
          Flight Schedule
        </p>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {MAIN_NAV.map(({ href, label, Icon }) => {
          const active = isNavActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-[15px] font-medium transition-colors",
                active
                  ? "bg-brand-100 text-brand-800 dark:bg-brand-950/80 dark:text-brand-200"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/80"
              )}
            >
              <Icon
                className="h-5 w-5 shrink-0"
                strokeWidth={active ? 2.25 : 1.75}
              />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

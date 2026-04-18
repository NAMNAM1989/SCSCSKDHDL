"use client";

import { cn } from "@/lib/cn";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MAIN_NAV, isNavActive } from "./navConfig";

/** Sidebar trái — chỉ từ lg (desktop / tablet ngang) */
export function DesktopSidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="hidden border-r border-slate-200/90 bg-white dark:border-slate-800 dark:bg-slate-900 lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:w-56 lg:flex-col lg:shadow-sm"
      aria-label="Điều hướng"
    >
      <div className="border-b border-slate-200 px-4 py-4 dark:border-slate-800">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          SCSC · OPS · EXP
        </p>
        <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
          Cut-off SCSC
        </p>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 p-2">
        {MAIN_NAV.map(({ href, label, Icon }) => {
          const active = isNavActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors md:py-2",
                active
                  ? "bg-brand-100 font-medium text-brand-900 dark:bg-brand-950/60 dark:text-brand-200"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/80"
              )}
            >
              <Icon className="h-5 w-5 shrink-0 opacity-90" strokeWidth={1.75} />
              {label}
            </Link>
          );
        })}
      </nav>
      <p className="border-t border-slate-200 px-3 py-3 text-[11px] leading-snug text-slate-500 dark:border-slate-800 dark:text-slate-500">
        Dữ liệu lưu cục bộ trình duyệt.
      </p>
    </aside>
  );
}

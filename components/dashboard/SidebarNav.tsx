"use client";

import { MAIN_NAV, isNavActive } from "@/components/layout/navConfig";
import { cn } from "@/lib/cn";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function SidebarNav({
  collapsed,
  onNavigate,
}: {
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-1 flex-col gap-0.5 p-2" aria-label="Chính">
      {MAIN_NAV.map(({ href, label, Icon }) => {
        const active = isNavActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            title={collapsed ? label : undefined}
            className={cn(
              "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              collapsed && "justify-center gap-0 px-2",
              active
                ? "bg-brand-500/10 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300"
                : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/80 dark:hover:text-zinc-100"
            )}
          >
            <span
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors",
                active
                  ? "border-brand-500/30 bg-brand-500/10 text-brand-700 dark:text-brand-300"
                  : "border-transparent bg-zinc-100/80 text-zinc-500 group-hover:bg-white group-hover:text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:group-hover:bg-zinc-700"
              )}
            >
              <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
            </span>
            {!collapsed ? (
              <span className="truncate">{label}</span>
            ) : null}
            {active && !collapsed ? (
              <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500" />
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}

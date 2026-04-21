"use client";

import { useDashboardShell } from "@/components/dashboard/dashboard-shell-context";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, Menu, Moon, Search, Sun, X } from "lucide-react";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const titles: Record<string, { title: string; desc?: string }> = {
  "/": { title: "Schedule", desc: "Cut-off SCSC · OPS · EXP" },
  "/search": { title: "Search", desc: "Tìm nhanh chuyến" },
  "/activity": { title: "Activity", desc: "Hướng dẫn & mẹo" },
  "/profile": { title: "Settings", desc: "Giao diện & đồng bộ" },
};

export function AppTopbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { mobileNavOpen, toggleMobileNav } = useDashboardShell();
  /** Tránh lệch Sun/Moon giữa SSR và client (next-themes chỉ biết theme sau khi mount). */
  const [themeReady, setThemeReady] = useState(false);
  useEffect(() => {
    setThemeReady(true);
  }, []);

  const meta = useMemo(() => {
    const p = pathname.replace(/\/$/, "") || "/";
    return titles[p] ?? { title: "Dashboard", desc: "" };
  }, [pathname]);

  return (
    <header className="sticky top-0 z-30 flex h-12 shrink-0 items-center gap-2 border-b border-zinc-200/80 bg-white/90 px-2.5 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/90 sm:h-14 sm:gap-3 sm:px-4 lg:px-6">
      <button
        type="button"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-200/80 bg-white text-zinc-700 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 sm:h-10 sm:w-10 sm:rounded-xl lg:hidden"
        aria-label="Mở menu"
        aria-expanded={mobileNavOpen}
        onClick={toggleMobileNav}
      >
        <AnimatePresence mode="wait" initial={false}>
          {mobileNavOpen ? (
            <motion.span
              key="x"
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 90 }}
            >
              <X className="h-5 w-5" />
            </motion.span>
          ) : (
            <motion.span
              key="menu"
              initial={{ opacity: 0, rotate: 90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: -90 }}
            >
              <Menu className="h-5 w-5" />
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <div className="min-w-0 flex-1 lg:flex lg:items-center lg:gap-6">
        <div className="min-w-0 lg:max-w-xs">
          <h1 className="truncate text-[15px] font-semibold leading-tight tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-base sm:leading-normal md:text-lg">
            {meta.title}
          </h1>
          {meta.desc ? (
            <p className="hidden truncate text-[11px] text-zinc-500 dark:text-zinc-400 sm:block sm:text-xs">
              {meta.desc}
            </p>
          ) : null}
        </div>

        <div className="relative mt-0 hidden min-w-0 flex-1 max-w-md lg:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="search"
            readOnly
            placeholder="Tìm trong workspace… (sắp có)"
            className="h-10 w-full rounded-xl border border-zinc-200/90 bg-zinc-50/80 pl-10 pr-4 text-sm text-zinc-800 placeholder:text-zinc-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-100 dark:placeholder:text-zinc-500"
            aria-label="Tìm kiếm"
          />
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-0.5 sm:gap-2">
        <button
          type="button"
          className={cn(
            "relative hidden h-9 w-9 items-center justify-center rounded-lg border border-transparent text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-800 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 sm:flex sm:h-10 sm:w-10 sm:rounded-xl"
          )}
          aria-label="Thông báo"
        >
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-violet-500 ring-2 ring-white dark:ring-zinc-950" />
        </button>
        <Button
          variant="ghost"
          className="!h-9 !min-h-9 !min-w-9 !rounded-lg !px-0 sm:!h-10 sm:!min-h-10 sm:!min-w-10 sm:!rounded-xl"
          aria-label="Chế độ sáng / tối"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {!themeReady ? (
            <Moon className="h-[18px] w-[18px] text-zinc-400" aria-hidden />
          ) : theme === "dark" ? (
            <Sun className="h-[18px] w-[18px]" />
          ) : (
            <Moon className="h-[18px] w-[18px]" />
          )}
        </Button>
        <div
          className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-gradient-to-br from-zinc-100 to-zinc-200 text-xs font-semibold text-zinc-600 dark:border-zinc-700 dark:from-zinc-800 dark:to-zinc-900 dark:text-zinc-300 sm:flex"
          aria-hidden
        >
          SC
        </div>
      </div>
    </header>
  );
}

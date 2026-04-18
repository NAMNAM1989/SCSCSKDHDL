"use client";

import { SidebarNav } from "@/components/dashboard/SidebarNav";
import { useDashboardShell } from "@/components/dashboard/dashboard-shell-context";
import { cn } from "@/lib/cn";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

export function AppSidebar() {
  const { sidebarCollapsed, setSidebarCollapsed } = useDashboardShell();

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarCollapsed ? 72 : 256 }}
      transition={{ type: "spring", stiffness: 380, damping: 38 }}
      className={cn(
        "relative z-20 hidden h-dvh shrink-0 flex-col border-r border-zinc-200/80 bg-white/95 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/95 lg:flex"
      )}
    >
      <div className="flex h-14 items-center border-b border-zinc-100 px-3 dark:border-zinc-800/80">
        <Link
          href="/"
          className={cn(
            "flex min-w-0 items-center gap-2 rounded-lg px-1.5 py-1 transition-opacity hover:opacity-90",
            sidebarCollapsed && "justify-center"
          )}
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-violet-600 text-xs font-bold text-white shadow-sm shadow-brand-500/25">
            C
          </span>
          {!sidebarCollapsed ? (
            <span className="truncate text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Cutoff{" "}
              <span className="font-normal text-zinc-500 dark:text-zinc-400">
                SCSC
              </span>
            </span>
          ) : null}
        </Link>
      </div>

      <SidebarNav collapsed={sidebarCollapsed} />

      <div className="mt-auto border-t border-zinc-100 p-2 dark:border-zinc-800/80">
        <button
          type="button"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="flex w-full items-center justify-center gap-2 rounded-xl py-2 text-xs font-medium text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          aria-label={sidebarCollapsed ? "Mở sidebar" : "Thu sidebar"}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span>Thu gọn</span>
            </>
          )}
        </button>
        {!sidebarCollapsed ? (
          <p className="px-2 pb-1 pt-2 text-[10px] leading-snug text-zinc-400 dark:text-zinc-500">
            Dữ liệu lưu cục bộ. Đồng bộ cloud tùy cấu hình.
          </p>
        ) : null}
      </div>
    </motion.aside>
  );
}

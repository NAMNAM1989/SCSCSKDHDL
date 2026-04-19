"use client";

import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { AppTopbar } from "@/components/dashboard/AppTopbar";
import { DashboardShellProvider } from "@/components/dashboard/dashboard-shell-context";
import { MobileDrawer } from "@/components/dashboard/MobileDrawer";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

function DashboardContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const p = pathname.replace(/\/$/, "") || "/";
  /** Schedule / Search: bảng dùng full chiều ngang cột nội dung (không cap 1600px) */
  const wideDataPage = p === "/" || p === "/search";

  return (
    <div className="flex min-h-dvh w-full max-w-full flex-col overflow-x-hidden bg-zinc-50 dark:bg-zinc-950">
      <div className="flex min-h-0 min-w-0 flex-1">
        <AppSidebar />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <AppTopbar />
          <motion.main
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden"
          >
            <div
              className={
                wideDataPage
                  ? "w-full max-w-none px-2.5 py-3 sm:px-3 sm:py-4 md:px-4 lg:px-5 xl:px-6 2xl:px-8 lg:py-6"
                  : "mx-auto w-full max-w-[1600px] px-3 py-4 sm:px-5 sm:py-5 lg:px-8 lg:py-6"
              }
            >
              {children}
            </div>
          </motion.main>
        </div>
      </div>
      <MobileDrawer />
    </div>
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShellProvider>
      <DashboardContent>{children}</DashboardContent>
    </DashboardShellProvider>
  );
}

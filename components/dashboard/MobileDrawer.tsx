"use client";

import { SidebarNav } from "@/components/dashboard/SidebarNav";
import { useDashboardShell } from "@/components/dashboard/dashboard-shell-context";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

export function MobileDrawer() {
  const { mobileNavOpen, setMobileNavOpen } = useDashboardShell();

  return (
    <AnimatePresence>
      {mobileNavOpen ? (
        <>
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-label="Đóng menu"
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] lg:hidden"
            onClick={() => setMobileNavOpen(false)}
          />
          <motion.aside
            initial={{ x: "-104%" }}
            animate={{ x: 0 }}
            exit={{ x: "-104%" }}
            transition={{ type: "spring", damping: 32, stiffness: 360 }}
            className="fixed inset-y-0 left-0 z-50 flex w-[min(18rem,92vw)] flex-col border-r border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950 lg:hidden"
          >
            <div className="flex h-14 items-center border-b border-zinc-100 px-4 dark:border-zinc-800/80">
              <Link
                href="/"
                className="flex min-w-0 items-center gap-2"
                onClick={() => setMobileNavOpen(false)}
              >
                <Image
                  src="/logo-scsc.png"
                  alt="SCSC"
                  width={200}
                  height={48}
                  priority
                  className="h-9 w-auto max-w-[min(100%,12rem)] shrink-0 object-contain object-left dark:brightness-[0.98]"
                />
                <span className="min-w-0 text-xs font-medium leading-snug text-zinc-500 dark:text-zinc-400">
                  Export Flight Schedule & Handling
                </span>
              </Link>
            </div>
            <SidebarNav onNavigate={() => setMobileNavOpen(false)} />
            <p className="mt-auto border-t border-zinc-100 p-4 text-[11px] leading-relaxed text-zinc-400 dark:border-zinc-800 dark:text-zinc-500">
              Flight schedule & handling — internal ops.
            </p>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}

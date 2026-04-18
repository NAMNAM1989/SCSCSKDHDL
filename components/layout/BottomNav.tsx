"use client";

import { cn } from "@/lib/cn";
import { motion } from "framer-motion";
import { Activity, Home, Search, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "Home", Icon: Home },
  { href: "/search/", label: "Search", Icon: Search },
  { href: "/activity/", label: "Activity", Icon: Activity },
  { href: "/profile/", label: "Profile", Icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200/80 bg-white/85 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/85"
      aria-label="Điều hướng chính"
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-2">
        {items.map(({ href, label, Icon }) => {
          const active =
            href === "/"
              ? pathname === "/" || pathname === ""
              : pathname.startsWith(href.replace(/\/$/, ""));
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-1 flex-col items-center gap-1 py-1"
            >
              <motion.span
                className={cn(
                  "flex h-11 w-14 items-center justify-center rounded-2xl transition-colors",
                  active
                    ? "bg-brand-100 text-brand-700 dark:bg-brand-950/80 dark:text-brand-300"
                    : "text-slate-500 dark:text-slate-400"
                )}
                whileTap={{ scale: 0.92 }}
              >
                <Icon className="h-6 w-6" strokeWidth={active ? 2.25 : 1.75} />
              </motion.span>
              <span
                className={cn(
                  "text-[11px] font-medium",
                  active ? "text-brand-700 dark:text-brand-300" : "text-slate-500"
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

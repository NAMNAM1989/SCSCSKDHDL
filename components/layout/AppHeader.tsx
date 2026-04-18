"use client";

import { cn } from "@/lib/cn";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

export function AppHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/75"
      )}
    >
      <div className="mx-auto flex max-w-2xl items-start justify-between gap-3 px-4 pb-3 pt-[max(env(safe-area-inset-top),0.75rem)]">
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-0.5 text-[15px] text-slate-500 dark:text-slate-400">
              {subtitle}
            </p>
          ) : null}
        </motion.div>
        {right ? <div className="shrink-0 pt-0.5">{right}</div> : null}
      </div>
    </header>
  );
}

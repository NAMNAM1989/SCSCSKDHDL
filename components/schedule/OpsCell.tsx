"use client";

import type { OpsKey, ScheduleRow } from "@/lib/schedule/types";
import { cn } from "@/lib/cn";
import { Check } from "lucide-react";

export function OpsCell({
  row,
  day,
  onToggle,
  onText,
}: {
  row: ScheduleRow;
  day: OpsKey;
  onToggle: () => void;
  onText: (v: string) => void;
}) {
  const v = row.ops[day] ?? "";
  const textMode = v && v !== "X" && v !== "x";
  if (textMode) {
    return (
      <input
        className="box-border w-full min-w-0 max-w-full rounded border border-amber-600/60 bg-slate-800 px-0.5 py-0.5 text-center text-[10px] text-amber-50 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-500/40 lg:px-1 lg:py-1 lg:text-xs xl:text-sm xl:py-1.5"
        value={v}
        onChange={(e) => onText(e.target.value)}
      />
    );
  }
  const on = v === "X" || v === "x";
  return (
    <button
      type="button"
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-md border text-[10px] font-semibold transition-colors lg:h-7 lg:w-7 xl:h-8 xl:w-8",
        on
          ? "border-emerald-500 bg-emerald-500/90 text-white shadow-sm dark:border-emerald-400 dark:bg-emerald-600 dark:text-white"
          : "border-slate-300 bg-slate-100 text-slate-400 hover:border-slate-400 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-600"
      )}
      onClick={(e) => {
        if (e.shiftKey) {
          onText(" ");
          return;
        }
        onToggle();
      }}
      onDoubleClick={(e) => {
        e.preventDefault();
        onText(" ");
      }}
    >
      {on ? (
        <Check className="h-3.5 w-3.5 text-white lg:h-3.5 lg:w-3.5 xl:h-4 xl:w-4" strokeWidth={3} aria-hidden />
      ) : (
        <span className="text-[11px] font-light text-slate-400 dark:text-slate-500">
          —
        </span>
      )}
    </button>
  );
}

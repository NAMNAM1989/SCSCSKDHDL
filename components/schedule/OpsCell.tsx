"use client";

import type { OpsKey, ScheduleRow } from "@/lib/schedule/types";
import { cn } from "@/lib/cn";
import { Check } from "lucide-react";

export function OpsCell({
  row,
  day,
  onToggle,
  onText,
  compact,
  readOnly,
  dense,
}: {
  row: ScheduleRow;
  day: OpsKey;
  onToggle: () => void;
  onText: (v: string) => void;
  /** Thẻ mobile — nút nhỏ hơn để 7 cột vừa màn */
  compact?: boolean;
  /** Chỉ hiển thị (bảng desktop khi sửa qua bảng STD) */
  readOnly?: boolean;
  /** Thẻ mobile card — ô 24px, T2–CN sát nhau hơn */
  dense?: boolean;
}) {
  const v = row.ops[day] ?? "";
  const textMode = v && v !== "X" && v !== "x";

  const winter = row.season === "winter";
  const seasonText = winter
    ? "text-sky-100/95"
    : "text-red-100/95";
  const seasonOffBox = winter
    ? "border-sky-500/45 bg-sky-950/40 text-sky-400/90"
    : "border-red-500/45 bg-red-950/40 text-red-300/80";

  if (readOnly) {
    if (textMode) {
      return (
        <span
          className={cn(
            "block max-w-full truncate text-center font-medium",
            seasonText,
            dense ? "text-[8px] leading-tight" : compact ? "text-[9px]" : "text-[10px] lg:text-xs xl:text-sm"
          )}
          title={v}
        >
          {v}
        </span>
      );
    }
    const on = v === "X" || v === "x";
    return (
      <span
        className={cn(
          "inline-flex items-center justify-center rounded border text-[10px] font-semibold",
          compact && dense
            ? "h-6 w-6 min-h-[24px] min-w-[24px] rounded-sm text-[9px]"
            : compact
            ? "h-7 w-7 min-h-[28px] min-w-[28px]"
            : "h-9 w-9 lg:h-7 lg:w-7 xl:h-8 xl:w-8",
          on
            ? "border-emerald-500/80 bg-emerald-500/25 text-emerald-100"
            : seasonOffBox
        )}
      >
        {on ? (
          <Check
            className={cn(
              "text-emerald-200",
              compact && dense ? "h-2.5 w-2.5" : compact ? "h-3 w-3" : "h-3.5 w-3.5"
            )}
            strokeWidth={3}
            aria-hidden
          />
        ) : (
          <span
            className={cn(
              "font-light",
              winter ? "text-sky-500/80" : "text-red-400/75"
            )}
          >
            —
          </span>
        )}
      </span>
    );
  }

  if (textMode) {
    return (
      <input
        className={cn(
          "box-border w-full min-w-0 max-w-full rounded border border-amber-600/60 bg-slate-800 text-center text-amber-50 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-500/40",
          compact
            ? "px-0 py-0.5 text-[9px]"
            : "px-0.5 py-0.5 text-[10px] lg:px-1 lg:py-1 lg:text-xs xl:text-sm xl:py-1.5"
        )}
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
        "flex shrink-0 items-center justify-center rounded-md border text-[10px] font-semibold transition-colors",
        compact
          ? "h-7 w-7 min-h-[28px] min-w-[28px]"
          : "h-9 w-9 lg:h-7 lg:w-7 xl:h-8 xl:w-8",
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
        <Check
          className={cn(
            "text-white",
            compact ? "h-3 w-3" : "h-3.5 w-3.5 lg:h-3.5 lg:w-3.5 xl:h-4 xl:w-4"
          )}
          strokeWidth={3}
          aria-hidden
        />
      ) : (
        <span
          className={cn(
            "font-light text-slate-400 dark:text-slate-500",
            compact ? "text-[9px]" : "text-[11px]"
          )}
        >
          —
        </span>
      )}
    </button>
  );
}

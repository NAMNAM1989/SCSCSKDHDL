import type { ScheduleRow } from "@/lib/schedule/types";
import { cn } from "@/lib/cn";

export function isWinterRow(row: ScheduleRow): boolean {
  return row.season === "winter";
}

/** Không gắn text-* — dùng kèm text-sm / text-base tùy ô. */
export const timeMonoFont = "font-mono tabular-nums leading-snug";

export const timeMono = `${timeMonoFont} text-sm`;

/** Viền trái mùa trên ô đầu (ổn định với border-collapse). */
export function firstColSeasonBorder(row: ScheduleRow) {
  return isWinterRow(row)
    ? "border-l-2 border-sky-400"
    : "border-l-2 border-amber-400";
}

/** Gạch ngang dòng; hover/nền chọn ở từng <td>. */
export const trRowClass = "group/row border-b border-slate-800/80";

export function seasonBadgeClass(row: ScheduleRow) {
  return isWinterRow(row)
    ? "bg-sky-500/10 text-sky-300/90"
    : "bg-amber-500/10 text-amber-300/90";
}

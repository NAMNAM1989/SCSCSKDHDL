import type { ScheduleRow, ScheduleSeason } from "./types";

export const DEFAULT_SEASON: ScheduleSeason = "summer";

export function normalizeSeason(raw: unknown): ScheduleSeason {
  if (raw === "winter" || raw === "summer") return raw;
  return DEFAULT_SEASON;
}

/** Màu chữ theo mùa (bảng in PDF / HTML) — hè đỏ, đông xanh. */
export function printTextColorForSeason(row: ScheduleRow): string {
  if (row.season === "winter") return "#1d4ed8";
  return "#b91c1c";
}

/** Viền trái + nền dòng bảng lịch (desktop). */
export function scheduleTableRowTrClass(row: ScheduleRow): string {
  if (row.season === "winter") {
    return [
      "border-b border-slate-700/90 border-l-4 border-l-sky-500/85",
      "odd:bg-slate-900/65 even:bg-slate-950/75 hover:bg-slate-800/75",
      "dark:border-slate-800 dark:odd:bg-slate-900/70 dark:even:bg-slate-950/75 dark:hover:bg-slate-800/85",
    ].join(" ");
  }
  return [
    "border-b border-slate-700/90 border-l-4 border-l-red-500/85",
    "odd:bg-slate-900 even:bg-slate-950 hover:bg-slate-800/80",
    "dark:border-slate-800 dark:odd:bg-slate-900 dark:even:bg-slate-950 dark:hover:bg-slate-800",
  ].join(" ");
}

/** Viền trái thẻ chuyến (mobile). */
export function mobileCardSeasonClass(row: ScheduleRow): string {
  return row.season === "winter"
    ? "border-l-4 border-l-sky-500/80"
    : "border-l-4 border-l-red-500/80";
}

// --- Ô bảng desktop: FLT / AC / RTG / ghi chú (cùng style “hộp” dữ liệu) ---

export function flightDataBoxClass(row: ScheduleRow): string {
  if (row.season === "winter") {
    return "border-sky-500/55 bg-sky-950/40 text-sky-50/95 dark:border-sky-500/50 dark:bg-sky-950/45 dark:text-sky-100/95";
  }
  return "border-red-500/55 bg-red-950/35 text-red-50/95 dark:border-red-500/50 dark:bg-red-950/40 dark:text-red-50/95";
}

/** Nút STD (ô giờ khởi hành). */
export function flightStdButtonClass(row: ScheduleRow): string {
  if (row.season === "winter") {
    return "border-sky-500/60 bg-sky-500/20 text-sky-100 shadow-sm transition hover:border-sky-400/85 hover:bg-sky-500/30 focus:outline-none focus:ring-2 focus:ring-sky-500/40";
  }
  return "border-red-500/60 bg-red-500/18 text-red-50 shadow-sm transition hover:border-red-400/85 hover:bg-red-500/28 focus:outline-none focus:ring-2 focus:ring-red-500/40";
}

/** Cut-off: vẫn ưu tiên cảnh báo đỏ khi lệch orig. */
export function flightCutoffBoxClass(
  row: ScheduleRow,
  differsFromOrig: boolean
): string {
  if (differsFromOrig) {
    return "border-red-500 bg-red-950/50 text-red-200 dark:border-red-500 dark:bg-red-950/50";
  }
  if (row.season === "winter") {
    return "border-sky-500/50 bg-sky-950/35 text-sky-100/95 dark:border-sky-500/45 dark:bg-sky-950/40";
  }
  return "border-red-500/50 bg-red-950/32 text-red-50/95 dark:border-red-500/45 dark:bg-red-950/38";
}

export function flightSttTextClass(row: ScheduleRow): string {
  if (row.season === "winter") {
    return "text-sky-200/90";
  }
  return "text-red-200/90";
}

/** Nền cột OPS (desktop). */
export function flightOpsColumnBgClass(row: ScheduleRow): string {
  return row.season === "winter" ? "bg-sky-950/30" : "bg-red-950/25";
}

// --- Mobile card: nền + nút STD + vùng OPS theo mùa ---

export function mobileCardShellClass(row: ScheduleRow): string {
  if (row.season === "winter") {
    return "bg-gradient-to-br from-sky-50/50 to-indigo-50/30 dark:from-sky-950/20 dark:to-zinc-900/80";
  }
  return "bg-gradient-to-br from-rose-50/40 to-orange-50/25 dark:from-red-950/15 dark:to-zinc-900/80";
}

export function mobileStdButtonClass(row: ScheduleRow): string {
  if (row.season === "winter") {
    return "border-2 border-sky-500/50 bg-gradient-to-br from-sky-500/15 to-indigo-500/8 shadow-sm transition hover:border-sky-500/70 hover:from-sky-500/20 dark:border-sky-500/40 dark:from-sky-500/18 dark:to-indigo-950/25";
  }
  return "border-2 border-red-500/45 bg-gradient-to-br from-red-500/12 to-orange-500/8 shadow-sm transition hover:border-red-500/65 hover:from-red-500/18 dark:border-red-500/40 dark:from-red-500/16 dark:to-orange-950/20";
}

export function mobileSttBadgeClass(row: ScheduleRow): string {
  if (row.season === "winter") {
    return "bg-sky-600/12 text-sky-900 dark:bg-sky-500/20 dark:text-sky-100";
  }
  return "bg-red-600/12 text-red-900 dark:bg-red-500/18 dark:text-red-100";
}

export function mobileMetaChipClass(row: ScheduleRow): string {
  if (row.season === "winter") {
    return "bg-sky-100 text-sky-900 dark:bg-sky-950/50 dark:text-sky-200";
  }
  return "bg-red-100 text-red-900 dark:bg-red-950/40 dark:text-red-200";
}

export function mobileOpsPanelClass(row: ScheduleRow): string {
  if (row.season === "winter") {
    return "border-sky-200/80 bg-sky-50/60 dark:border-sky-800/60 dark:bg-sky-950/35";
  }
  return "border-red-200/80 bg-rose-50/50 dark:border-red-900/50 dark:bg-red-950/25";
}

/** Nút mở ghi chú (mobile). */
export function mobileRemarkButtonClass(row: ScheduleRow): string {
  if (row.season === "winter") {
    return "border-sky-200/90 bg-sky-50/50 hover:border-sky-400/50 hover:bg-sky-100/50 dark:border-sky-800/60 dark:bg-sky-950/25 dark:hover:border-sky-600/50";
  }
  return "border-red-200/90 bg-rose-50/50 hover:border-red-300/50 hover:bg-rose-100/40 dark:border-red-900/50 dark:bg-red-950/20 dark:hover:border-red-800/50";
}

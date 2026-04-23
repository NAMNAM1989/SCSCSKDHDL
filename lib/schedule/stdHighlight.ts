import type { ScheduleRow } from "./types";

/** Thời gian tô sáng nút STD sau khi đổi giá trị (mặc định 24 giờ). */
export const STD_HIGHLIGHT_MS = 24 * 60 * 60 * 1000;

export function parseStdHighlightUntil(row: ScheduleRow): number | null {
  const s = row.stdHighlightUntil;
  if (typeof s !== "string" || !s.trim()) return null;
  const t = Date.parse(s);
  return Number.isFinite(t) ? t : null;
}

export function isStdHighlightActive(
  row: ScheduleRow,
  now = Date.now()
): boolean {
  const until = parseStdHighlightUntil(row);
  return until != null && now < until;
}

export function bumpStdHighlightUntil(): string {
  return new Date(Date.now() + STD_HIGHLIGHT_MS).toISOString();
}

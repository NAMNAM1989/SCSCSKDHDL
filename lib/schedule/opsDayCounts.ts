import { OPS_KEYS } from "./constants";
import type { ScheduleRow } from "./types";

const OPS_TIME_RE = /(\d{1,2}:\d{2})/;

/**
 * Đếm số chuyến có ngày OPS được “tick” (X/x) hoặc có giờ HH:MM — cùng logic cột desktop.
 */
export function countFlightsWithDayTick(list: ScheduleRow[]): number[] {
  const t = [0, 0, 0, 0, 0, 0, 0];
  for (const row of list) {
    OPS_KEYS.forEach((k, i) => {
      const s = String(row.ops[k] ?? "").trim();
      if (!s) return;
      if (s === "X" || s === "x" || OPS_TIME_RE.test(s)) t[i]++;
    });
  }
  return t;
}

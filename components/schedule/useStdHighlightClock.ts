"use client";

import { isStdHighlightActive } from "@/lib/schedule/stdHighlight";
import type { ScheduleRow } from "@/lib/schedule/types";
import { useEffect, useState } from "react";

/**
 * Khi còn STD đang trong cửa sổ tô sáng, tick mỗi phút để UI tự về trạng thái bình thường sau 24h.
 */
export function useStdHighlightClock(rows: ScheduleRow[]): number {
  const [tick, setTick] = useState(0);
  const now = Date.now();
  const anyActive = rows.some((r) => isStdHighlightActive(r, now));

  useEffect(() => {
    if (!anyActive) return;
    const id = window.setInterval(() => setTick((t) => t + 1), 60_000);
    return () => window.clearInterval(id);
  }, [anyActive, rows]);

  void tick;
  return now;
}

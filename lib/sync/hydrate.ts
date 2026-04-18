import { migrateRow, normalizeRow } from "@/lib/schedule/rowModel";
import type { ScheduleMeta, ScheduleState } from "@/lib/schedule/types";

export function hydrateScheduleState(raw: unknown): ScheduleState | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (!Array.isArray(o.rows)) return null;
  const rows = [];
  for (const item of o.rows) {
    const n = normalizeRow(item);
    if (n) rows.push(n);
  }
  let meta: ScheduleMeta = { updatedDate: "08APR26" };
  if (o.meta && typeof o.meta === "object" && o.meta !== null) {
    const m = o.meta as { updatedDate?: string };
    if (typeof m.updatedDate === "string") meta = { ...meta, updatedDate: m.updatedDate };
  }
  for (const row of rows) {
    migrateRow(row);
  }
  return { rows, meta };
}

export function statesEqual(a: ScheduleState, b: ScheduleState): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

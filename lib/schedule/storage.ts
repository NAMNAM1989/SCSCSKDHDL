import { META_KEY, SEED_ROWS, STORAGE_KEY } from "./constants";
import { migrateRow, newRowId, normalizeRow } from "./rowModel";
import type { ScheduleMeta, ScheduleRow, ScheduleState } from "./types";

export function loadState(): ScheduleState {
  try {
    const raw = typeof localStorage !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    const metaRaw =
      typeof localStorage !== "undefined" ? localStorage.getItem(META_KEY) : null;
    let rows: ScheduleRow[] = [];
    if (raw) {
      const arr = JSON.parse(raw) as unknown;
      if (Array.isArray(arr)) {
        for (const item of arr) {
          const n = normalizeRow(item);
          if (n) rows.push(n);
        }
      }
    }
    if (!rows.length) {
      for (const s of SEED_ROWS) {
        const b = normalizeRow({ ...s });
        if (b) {
          b.id = newRowId();
          rows.push(b);
        }
      }
    }
    const meta: ScheduleMeta = { updatedDate: "08APR26" };
    if (metaRaw) {
      const m = JSON.parse(metaRaw) as { updatedDate?: string };
      if (m && typeof m.updatedDate === "string") meta.updatedDate = m.updatedDate;
    }
    for (const row of rows) {
      migrateRow(row);
    }
    return { rows, meta };
  } catch {
    const fallback = SEED_ROWS.map((x) => {
      const n = normalizeRow({ ...x });
      if (!n) throw new Error("seed");
      n.id = newRowId();
      return n;
    });
    for (const row of fallback) {
      migrateRow(row);
    }
    return { rows: fallback, meta: { updatedDate: "08APR26" } };
  }
}

export function persistNow(state: ScheduleState): void {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.rows));
    localStorage.setItem(META_KEY, JSON.stringify(state.meta));
  } catch {
    /* ignore */
  }
}

export function clearStorage(): void {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(META_KEY);
  } catch {
    /* ignore */
  }
}

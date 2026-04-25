import { META_KEY, SEED_ROWS, STORAGE_KEY } from "./constants";
import { migrateRow, normalizeRow } from "./rowModel";
import type { ScheduleMeta, ScheduleRow, ScheduleState } from "./types";

function seedRowId(index: number): string {
  return `r-seed-${index}`;
}

function buildStateFromStorage(raw: string | null, metaRaw: string | null): ScheduleState {
  try {
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
      let i = 0;
      for (const s of SEED_ROWS) {
        const b = normalizeRow({ ...s, id: seedRowId(i) });
        if (b) {
          b.id = seedRowId(i);
          i += 1;
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
    const fallback = SEED_ROWS.map((x, i) => {
      const n = normalizeRow({ ...x, id: seedRowId(i) });
      if (!n) throw new Error("seed");
      n.id = seedRowId(i);
      return n;
    });
    for (const row of fallback) {
      migrateRow(row);
    }
    return { rows: fallback, meta: { updatedDate: "08APR26" } };
  }
}

/**
 * Cùng nội dung với `loadState()` khi chưa có bản lưu (3 dòng mẫu, id seed cố định).
 * Dùng cho SSR + lượt render hydrate đầu — tránh 3/60 dòng và tránh newRowId() ngẫu nhiên.
 */
export function getHydrationInitialState(): ScheduleState {
  return buildStateFromStorage(null, null);
}

export function loadState(): ScheduleState {
  const raw = typeof localStorage !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
  const metaRaw = typeof localStorage !== "undefined" ? localStorage.getItem(META_KEY) : null;
  return buildStateFromStorage(raw, metaRaw);
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

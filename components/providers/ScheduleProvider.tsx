"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { SAVE_MS } from "@/lib/schedule/constants";
import { parseExcelWorkbook } from "@/lib/schedule/excelImport";
import {
  emptyOps,
  migrateRow,
  newRowId,
  normalizeRow,
  recalcCutoffsFromMb,
  rowHasBaseline,
  snapshotOrigAndMb,
} from "@/lib/schedule/rowModel";
import { clearStorage, loadState, persistNow } from "@/lib/schedule/storage";
import type { ScheduleMeta, ScheduleRow, ScheduleState } from "@/lib/schedule/types";
import { isNAVal, minutesBefore, smartFormatTimeCell } from "@/lib/schedule/time";

type Ctx = {
  state: ScheduleState;
  filter: string;
  setFilter: (v: string) => void;
  setMeta: (m: Partial<ScheduleMeta>) => void;
  updateField: (
    id: string,
    field: keyof ScheduleRow,
    value: string
  ) => void;
  updateOps: (id: string, day: keyof ScheduleRow["ops"], value: string) => void;
  addRow: () => void;
  removeRow: (id: string) => void;
  reorder: (fromId: string, toId: string) => void;
  importJsonFile: (file: File) => Promise<void>;
  importExcelFile: (file: File) => Promise<void>;
  exportJson: () => void;
  clearDraft: () => void;
};

const ScheduleContext = createContext<Ctx | null>(null);

export function useSchedule(): Ctx {
  const x = useContext(ScheduleContext);
  if (!x) throw new Error("useSchedule outside ScheduleProvider");
  return x;
}

export function ScheduleProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ScheduleState>(() => loadState());
  const [filter, setFilter] = useState("");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleSave = useCallback((next: ScheduleState) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveTimer.current = null;
      persistNow(next);
    }, SAVE_MS);
  }, []);

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  const setMeta = useCallback(
    (m: Partial<ScheduleMeta>) => {
      setState((s) => {
        const next = {
          ...s,
          meta: { ...s.meta, ...m },
        };
        scheduleSave(next);
        return next;
      });
    },
    [scheduleSave]
  );

  const updateField = useCallback(
    (id: string, field: keyof ScheduleRow, value: string) => {
      setState((s) => {
        const rows = s.rows.map((row) => {
          if (row.id !== id) return row;
          const next = { ...row };
          if (field === "std") {
            next.std = smartFormatTimeCell(value);
            const hadB = rowHasBaseline(next);
            if (!hadB && next.std) snapshotOrigAndMb(next);
            else if (hadB && next.std) recalcCutoffsFromMb(next);
          } else if (
            ["gen", "per", "doc", "transit", "bu"].includes(field as string)
          ) {
            const f = field as "gen" | "per" | "doc" | "transit" | "bu";
            next[f] = smartFormatTimeCell(value);
            if (next.std && next[f] && !isNAVal(next[f])) {
              if (!next.mb)
                next.mb = {
                  gen: null,
                  per: null,
                  doc: null,
                  transit: null,
                  bu: null,
                };
              next.mb[f] = minutesBefore(next.std, next[f]);
            } else if (next.mb) {
              next.mb[f] = null;
            }
          } else if (field === "flt") {
            next.flt = value;
          } else if (field === "ac") {
            next.ac = value;
          } else if (field === "rtg") {
            next.rtg = value;
          } else if (field === "remark") {
            next.remark = value;
          }
          migrateRow(next);
          return next;
        });
        const st = { ...s, rows };
        scheduleSave(st);
        return st;
      });
    },
    [scheduleSave]
  );

  const updateOps = useCallback(
    (id: string, day: keyof ScheduleRow["ops"], value: string) => {
      setState((s) => {
        const rows = s.rows.map((row) => {
          if (row.id !== id) return row;
          return {
            ...row,
            ops: { ...row.ops, [day]: value },
          };
        });
        const st = { ...s, rows };
        scheduleSave(st);
        return st;
      });
    },
    [scheduleSave]
  );

  const addRow = useCallback(() => {
    setState((s) => {
      const row = normalizeRow({
        id: newRowId(),
        flt: "",
        ac: "",
        rtg: "",
        std: "",
        gen: "",
        per: "",
        doc: "",
        transit: "",
        bu: "",
        ops: emptyOps(),
        remark: "",
      });
      if (!row) return s;
      const st = { ...s, rows: [...s.rows, row] };
      scheduleSave(st);
      return st;
    });
  }, [scheduleSave]);

  const removeRow = useCallback(
    (id: string) => {
      setState((s) => {
        const st = { ...s, rows: s.rows.filter((r) => r.id !== id) };
        persistNow(st);
        return st;
      });
    },
    []
  );

  const reorder = useCallback(
    (fromId: string, toId: string) => {
      if (fromId === toId) return;
      setState((s) => {
        const iFrom = s.rows.findIndex((r) => r.id === fromId);
        const iTo = s.rows.findIndex((r) => r.id === toId);
        if (iFrom < 0 || iTo < 0) return s;
        const next = [...s.rows];
        const [moved] = next.splice(iFrom, 1);
        let j = iTo;
        if (iFrom < iTo) j--;
        next.splice(j, 0, moved);
        const st = { ...s, rows: next };
        persistNow(st);
        return st;
      });
    },
    []
  );

  const importJsonFile = useCallback(async (file: File) => {
    const text = await file.text();
    const data = JSON.parse(text) as unknown;
    let newRows: ScheduleRow[] = [];
    let metaPatch: Partial<ScheduleMeta> | undefined;
    if (Array.isArray(data)) {
      for (const item of data) {
        const n = normalizeRow(item);
        if (n) newRows.push(n);
      }
    } else if (
      data &&
      typeof data === "object" &&
      Array.isArray((data as { rows?: unknown }).rows)
    ) {
      const d = data as { rows: unknown[]; meta?: { updatedDate?: string } };
      for (const item of d.rows) {
        const n = normalizeRow(item);
        if (n) newRows.push(n);
      }
      if (d.meta && typeof d.meta.updatedDate === "string") {
        metaPatch = { updatedDate: d.meta.updatedDate };
      }
    }
    if (!newRows.length) throw new Error("Không có dòng hợp lệ.");
    for (const r of newRows) migrateRow(r);
    setState((s) => {
      const st = {
        rows: newRows,
        meta: metaPatch ? { ...s.meta, ...metaPatch } : s.meta,
      };
      persistNow(st);
      return st;
    });
  }, []);

  const importExcelFile = useCallback(async (file: File) => {
    const buf = await file.arrayBuffer();
    const newRows = parseExcelWorkbook(buf);
    setState((s) => {
      const st = { ...s, rows: newRows };
      persistNow(st);
      return st;
    });
  }, []);

  const exportJson = useCallback(() => {
    const payload = { meta: state.meta, rows: state.rows };
    const json = JSON.stringify(payload, null, 2);
    const blob = new Blob([json], { type: "application/json;charset=utf-8" });
    const a = document.createElement("a");
    const d = new Date();
    const ds =
      d.getFullYear() +
      String(d.getMonth() + 1).padStart(2, "0") +
      String(d.getDate()).padStart(2, "0");
    a.href = URL.createObjectURL(blob);
    a.download = "cutoff-scsc-" + ds + ".json";
    a.click();
    URL.revokeObjectURL(a.href);
  }, [state.meta, state.rows]);

  const clearDraft = useCallback(() => {
    clearStorage();
    const next = loadState();
    setState(next);
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      state,
      filter,
      setFilter,
      setMeta,
      updateField,
      updateOps,
      addRow,
      removeRow,
      reorder,
      importJsonFile,
      importExcelFile,
      exportJson,
      clearDraft,
    }),
    [
      state,
      filter,
      setMeta,
      updateField,
      updateOps,
      addRow,
      removeRow,
      reorder,
      importJsonFile,
      importExcelFile,
      exportJson,
      clearDraft,
    ]
  );

  return (
    <ScheduleContext.Provider value={value}>{children}</ScheduleContext.Provider>
  );
}

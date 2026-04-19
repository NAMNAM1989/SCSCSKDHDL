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
import { META_KEY, SAVE_MS, STORAGE_KEY } from "@/lib/schedule/constants";
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
import {
  applySyncRuntimeOverride,
  getSyncDocId,
  hasEmbeddedSupabaseEnv,
  isSupabaseConfigured,
} from "@/lib/sync/env";
import { readSyncPrefsFromLocalStorage } from "@/lib/sync/syncLocalPrefs";
import { statesEqual } from "@/lib/sync/hydrate";
import {
  NEVER_SYNCED_AT,
  clearLastRemoteIso,
  getLastRemoteIso,
  setLastRemoteIso,
} from "@/lib/sync/lastRemoteAt";
import { shouldSkipEmptyRemoteOverwrite } from "@/lib/sync/remoteGuards";
import {
  fetchRemoteState,
  subscribeRemoteState,
  upsertRemoteState,
} from "@/lib/sync/remoteSupabase";
import { createTabSync } from "@/lib/sync/tabBroadcast";

type SyncInfo = {
  /** Có cấu hình Supabase (đồng bộ đa thiết bị) */
  cloudEnabled: boolean;
  /** ISO lần áp dữ liệu từ server gần nhất (hiển thị) */
  lastRemoteAt: string | null;
  error: string | null;
};

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
  importExcelFile: (file: File) => Promise<void>;
  clearDraft: () => void;
  sync: SyncInfo;
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
  const [syncError, setSyncError] = useState<string | null>(null);
  const [lastRemoteAt, setLastRemoteAt] = useState<string | null>(null);
  /** Sau khi đã thử env + fetch sync-config.json — tránh báo cloud tắt trong lúc tải cấu hình runtime */
  const [syncRuntimeReady, setSyncRuntimeReady] = useState(false);

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tabSyncRef = useRef<ReturnType<typeof createTabSync> | null>(null);
  const tabIdRef = useRef<string>("");
  if (!tabIdRef.current) {
    tabIdRef.current =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2);
  }

  const pushRemote = useCallback(async (next: ScheduleState) => {
    if (!syncRuntimeReady || !isSupabaseConfigured()) return;
    try {
      const ts = await upsertRemoteState(getSyncDocId(), next);
      if (ts) {
        setLastRemoteIso(ts);
        setLastRemoteAt(ts);
      }
      setSyncError(null);
    } catch (e) {
      setSyncError(String(e));
    }
  }, [syncRuntimeReady]);

  const persistImmediate = useCallback(
    (next: ScheduleState) => {
      persistNow(next);
      tabSyncRef.current?.broadcast(next);
      void pushRemote(next);
    },
    [pushRemote]
  );

  const scheduleSave = useCallback(
    (next: ScheduleState) => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        saveTimer.current = null;
        persistNow(next);
        tabSyncRef.current?.broadcast(next);
        void pushRemote(next);
      }, SAVE_MS);
    },
    [pushRemote]
  );

  useEffect(() => {
    const t = getLastRemoteIso();
    setLastRemoteAt(t === NEVER_SYNCED_AT ? null : t);
  }, []);

  /**
   * Bootstrap Supabase: (1) NEXT_PUBLIC_* build (2) localStorage thiết bị
   * (3) sync-config.json do Railway/Docker ghi — hiện production thường là {} nếu chưa đặt SYNC_*.
   */
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        if (hasEmbeddedSupabaseEnv()) {
          return;
        }
        const local = readSyncPrefsFromLocalStorage();
        if (local) {
          applySyncRuntimeOverride(local);
          return;
        }
        const r = await fetch("/sync-config.json", { cache: "no-store" });
        if (!r.ok) return;
        const j = (await r.json()) as Record<string, unknown>;
        const url = typeof j.supabaseUrl === "string" ? j.supabaseUrl.trim() : "";
        const key =
          typeof j.supabaseAnonKey === "string" ? j.supabaseAnonKey.trim() : "";
        const docRaw = typeof j.syncDocId === "string" ? j.syncDocId.trim() : "";
        if (url && key) {
          applySyncRuntimeOverride({
            url,
            key,
            docId: docRaw || "default",
          });
        }
      } catch {
        /* giữ chỉ dữ liệu lịch cục bộ */
      } finally {
        if (!cancelled) setSyncRuntimeReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  /** Đồng bộ tab (BroadcastChannel) */
  useEffect(() => {
    const tab = createTabSync(tabIdRef.current, (next) => {
      setState((prev) => {
        if (statesEqual(prev, next)) return prev;
        if (saveTimer.current) {
          clearTimeout(saveTimer.current);
          saveTimer.current = null;
        }
        persistNow(next);
        return next;
      });
    });
    tabSyncRef.current = tab;
    return () => {
      tab.close();
      tabSyncRef.current = null;
    };
  }, []);

  /** Tab khác ghi localStorage — tải lại (tránh ghi đè khi đang debounce chỉnh sửa) */
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY && e.key !== META_KEY) return;
      if (saveTimer.current) return;
      setState(loadState());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  /** Supabase: fetch ban đầu + realtime */
  useEffect(() => {
    if (!syncRuntimeReady || !isSupabaseConfigured()) return;
    const docId = getSyncDocId();
    let cancelled = false;
    let unsubscribe = () => {};

    void (async () => {
      const initialRows = loadState().rows.length;
      const r = await fetchRemoteState(docId);
      if (cancelled) return;
      if (!r) {
        unsubscribe = subscribeRemoteState(docId, (next, updatedAt) => {
          applyRemoteFromServer(next, updatedAt);
        });
        return;
      }
      if (
        new Date(r.updatedAt) > new Date(getLastRemoteIso()) &&
        !shouldSkipEmptyRemoteOverwrite(r.state, initialRows)
      ) {
        setState(r.state);
        persistNow(r.state);
        setLastRemoteIso(r.updatedAt);
        setLastRemoteAt(r.updatedAt);
      }
      if (cancelled) return;
      unsubscribe = subscribeRemoteState(docId, (next, updatedAt) => {
        applyRemoteFromServer(next, updatedAt);
      });
    })();

    function applyRemoteFromServer(next: ScheduleState, updatedAt: string) {
      setState((prev) => {
        if (statesEqual(prev, next)) return prev;
        if (new Date(updatedAt) <= new Date(getLastRemoteIso())) return prev;
        if (
          shouldSkipEmptyRemoteOverwrite(next, prev.rows.length)
        ) {
          return prev;
        }
        if (saveTimer.current) {
          clearTimeout(saveTimer.current);
          saveTimer.current = null;
        }
        setLastRemoteIso(updatedAt);
        setLastRemoteAt(updatedAt);
        persistNow(next);
        return next;
      });
    }

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [syncRuntimeReady]);

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
        persistImmediate(st);
        return st;
      });
    },
    [persistImmediate]
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
        persistImmediate(st);
        return st;
      });
    },
    [persistImmediate]
  );

  const importExcelFile = useCallback(
    async (file: File) => {
      const buf = await file.arrayBuffer();
      const newRows = parseExcelWorkbook(buf);
      setState((s) => {
        const st = { ...s, rows: newRows };
        persistImmediate(st);
        return st;
      });
    },
    [persistImmediate]
  );

  const clearDraft = useCallback(() => {
    clearStorage();
    clearLastRemoteIso();
    setLastRemoteAt(null);
    const next = loadState();
    setState(next);
  }, []);

  const syncInfo = useMemo<SyncInfo>(
    () => ({
      cloudEnabled: syncRuntimeReady && isSupabaseConfigured(),
      lastRemoteAt,
      error: syncError,
    }),
    [syncRuntimeReady, lastRemoteAt, syncError]
  );

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
      importExcelFile,
      clearDraft,
      sync: syncInfo,
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
      importExcelFile,
      clearDraft,
      syncInfo,
    ]
  );

  return (
    <ScheduleContext.Provider value={value}>{children}</ScheduleContext.Provider>
  );
}

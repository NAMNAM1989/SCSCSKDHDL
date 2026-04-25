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
import { applyFieldToRow } from "@/lib/schedule/applyFieldUpdate";
import { emptyOps, newRowId, normalizeRow } from "@/lib/schedule/rowModel";
import {
  clearStorage,
  getHydrationInitialState,
  loadState,
  persistNow,
} from "@/lib/schedule/storage";
import type { ScheduleMeta, ScheduleRow, ScheduleState } from "@/lib/schedule/types";
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
  /** Trả về `id` dòng vừa thêm (để mở form chỉnh sửa). */
  addRow: () => string | undefined;
  removeRow: (id: string) => void;
  reorder: (fromId: string, toId: string) => void;
  importExcelFile: (file: File) => Promise<void>;
  clearDraft: () => void;
  sync: SyncInfo;
  /** Thông báo tạm sau khi sửa STD (rõ chuyến bay). */
  stdEditNotice: string | null;
  dismissStdEditNotice: () => void;
};

const ScheduleContext = createContext<Ctx | null>(null);

export function useSchedule(): Ctx {
  const x = useContext(ScheduleContext);
  if (!x) throw new Error("useSchedule outside ScheduleProvider");
  return x;
}

export function ScheduleProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ScheduleState>(getHydrationInitialState);
  const [filter, setFilter] = useState("");
  const [syncError, setSyncError] = useState<string | null>(null);
  const [lastRemoteAt, setLastRemoteAt] = useState<string | null>(null);
  /** Sau khi đã thử env + fetch sync-config.json — tránh báo cloud tắt trong lúc tải cấu hình runtime */
  const [syncRuntimeReady, setSyncRuntimeReady] = useState(false);
  const [stdEditNotice, setStdEditNotice] = useState<string | null>(null);

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stdNoticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
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

  /** Sau mount: đọc localStorage — khớp SSR (tránh hydrate 3 dòng vs 60 dòng). */
  useEffect(() => {
    setState(loadState());
  }, []);

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
      if (stdNoticeTimer.current) clearTimeout(stdNoticeTimer.current);
    };
  }, []);

  const dismissStdEditNotice = useCallback(() => {
    if (stdNoticeTimer.current) {
      clearTimeout(stdNoticeTimer.current);
      stdNoticeTimer.current = null;
    }
    setStdEditNotice(null);
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

  /**
   * Supabase: fetch ban đầu + Realtime (refetch sau mỗi sự kiện) + polling
   * để điện thoại / Safari vẫn bắt kịp khi WebSocket chậm hoặc nền bị đóng băng.
   */
  useEffect(() => {
    if (!syncRuntimeReady || !isSupabaseConfigured()) return;
    const docId = getSyncDocId();
    let cancelled = false;
    let unsubscribe = () => {};
    let pollTimer: ReturnType<typeof setInterval> | null = null;
    const lastPollAt = { current: 0 };

    function applyRemoteFromServer(next: ScheduleState, updatedAt: string) {
      setState((prev) => {
        if (statesEqual(prev, next)) return prev;
        if (new Date(updatedAt) <= new Date(getLastRemoteIso())) return prev;
        if (shouldSkipEmptyRemoteOverwrite(next, prev.rows.length)) {
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

    async function pullRemoteSnapshot(force = false) {
      if (cancelled) return;
      if (!force && typeof document !== "undefined" && document.hidden) return;
      const t = Date.now();
      if (!force && t - lastPollAt.current < 4000) return;
      lastPollAt.current = t;
      try {
        const r = await fetchRemoteState(docId);
        if (cancelled || !r) return;
        applyRemoteFromServer(r.state, r.updatedAt);
        setSyncError(null);
      } catch (e) {
        setSyncError(String(e));
      }
    }

    void (async () => {
      const initialRows = loadState().rows.length;
      const r = await fetchRemoteState(docId);
      if (cancelled) return;
      if (
        r &&
        new Date(r.updatedAt) > new Date(getLastRemoteIso()) &&
        !shouldSkipEmptyRemoteOverwrite(r.state, initialRows)
      ) {
        setState(r.state);
        persistNow(r.state);
        setLastRemoteIso(r.updatedAt);
        setLastRemoteAt(r.updatedAt);
      }
      if (cancelled) return;
      unsubscribe = subscribeRemoteState(docId, applyRemoteFromServer);
      pollTimer = setInterval(() => {
        void pullRemoteSnapshot(false);
      }, 8000);
      void pullRemoteSnapshot(true);
    })();

    const onVisible = () => {
      if (document.visibilityState === "visible") void pullRemoteSnapshot(true);
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      if (pollTimer) clearInterval(pollTimer);
      document.removeEventListener("visibilitychange", onVisible);
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
      let stdNoticePayload: {
        flt: string;
        std: string;
        ac?: string;
        rtg?: string;
      } | null = null;

      setState((s) => {
        const rows = s.rows.map((row) => {
          if (row.id !== id) return row;
          const next = applyFieldToRow(row, field, value);
          if (next !== row && field === "std") {
            stdNoticePayload = {
              flt: next.flt?.trim() || "(chưa có số hiệu)",
              std: next.std?.trim() || "—",
              ac: next.ac?.trim() || undefined,
              rtg: next.rtg?.trim() || undefined,
            };
          }
          return next;
        });
        if (rows.every((r, i) => r === s.rows[i])) return s;
        const st = { ...s, rows };
        scheduleSave(st);
        return st;
      });

      if (stdNoticePayload) {
        const { flt, std, ac, rtg } = stdNoticePayload;
        const bits = [
          `Đã cập nhật STD chuyến bay ${flt}`,
          ac ? `· ${ac}` : null,
          rtg ? `· ${rtg}` : null,
          `→ STD: ${std}`,
        ].filter(Boolean);
        const msg = bits.join(" ");
        queueMicrotask(() => {
          setStdEditNotice(msg);
          if (stdNoticeTimer.current) clearTimeout(stdNoticeTimer.current);
          stdNoticeTimer.current = setTimeout(() => {
            stdNoticeTimer.current = null;
            setStdEditNotice(null);
          }, 8000);
        });
      }
    },
    [scheduleSave]
  );

  const updateOps = useCallback(
    (id: string, day: keyof ScheduleRow["ops"], value: string) => {
      setState((s) => {
        const rows = s.rows.map((row) => {
          if (row.id !== id) return row;
          if (row.ops[day] === value) return row;
          return {
            ...row,
            ops: { ...row.ops, [day]: value },
          };
        });
        if (rows.every((r, i) => r === s.rows[i])) return s;
        const st = { ...s, rows };
        scheduleSave(st);
        return st;
      });
    },
    [scheduleSave]
  );

  const addRow = useCallback((): string | undefined => {
    const id = newRowId();
    const row = normalizeRow({
      id,
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
    if (!row) return undefined;
    setState((s) => {
      const st = { ...s, rows: [...s.rows, row] };
      scheduleSave(st);
      return st;
    });
    return row.id;
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
      const { parseExcelWorkbook } = await import("@/lib/schedule/excelImport");
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
      stdEditNotice,
      dismissStdEditNotice,
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
      stdEditNotice,
      dismissStdEditNotice,
    ]
  );

  return (
    <ScheduleContext.Provider value={value}>{children}</ScheduleContext.Provider>
  );
}

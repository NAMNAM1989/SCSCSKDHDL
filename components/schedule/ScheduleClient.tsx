"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { useSchedule } from "@/components/providers/ScheduleProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { appRowToFlight, formatUpdatedDateForExport } from "@/lib/schedule/exportHelpers";
import { exportSchedulePdf } from "@/lib/schedule/exportPdf";
import { rowMatchesFilter } from "@/lib/schedule/rowModel";
import type { ScheduleSeason } from "@/lib/schedule/types";
import { Menu, Printer, Trash2, X } from "lucide-react";
import dynamic from "next/dynamic";
import type { DragEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const ScheduleMobileCardsLazy = dynamic(
  () =>
    import("./ScheduleMobileCards").then((m) => ({
      default: m.ScheduleMobileCards,
    })),
  { ssr: false, loading: () => <div className="min-h-16 shrink-0 lg:hidden" /> }
);

const AirlineOpsFlightTableLazy = dynamic(
  () =>
    import("./airline/AirlineOpsFlightTable").then((m) => ({
      default: m.AirlineOpsFlightTable,
    })),
  {
    ssr: false,
    loading: () => (
      <div
        className="hidden min-h-[min(70vh,880px)] flex-1 bg-[#0B1E2D] lg:flex"
        aria-hidden
      />
    ),
  }
);

const FlightEditSheetLazy = dynamic(
  () =>
    import("./FlightEditSheet").then((m) => ({
      default: m.FlightEditSheet,
    })),
  { ssr: false }
);

export function ScheduleClient({
  mode = "home",
}: {
  mode?: "home" | "search";
}) {
  const {
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
    stdEditNotice,
    dismissStdEditNotice,
  } = useSchedule();
  const { canEdit } = useAuth();
  const xlsxRef = useRef<HTMLInputElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [sheetRowId, setSheetRowId] = useState<string | null>(null);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const sheetRow = sheetRowId
    ? state.rows.find((r) => r.id === sheetRowId) ?? null
    : null;
  const sheetRowIndex = sheetRowId
    ? state.rows.findIndex((r) => r.id === sheetRowId) + 1
    : 0;

  useEffect(() => {
    if (sheetRowId && !state.rows.some((r) => r.id === sheetRowId)) {
      setSheetRowId(null);
    }
  }, [sheetRowId, state.rows]);

  useEffect(() => {
    if (selectedRowId && !state.rows.some((r) => r.id === selectedRowId)) {
      setSelectedRowId(null);
    }
  }, [selectedRowId, state.rows]);

  const handleAddFlight = useCallback(() => {
    if (!canEdit) {
      alert("Tài khoản Viewer chỉ có quyền xem.");
      return;
    }
    const id = addRow();
    if (id) setSheetRowId(id);
  }, [addRow, canEdit]);

  useEffect(() => {
    if (mode !== "search") return;
    requestAnimationFrame(() => {
      const wide = window.matchMedia("(min-width: 1024px)").matches;
      const id = wide ? "schedule-filter-dk" : "schedule-filter-mb";
      document.getElementById(id)?.focus();
    });
  }, [mode]);

  const exportPdf = useCallback(async () => {
    await exportSchedulePdf(state);
  }, [state]);

  const filterNorm = filter.trim().toLowerCase();
  const filtered = useMemo(
    () =>
      filterNorm
        ? state.rows.filter((r) => rowMatchesFilter(r, filterNorm))
        : state.rows,
    [state.rows, filterNorm]
  );

  const exportExcel = useCallback(async () => {
    const { exportFlightSchedule } = await import("@/lib/exportFlightSchedule");
    const q = filter.trim().toLowerCase();
    const rowsToExport = !q
      ? state.rows
      : state.rows.filter((r) => rowMatchesFilter(r, q));
    const flights = rowsToExport.map(appRowToFlight);
    const ud = formatUpdatedDateForExport(state.meta.updatedDate || "08APR26");
    await exportFlightSchedule({ flights, updatedDate: ud });
  }, [filter, state.rows, state.meta.updatedDate]);

  const onDragStart = useCallback(
    (e: DragEvent<HTMLTableRowElement>, id: string) => {
      if (!canEdit) return;
      e.dataTransfer.setData("text/plain", id);
      e.dataTransfer.effectAllowed = "move";
    },
    [canEdit]
  );

  const onDrop = useCallback(
    (e: DragEvent<HTMLTableRowElement>, toId: string) => {
      if (!canEdit) return;
      e.preventDefault();
      const fromId = e.dataTransfer.getData("text/plain");
      reorder(fromId, toId);
    },
    [canEdit, reorder]
  );

  const onOpenRowEdit = useCallback((id: string) => {
    setSheetRowId(id);
  }, []);

  const onSeasonChange = useCallback(
    (id: string, season: ScheduleSeason) => {
      if (!canEdit) return;
      updateField(id, "season", season);
    },
    [canEdit, updateField]
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-x-hidden lg:min-h-0 lg:flex-1 lg:overflow-hidden">
      {/* Mobile: menu gập dạng panel nổi phía trên thanh đáy */}
      {menuOpen ? (
        <div className="fixed inset-x-2 bottom-[4.5rem] z-40 rounded-xl border border-zinc-200/90 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900/95 lg:hidden">
          <div className="grid grid-cols-2 gap-1.5 p-2 sm:gap-2">
            <Button
              variant="secondary"
              className="!min-h-9 !justify-center !text-xs"
              onClick={() => void exportPdf().catch(alert)}
            >
              <Printer className="mr-1 h-3.5 w-3.5" /> Xuất PDF
            </Button>
            <Button
              variant="secondary"
              className="!min-h-9 !justify-center !text-xs"
              onClick={() => void exportExcel().catch(alert)}
            >
              Export
            </Button>
            <Button
              variant="secondary"
              className="!min-h-9 !justify-center !text-xs"
              disabled={!canEdit}
              onClick={() => xlsxRef.current?.click()}
            >
              Import
            </Button>
            <Button
              variant="danger"
              className="!min-h-9 !justify-center !text-xs"
              disabled={!canEdit}
              onClick={() => {
                if (!canEdit) return;
                if (!confirm("Xoá toàn bộ nháp?")) return;
                if (!confirm("Xác nhận lần 2 — không hoàn tác.")) return;
                clearDraft();
                setMenuOpen(false);
              }}
            >
              <Trash2 className="mr-1 h-3.5 w-3.5" /> Xoá
            </Button>
          </div>
        </div>
      ) : null}

      <input
        ref={xlsxRef}
        type="file"
        accept=".xlsx,.xls"
        className="hidden"
        onChange={async (e) => {
          if (!canEdit) return;
          const f = e.target.files?.[0];
          e.target.value = "";
          if (!f) return;
          if (!confirm("Thay thế toàn bộ dữ liệu bằng Excel?")) return;
          try {
            await importExcelFile(f);
            alert("Đã import.");
          } catch (err) {
            alert(String(err));
          }
        }}
      />

      <main className="mx-auto flex min-h-0 w-full max-w-full flex-1 flex-col gap-2 pb-20 sm:max-w-2xl lg:mx-0 lg:h-full lg:max-w-none lg:min-h-0 lg:flex-1 lg:gap-3 lg:pb-0">
        {stdEditNotice ? (
          <div
            role="status"
            className="flex shrink-0 items-start gap-2 rounded-xl border border-emerald-500/35 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-950 shadow-sm dark:border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-50"
          >
            <span className="min-w-0 flex-1 font-medium leading-snug">
              {stdEditNotice}
            </span>
            <button
              type="button"
              className="shrink-0 rounded-lg p-1 text-emerald-800 hover:bg-emerald-200/60 dark:text-emerald-100 dark:hover:bg-emerald-900/60"
              aria-label="Đóng thông báo"
              onClick={dismissStdEditNotice}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : null}
        {/* Desktop: một hàng — công cụ + Updated + Lọc + Thêm chuyến */}
        <div className="sticky top-0 z-20 mb-1 hidden min-w-0 gap-3 rounded-2xl border border-zinc-200/90 bg-white/95 p-3 shadow-sm backdrop-blur-sm dark:border-zinc-800/80 dark:bg-zinc-900/90 lg:mb-3 lg:flex lg:flex-row lg:flex-wrap lg:items-center xl:flex-nowrap xl:gap-3">
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              className="!min-h-10 shrink-0 !rounded-xl !px-3 !text-sm !font-normal"
              onClick={() => void exportPdf().catch(alert)}
            >
              <Printer className="mr-1.5 h-3.5 w-3.5 shrink-0" /> Xuất PDF
            </Button>
            <Button
              variant="secondary"
              className="!min-h-10 shrink-0 !rounded-xl !px-3 !text-sm !font-normal"
              onClick={() => void exportExcel().catch(alert)}
            >
              Export Excel
            </Button>
            <Button
              variant="secondary"
              className="!min-h-10 shrink-0 !rounded-xl !px-3 !text-sm !font-normal"
              disabled={!canEdit}
              onClick={() => xlsxRef.current?.click()}
            >
              Import Excel
            </Button>
            <Button
              variant="danger"
              className="!min-h-10 shrink-0 !rounded-xl !px-3 !text-sm !font-normal"
              disabled={!canEdit}
              onClick={() => {
                if (!canEdit) return;
                if (!confirm("Xoá toàn bộ nháp?")) return;
                if (!confirm("Xác nhận lần 2 — không hoàn tác.")) return;
                clearDraft();
              }}
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5 shrink-0" /> Xoá nháp
            </Button>
          </div>

          <div className="flex min-w-0 flex-1 items-center gap-2 sm:min-w-[200px] sm:max-w-[220px]">
            <label
              htmlFor="schedule-updated-dk"
              className="shrink-0 text-xs font-medium text-zinc-500 dark:text-zinc-400"
            >
              Updated
            </label>
            <Input
              id="schedule-updated-dk"
              disabled={!canEdit}
              value={state.meta.updatedDate}
              onChange={(e) =>
                setMeta({ updatedDate: e.target.value.trim() || "08APR26" })
              }
              placeholder="08APR26"
              maxLength={12}
              className="!min-h-10 w-full min-w-0 max-w-[140px] flex-1"
            />
          </div>

          <div className="flex min-w-0 flex-[2] items-center gap-2">
            <label
              htmlFor="schedule-filter-dk"
              className="shrink-0 text-xs font-medium text-zinc-500 dark:text-zinc-400"
            >
              {mode === "search" ? "Tìm" : "Lọc"}
            </label>
            <Input
              id="schedule-filter-dk"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Flt, A/C, RTG…"
              className="!min-h-10 min-w-0 flex-1"
            />
          </div>

          <Button
            variant="primary"
            className="w-full shrink-0 !min-h-10 !rounded-xl !bg-gradient-to-r !from-brand-600 !to-violet-600 !text-white hover:!from-brand-700 hover:!to-violet-700 sm:w-auto lg:min-w-[160px] lg:!text-sm dark:!from-brand-500 dark:!to-violet-600 dark:hover:!from-brand-600 dark:hover:!to-violet-700"
            disabled={!canEdit}
            onClick={handleAddFlight}
          >
            {canEdit ? "+ Thêm chuyến" : "Viewer: chỉ xem"}
          </Button>
        </div>

        {/* Mobile: một hàng — menu + Updated/Lọc gọn */}
        <div className="sticky top-0 z-20 flex shrink-0 flex-col gap-2 lg:hidden">
          <div className="flex items-stretch gap-2">
            <Button
              variant="secondary"
              className="!h-auto !min-h-[2.5rem] !w-11 shrink-0 !rounded-lg !px-0"
              aria-label="Menu xuất / nhập"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((o) => !o)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <Card className="min-w-0 flex-1 !rounded-xl !p-2.5 !shadow-sm">
              <div className="grid grid-cols-2 gap-2">
                <div className="min-w-0">
                  <label
                    htmlFor="schedule-updated-mb"
                    className="mb-0.5 block text-[10px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400"
                  >
                    Updated
                  </label>
                  <Input
                    id="schedule-updated-mb"
                    disabled={!canEdit}
                    value={state.meta.updatedDate}
                    onChange={(e) =>
                      setMeta({
                        updatedDate: e.target.value.trim() || "08APR26",
                      })
                    }
                    placeholder="08APR26"
                    maxLength={12}
                    className="!min-h-9 !text-[15px]"
                  />
                </div>
                <div className="min-w-0">
                  <label
                    htmlFor="schedule-filter-mb"
                    className="mb-0.5 block text-[10px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400"
                  >
                    {mode === "search" ? "Tìm" : "Lọc"}
                  </label>
                  <Input
                    id="schedule-filter-mb"
                    ref={mode === "search" ? searchRef : undefined}
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    placeholder="Flt, A/C…"
                    className="!min-h-9 !text-[15px]"
                  />
                </div>
              </div>
            </Card>
          </div>

        </div>

        <Card className="flex min-h-0 w-full min-w-0 flex-1 flex-col !overflow-hidden !rounded-lg !border !border-slate-800/80 !p-0 !shadow-sm dark:!bg-[#0b1120] sm:!rounded-xl lg:!min-h-0 lg:!rounded-2xl">
          <div className="sticky top-0 z-10 flex shrink-0 flex-wrap items-center justify-between gap-x-3 gap-y-0.5 border-b border-slate-800/80 bg-slate-950/95 px-2.5 py-1.5 text-sm font-medium tabular-nums text-slate-400 lg:px-4 lg:py-2.5 lg:text-sm xl:py-3">
            <span className="text-slate-300/90">
              {filtered.length} dòng
              {filter.trim() ? " · lọc" : ""}
            </span>
            {filter.trim() && state.rows.length !== filtered.length ? (
              <span className="text-slate-500">{state.rows.length} trong bộ nhớ</span>
            ) : null}
          </div>
          <ScheduleMobileCardsLazy
            rows={filtered}
            onOpenRowEdit={onOpenRowEdit}
            onRemoveRow={removeRow}
            canEdit={canEdit}
          />
          <div className="hidden min-h-0 min-w-0 flex-1 flex-col bg-[#0B1E2D] lg:flex lg:min-h-0">
            <AirlineOpsFlightTableLazy
              rows={filtered}
              selectedRowId={selectedRowId}
              onSelectRow={setSelectedRowId}
              onOpenEdit={onOpenRowEdit}
              onRemoveRow={removeRow}
              onSeasonChange={onSeasonChange}
              onDragStart={onDragStart}
              onDrop={onDrop}
              canEdit={canEdit}
            />
          </div>
        </Card>
      </main>

      {/* Mobile sticky action bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200/80 bg-white/95 px-2.5 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2 shadow-[0_-6px_20px_rgba(0,0,0,0.08)] backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95 lg:hidden">
        <div className="mx-auto flex w-full max-w-md items-center gap-2">
          <Button
            variant="secondary"
            className="!min-h-10 !w-11 shrink-0 !rounded-lg !px-0"
            aria-label="Mở menu thao tác"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Button
            variant="primary"
            className="w-full !min-h-10 !rounded-lg !text-sm !font-semibold !shadow-sm !bg-gradient-to-r !from-brand-600 !to-violet-600 !text-white hover:!from-brand-700 hover:!to-violet-700 dark:!from-brand-500 dark:!to-violet-600 dark:hover:!from-brand-600 dark:hover:!to-violet-700"
            disabled={!canEdit}
            onClick={handleAddFlight}
          >
            {canEdit ? "+ Thêm chuyến" : "Viewer: chỉ xem"}
          </Button>
        </div>
      </div>

      <FlightEditSheetLazy
        open={Boolean(sheetRowId && sheetRow)}
        onClose={() => setSheetRowId(null)}
        row={sheetRow}
        rowIndex={sheetRowIndex}
        onUpdateField={updateField}
        onUpdateOps={updateOps}
        onRemoveRow={removeRow}
        readOnly={!canEdit}
      />
    </div>
  );
}

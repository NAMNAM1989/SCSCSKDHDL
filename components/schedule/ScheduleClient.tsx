"use client";

import { useSchedule } from "@/components/providers/ScheduleProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import {
  OPS_DAY_HEADER_EN,
  OPS_DAY_LABELS,
  OPS_KEYS,
} from "@/lib/schedule/constants";
import { appRowToFlight, formatUpdatedDateForExport } from "@/lib/schedule/exportHelpers";
import { exportFlightSchedule } from "@/lib/exportFlightSchedule";
import {
  fieldDiffersOrig,
  rowMatchesFilter,
} from "@/lib/schedule/rowModel";
import { buildPrintDocument } from "@/lib/schedule/print";
import { cn } from "@/lib/cn";
import { Menu, Printer, Trash2 } from "lucide-react";
import type { DragEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { FlightEditSheet } from "./FlightEditSheet";
import { OpsCell } from "./OpsCell";
import { ScheduleMobileCards } from "./ScheduleMobileCards";

/** Header kiểu bảng cut-off — xl/2xl: chữ lớn để đọc trên màn rộng */
const thCutoff =
  "border-b border-amber-800/85 bg-amber-400 px-0.5 py-1 align-bottom text-[8px] font-bold uppercase leading-tight tracking-tight text-slate-900 shadow-sm dark:border-amber-700 dark:bg-amber-600 dark:text-amber-950 lg:px-2 lg:py-2 lg:text-[11px] lg:leading-tight xl:px-2.5 xl:py-2.5 xl:text-xs xl:leading-snug 2xl:text-[13px]";

function Th({
  mobile,
  desktop,
  align = "left",
  className,
  title: titleAttr,
}: {
  mobile: string;
  desktop: string;
  align?: "left" | "center";
  className?: string;
  title?: string;
}) {
  const t =
    titleAttr ??
    (mobile === desktop ? desktop : `${desktop} — ${mobile}`);
  return (
    <th
      title={t}
      scope="col"
      className={cn(
        thCutoff,
        align === "center" && "text-center",
        className
      )}
    >
      <span className="lg:hidden">{mobile}</span>
      <span className="hidden lg:inline">{desktop}</span>
    </th>
  );
}

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
  } = useSchedule();
  const xlsxRef = useRef<HTMLInputElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [sheetRowId, setSheetRowId] = useState<string | null>(null);
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

  const handleAddFlight = useCallback(() => {
    const id = addRow();
    if (id) setSheetRowId(id);
  }, [addRow]);

  useEffect(() => {
    if (mode !== "search") return;
    requestAnimationFrame(() => {
      const wide = window.matchMedia("(min-width: 1024px)").matches;
      const id = wide ? "schedule-filter-dk" : "schedule-filter-mb";
      document.getElementById(id)?.focus();
    });
  }, [mode]);

  const handlePrint = useCallback(() => {
    const frame = document.createElement("iframe");
    frame.setAttribute("aria-hidden", "true");
    frame.style.position = "fixed";
    frame.style.right = "0";
    frame.style.bottom = "0";
    frame.style.width = "0";
    frame.style.height = "0";
    frame.style.border = "0";
    frame.style.opacity = "0";
    frame.style.pointerEvents = "none";
    document.body.appendChild(frame);

    const cleanup = () => {
      try {
        if (document.body.contains(frame)) document.body.removeChild(frame);
      } catch {
        /* ignore */
      }
    };

    const win = frame.contentWindow;
    if (!win) {
      cleanup();
      alert("Không thể khởi tạo vùng in PDF.");
      return;
    }

    const doc = win.document;
    doc.open();
    doc.write(buildPrintDocument(state));
    doc.close();

    const afterPrint = () => {
      win.removeEventListener("afterprint", afterPrint);
      cleanup();
    };
    win.addEventListener("afterprint", afterPrint);

    setTimeout(() => {
      try {
        win.focus();
        win.print();
      } catch {
        cleanup();
        alert("Không mở được hộp thoại in. Vui lòng thử lại.");
      }
    }, 180);
  }, [state]);

  const filtered = state.rows.filter((r) =>
    rowMatchesFilter(r, filter.trim().toLowerCase())
  );

  const exportExcel = async () => {
    const q = filter.trim().toLowerCase();
    const rowsToExport = !q
      ? state.rows
      : state.rows.filter((r) => rowMatchesFilter(r, q));
    const flights = rowsToExport.map(appRowToFlight);
    const ud = formatUpdatedDateForExport(state.meta.updatedDate || "08APR26");
    await exportFlightSchedule({ flights, updatedDate: ud });
  };

  const onDragStart = (e: DragEvent<HTMLTableRowElement>, id: string) => {
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
  };

  const onDrop = (e: DragEvent<HTMLTableRowElement>, toId: string) => {
    e.preventDefault();
    const fromId = e.dataTransfer.getData("text/plain");
    reorder(fromId, toId);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-x-hidden lg:min-h-0 lg:flex-1 lg:overflow-hidden">
      {/* Mobile: menu gập dạng panel nổi phía trên thanh đáy */}
      {menuOpen ? (
        <div className="fixed inset-x-2 bottom-[4.5rem] z-40 rounded-xl border border-zinc-200/90 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900/95 lg:hidden">
          <div className="grid grid-cols-2 gap-1.5 p-2 sm:gap-2">
            <Button
              variant="secondary"
              className="!min-h-9 !justify-center !text-xs"
              onClick={handlePrint}
            >
              <Printer className="mr-1 h-3.5 w-3.5" /> In PDF
            </Button>
            <Button
              variant="secondary"
              className="!min-h-9 !justify-center !text-xs"
              onClick={() => exportExcel().catch(alert)}
            >
              Export
            </Button>
            <Button
              variant="secondary"
              className="!min-h-9 !justify-center !text-xs"
              onClick={() => xlsxRef.current?.click()}
            >
              Import
            </Button>
            <Button
              variant="danger"
              className="!min-h-9 !justify-center !text-xs"
              onClick={() => {
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

      <main className="mx-auto flex min-h-0 w-full max-w-full flex-1 flex-col gap-2 pb-20 sm:max-w-2xl lg:mx-0 lg:max-w-none lg:min-h-0 lg:flex-1 lg:gap-3 lg:pb-0">
        {/* Desktop: một hàng — công cụ + Updated + Lọc + Thêm chuyến */}
        <div className="mb-1 hidden min-w-0 gap-3 rounded-2xl border border-zinc-200/90 bg-white p-3 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/50 lg:mb-3 lg:flex lg:flex-row lg:flex-wrap lg:items-center xl:flex-nowrap xl:gap-3">
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              className="!min-h-10 shrink-0 !rounded-xl !px-3 !text-sm !font-normal"
              onClick={handlePrint}
            >
              <Printer className="mr-1.5 h-3.5 w-3.5 shrink-0" /> In PDF
            </Button>
            <Button
              variant="secondary"
              className="!min-h-10 shrink-0 !rounded-xl !px-3 !text-sm !font-normal"
              onClick={() => exportExcel().catch(alert)}
            >
              Export Excel
            </Button>
            <Button
              variant="secondary"
              className="!min-h-10 shrink-0 !rounded-xl !px-3 !text-sm !font-normal"
              onClick={() => xlsxRef.current?.click()}
            >
              Import Excel
            </Button>
            <Button
              variant="danger"
              className="!min-h-10 shrink-0 !rounded-xl !px-3 !text-sm !font-normal"
              onClick={() => {
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
            onClick={handleAddFlight}
          >
            + Thêm chuyến
          </Button>
        </div>

        {/* Mobile: một hàng — menu + Updated/Lọc gọn */}
        <div className="flex shrink-0 flex-col gap-2 lg:hidden">
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

        <Card className="flex min-h-0 w-full min-w-0 flex-1 flex-col !overflow-hidden !rounded-lg !border-amber-700/35 !p-0 !shadow-sm dark:!border-slate-700 sm:!rounded-xl lg:!min-h-0 lg:!rounded-2xl lg:!shadow-md lg:!ring-1 lg:!ring-amber-600/25 dark:lg:!ring-amber-900/40">
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-x-3 gap-y-0.5 border-b border-amber-800/30 bg-slate-900 px-2.5 py-1.5 text-[11px] font-medium tabular-nums text-slate-200 dark:border-slate-800 dark:bg-slate-950 lg:px-4 lg:py-2 lg:text-xs xl:text-sm xl:py-2.5">
            <span className="text-amber-400/95">
              {filtered.length} dòng
              {filter.trim() ? " · lọc" : ""}
            </span>
            {filter.trim() && state.rows.length !== filtered.length ? (
              <span className="text-slate-500">{state.rows.length} trong bộ nhớ</span>
            ) : null}
          </div>
          <ScheduleMobileCards
            rows={filtered}
            onOpenRowEdit={(id) => setSheetRowId(id)}
            onRemoveRow={removeRow}
          />
          <div className="scrollbar-thin hidden min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto bg-slate-950 dark:bg-slate-950 lg:block lg:min-h-[min(70vh,880px)] xl:min-h-[min(75vh,920px)]">
            <table className="w-full min-w-0 table-fixed border-separate border-spacing-0 text-left text-[10px] text-slate-100 lg:text-xs xl:text-sm">
              <colgroup>
                <col className="w-9 xl:w-10" />
                <col className="w-10 xl:w-11" />
                <col className="w-[9%] xl:w-[9%]" />
                <col className="w-[7%]" />
                <col className="w-[12%] xl:w-[13%]" />
                <col className="w-[6%]" />
                <col className="w-[6%]" />
                <col className="w-[5%]" />
                <col className="w-[5%]" />
                <col className="w-[5%]" />
                <col className="w-[5%]" />
                <col className="w-[4.5%]" />
                <col className="w-[4.5%]" />
                <col className="w-[4.5%]" />
                <col className="w-[4.5%]" />
                <col className="w-[4.5%]" />
                <col className="w-[4.5%]" />
                <col className="w-[19%] xl:w-[20%]" />
                <col className="w-11 xl:w-12" />
              </colgroup>
              <thead>
                <tr className="sticky top-0 z-10">
                  <th
                    className={cn(thCutoff, "w-6 px-0")}
                    title="Giữ & kéo dòng để đổi thứ tự"
                  />
                  <Th mobile="#" desktop="#" title="Số thứ tự" />
                  <Th
                    mobile="Flt"
                    desktop="FLT"
                    title="Số hiệu chuyến bay (Flight)"
                  />
                  <Th mobile="A/C" desktop="A/C" title="Loại tàu bay (Aircraft)" />
                  <Th mobile="RTG" desktop="RTG" title="Routing / tuyến bay" />
                  <Th
                    mobile="STD"
                    desktop="STD"
                    title="STD — nhấn ô trong bảng để mở bảng chỉnh sửa chuyến"
                  />
                  <Th mobile="G" desktop="GEN" title="Gen time" />
                  <Th mobile="P" desktop="PER" title="Performance" />
                  <Th mobile="D" desktop="DOC" title="Documentation" />
                  <Th mobile="Tr" desktop="TRS" title="Transit" />
                  <Th mobile="B/U" desktop="R/U" title="Block / Uplift" />
                  {OPS_KEYS.map((d) => (
                    <th
                      key={d}
                      title={`OPS — ${OPS_DAY_LABELS[d]} (${d})`}
                      scope="col"
                      className={cn(
                        thCutoff,
                        "text-center text-[7px] lg:text-[10px] xl:text-xs"
                      )}
                    >
                      <span className="lg:hidden">{OPS_DAY_LABELS[d]}</span>
                      <span className="hidden lg:inline">
                        {OPS_DAY_HEADER_EN[d]}
                      </span>
                    </th>
                  ))}
                  <Th
                    mobile="Rm"
                    desktop="REMARK"
                    title="Remark / ghi chú"
                  />
                  <th
                    className={cn(thCutoff, "w-8 px-0")}
                    title="Xoá dòng"
                  />
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, idx) => (
                  <tr
                    key={row.id}
                    draggable
                    onDragStart={(e) =>
                      onDragStart(
                        e as unknown as DragEvent<HTMLTableRowElement>,
                        row.id
                      )
                    }
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) =>
                      onDrop(
                        e as unknown as DragEvent<HTMLTableRowElement>,
                        row.id
                      )
                    }
                    className="border-b border-slate-700/90 odd:bg-slate-900 even:bg-slate-950 hover:bg-slate-800/80 dark:border-slate-800 dark:odd:bg-slate-900 dark:even:bg-slate-950 dark:hover:bg-slate-800"
                  >
                    <td className="cursor-grab px-0.5 text-center text-slate-500" title="Kéo">
                      ⠿
                    </td>
                    <td className="min-w-0 px-0.5 text-center text-[10px] tabular-nums text-amber-100/90 lg:text-xs xl:text-sm">
                      {idx + 1}
                    </td>
                    {(["flt", "ac", "rtg"] as const).map((f) => (
                      <td key={f} className="min-w-0 px-0.5 py-0.5">
                        <div
                          title={String(row[f] ?? "")}
                          className="box-border w-full min-w-0 max-w-full truncate rounded border border-slate-700/80 bg-slate-800/60 px-1 py-0.5 text-[10px] text-amber-50/95 lg:px-1.5 lg:py-1 lg:text-xs xl:px-2 xl:py-1.5 xl:text-sm"
                        >
                          {String(row[f] ?? "")}
                        </div>
                      </td>
                    ))}
                    <td className="min-w-0 px-0.5 py-0.5">
                      <button
                        type="button"
                        title="Mở bảng chỉnh sửa chuyến (STD)"
                        onClick={() => setSheetRowId(row.id)}
                        className="box-border w-full min-w-0 max-w-full truncate rounded border border-amber-500/55 bg-amber-500/15 px-1 py-0.5 text-center text-[10px] font-semibold tabular-nums text-amber-100 shadow-sm transition hover:border-amber-400/80 hover:bg-amber-500/25 focus:outline-none focus:ring-2 focus:ring-amber-500/40 lg:px-1.5 lg:py-1 lg:text-xs xl:px-2 xl:py-1.5 xl:text-sm"
                      >
                        {String(row.std ?? "").trim() || "STD"}
                      </button>
                    </td>
                    {(["gen", "per", "doc", "transit", "bu"] as const).map(
                      (f) => (
                        <td key={f} className="min-w-0 px-0.5 py-0.5">
                          <div
                            title={String(row[f] ?? "")}
                            className={cn(
                              "box-border w-full min-w-0 max-w-full truncate rounded border px-1 py-0.5 text-[10px] lg:px-1.5 lg:py-1 lg:text-xs xl:px-2 xl:py-1.5 xl:text-sm",
                              fieldDiffersOrig(row, f)
                                ? "border-red-500 bg-red-950/50 text-red-200"
                                : "border-slate-700/80 bg-slate-800/60 text-amber-50/95"
                            )}
                          >
                            {String(row[f] ?? "")}
                          </div>
                        </td>
                      )
                    )}
                    {OPS_KEYS.map((d) => (
                        <td
                          key={d}
                          className="min-w-0 bg-slate-900/50 px-0 py-0.5 text-center align-middle"
                        >
                        <OpsCell
                          row={row}
                          day={d}
                          readOnly
                          onToggle={() => {}}
                          onText={() => {}}
                        />
                      </td>
                    ))}
                    <td className="min-w-0 px-0.5 py-0.5">
                      <div
                        title={row.remark}
                        className="box-border w-full min-w-0 max-w-full truncate rounded border border-slate-700/80 bg-slate-800/60 px-1 py-0.5 text-[10px] text-amber-50/90 lg:px-1.5 lg:py-1 lg:text-xs xl:px-2 xl:py-1.5 xl:text-sm"
                      >
                        {row.remark}
                      </div>
                    </td>
                    <td className="min-w-0 px-0 py-0.5 text-center">
                      <Button
                        variant="ghost"
                        className="!min-h-7 !min-w-7 !px-0 text-slate-500 hover:text-red-400"
                        onClick={() => {
                          if (confirm("Xoá dòng?")) removeRow(row.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
            onClick={handleAddFlight}
          >
            + Thêm chuyến
          </Button>
        </div>
      </div>

      <FlightEditSheet
        open={Boolean(sheetRowId && sheetRow)}
        onClose={() => setSheetRowId(null)}
        row={sheetRow}
        rowIndex={sheetRowIndex}
        onUpdateField={updateField}
        onUpdateOps={updateOps}
        onRemoveRow={removeRow}
      />
    </div>
  );
}

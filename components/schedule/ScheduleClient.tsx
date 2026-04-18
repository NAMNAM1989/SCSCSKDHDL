"use client";

import { useSchedule } from "@/components/providers/ScheduleProvider";
import { AppHeader } from "@/components/layout/AppHeader";
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
import { buildPrintHtml } from "@/lib/schedule/print";
import { cn } from "@/lib/cn";
import { Menu, Moon, Printer, Sun, Trash2 } from "lucide-react";
import { useTheme } from "next-themes";
import type { DragEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { OpsCell } from "./OpsCell";
import { ScheduleMobileCards } from "./ScheduleMobileCards";

/** Header kiểu bảng cut-off — desktop: chữ lớn hơn để đọc full màn hình */
const thCutoff =
  "border-b border-amber-800/85 bg-amber-400 px-0.5 py-1 align-bottom text-[8px] font-bold uppercase leading-tight tracking-tight text-slate-900 shadow-sm dark:border-amber-700 dark:bg-amber-600 dark:text-amber-950 lg:px-2 lg:py-2 lg:text-[11px] lg:leading-tight";

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
  const { theme, setTheme } = useTheme();
  const xlsxRef = useRef<HTMLInputElement>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (mode === "search") searchRef.current?.focus();
  }, [mode]);

  const handlePrint = useCallback(() => {
    if (printRef.current) {
      printRef.current.innerHTML = buildPrintHtml(state);
    }
    window.print();
  }, [state]);

  useEffect(() => {
    const fn = () => {
      if (printRef.current) printRef.current.innerHTML = buildPrintHtml(state);
    };
    window.addEventListener("beforeprint", fn);
    return () => window.removeEventListener("beforeprint", fn);
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
    <div className="flex min-h-0 flex-1 flex-col overflow-x-hidden pb-28 lg:min-h-0 lg:flex-1 lg:overflow-hidden lg:pb-0">
      <div ref={printRef} className="hidden print:block" aria-hidden />

      <AppHeader
        fullWidth
        className="border-amber-200/80 bg-gradient-to-r from-amber-50 via-white to-slate-50 dark:border-amber-900/40 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950"
        title="Bảng Cut-off SCSC"
        subtitle="SCSC / OPS / EXP"
        right={
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              className="!min-h-10 !min-w-10 !px-2"
              aria-label="Giao diện sáng / tối"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
            <Button
              variant="ghost"
              className="!min-h-10 !min-w-10 !px-2 lg:hidden"
              aria-label="Menu thao tác"
              onClick={() => setMenuOpen((o) => !o)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        }
      />

      {/* Desktop: thanh thao tác — full width cùng với bảng */}
      <div className="hidden border-b border-brand-100/90 bg-gradient-to-r from-brand-50/80 via-white to-emerald-50/70 dark:border-emerald-900/50 dark:from-slate-900 dark:via-slate-900/95 dark:to-emerald-950/30 lg:block">
        <div className="flex w-full min-w-0 flex-wrap items-center gap-2 px-4 py-2.5 lg:px-6">
          <Button
            variant="secondary"
            className="!min-h-9 shrink-0 !rounded !px-3 !text-sm !font-normal"
            onClick={handlePrint}
          >
            <Printer className="mr-1.5 h-3.5 w-3.5 shrink-0" /> In PDF
          </Button>
          <Button
            variant="secondary"
            className="!min-h-9 shrink-0 !rounded !px-3 !text-sm !font-normal"
            onClick={() => exportExcel().catch(alert)}
          >
            Export Excel
          </Button>
          <Button
            variant="secondary"
            className="!min-h-9 shrink-0 !rounded !px-3 !text-sm !font-normal"
            onClick={() => xlsxRef.current?.click()}
          >
            Import Excel
          </Button>
          <Button
            variant="danger"
            className="!min-h-9 shrink-0 !rounded !px-3 !text-sm !font-normal"
            onClick={() => {
              if (!confirm("Xoá toàn bộ nháp?")) return;
              if (!confirm("Xác nhận lần 2 — không hoàn tác.")) return;
              clearDraft();
            }}
          >
            <Trash2 className="mr-1.5 h-3.5 w-3.5 shrink-0" /> Xoá nháp
          </Button>
        </div>
      </div>

      {/* Mobile: menu gập */}
      {menuOpen ? (
        <div className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/80 lg:hidden">
          <div className="flex max-w-2xl flex-wrap gap-2 px-4 py-2.5">
            <Button variant="secondary" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" /> In PDF
            </Button>
            <Button variant="secondary" onClick={() => exportExcel().catch(alert)}>
              Export Excel
            </Button>
            <Button variant="secondary" onClick={() => xlsxRef.current?.click()}>
              Import Excel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (!confirm("Xoá toàn bộ nháp?")) return;
                if (!confirm("Xác nhận lần 2 — không hoàn tác.")) return;
                clearDraft();
                setMenuOpen(false);
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Xoá nháp
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

      <main className="mx-auto flex min-h-0 w-full max-w-md flex-1 flex-col gap-3 px-4 pt-3 lg:mx-0 lg:max-w-none lg:min-h-0 lg:flex-1 lg:gap-3 lg:px-6 lg:pt-4">
        <div className="grid shrink-0 gap-3 md:grid-cols-2 lg:gap-3">
          <Card>
            <label className="mb-1 block text-xs text-slate-600 dark:text-slate-400">
              Updated
            </label>
            <Input
              value={state.meta.updatedDate}
              onChange={(e) =>
                setMeta({ updatedDate: e.target.value.trim() || "08APR26" })
              }
              placeholder="08APR26"
              maxLength={12}
            />
          </Card>

          <Card>
            <label className="mb-1 block text-xs text-slate-600 dark:text-slate-400">
              {mode === "search" ? "Tìm chuyến" : "Lọc nhanh"}
            </label>
            <Input
              ref={mode === "search" ? searchRef : undefined}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Flt, A/C, RTG…"
            />
          </Card>
        </div>

        <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <Button
            variant="primary"
            className="w-full !bg-gradient-to-r !from-brand-600 !to-teal-600 !text-white hover:!from-brand-700 hover:!to-teal-700 sm:w-auto lg:min-h-9 lg:min-w-[180px] lg:!rounded-md lg:!text-sm dark:!from-brand-500 dark:!to-teal-600 dark:hover:!from-brand-600 dark:hover:!to-teal-700"
            onClick={addRow}
          >
            + Thêm chuyến
          </Button>
        </div>

        <Card className="flex min-h-0 flex-1 flex-col !overflow-hidden !rounded-md !border-amber-700/30 !p-0 !shadow-none dark:!border-slate-700 lg:!min-h-0 lg:!rounded-lg lg:!shadow-md lg:!ring-1 lg:!ring-amber-600/25 dark:lg:!ring-amber-900/40">
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-amber-800/30 bg-slate-900 px-3 py-1.5 text-[10px] font-medium text-slate-300 dark:border-slate-800 dark:bg-slate-950 lg:px-4 lg:py-2 lg:text-xs">
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
            onUpdateField={updateField}
            onUpdateOps={updateOps}
            onRemoveRow={removeRow}
          />
          <div className="scrollbar-thin hidden min-h-0 flex-1 overflow-x-hidden overflow-y-auto bg-slate-950 dark:bg-slate-950 lg:block lg:min-h-0">
            <table className="w-full min-w-0 table-fixed border-separate border-spacing-0 text-left text-[10px] text-slate-100 lg:text-xs">
              <colgroup>
                <col className="w-8" />
                <col className="w-9" />
                <col className="w-[8%]" />
                <col className="w-[6%]" />
                <col className="w-[11%]" />
                <col className="w-[5.5%]" />
                <col className="w-[5.5%]" />
                <col className="w-[4.5%]" />
                <col className="w-[4.5%]" />
                <col className="w-[4.5%]" />
                <col className="w-[4.5%]" />
                <col className="w-[4%]" />
                <col className="w-[4%]" />
                <col className="w-[4%]" />
                <col className="w-[4%]" />
                <col className="w-[4%]" />
                <col className="w-[4%]" />
                <col className="w-[18%]" />
                <col className="w-10" />
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
                    title="Scheduled time of departure"
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
                        "text-center text-[7px] lg:text-[10px]"
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
                    <td className="min-w-0 px-0.5 text-center text-[10px] tabular-nums text-amber-100/90 lg:text-xs">
                      {idx + 1}
                    </td>
                    {(["flt", "ac", "rtg"] as const).map((f) => (
                      <td key={f} className="min-w-0 px-0.5 py-0.5">
                        <input
                          title={String(row[f] ?? "")}
                          className={cn(
                            "box-border w-full min-w-0 max-w-full truncate rounded border border-slate-600 bg-slate-800/90 px-1 py-0.5 text-[10px] text-amber-50/95 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/30 lg:px-1.5 lg:py-1 lg:text-xs"
                          )}
                          value={String(row[f] ?? "")}
                          onChange={(e) => updateField(row.id, f, e.target.value)}
                        />
                      </td>
                    ))}
                    {(["std", "gen", "per", "doc", "transit", "bu"] as const).map(
                      (f) => (
                        <td key={f} className="min-w-0 px-0.5 py-0.5">
                          <input
                            key={`${row.id}-${f}-${row[f]}`}
                            title={String(row[f] ?? "")}
                            className={cn(
                              "box-border w-full min-w-0 max-w-full truncate rounded border px-1 py-0.5 text-[10px] focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/30 lg:px-1.5 lg:py-1 lg:text-xs",
                              fieldDiffersOrig(row, f)
                                ? "border-red-500 bg-red-950/50 text-red-200"
                                : "border-slate-600 bg-slate-800/90 text-amber-50/95"
                            )}
                            defaultValue={String(row[f] ?? "")}
                            onBlur={(e) => updateField(row.id, f, e.target.value)}
                          />
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
                          onToggle={() => {
                            const cur = row.ops[d] || "";
                            updateOps(
                              row.id,
                              d,
                              cur === "X" || cur === "x" ? "" : "X"
                            );
                          }}
                          onText={(val) => updateOps(row.id, d, val)}
                        />
                      </td>
                    ))}
                    <td className="min-w-0 px-0.5 py-0.5">
                      <input
                        title={row.remark}
                        className="box-border w-full min-w-0 max-w-full truncate rounded border border-slate-600 bg-slate-800/90 px-1 py-0.5 text-[10px] text-amber-50/90 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/25 lg:px-1.5 lg:py-1 lg:text-xs"
                        value={row.remark}
                        onChange={(e) => updateField(row.id, "remark", e.target.value)}
                      />
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
    </div>
  );
}

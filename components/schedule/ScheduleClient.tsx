"use client";

import { useSchedule } from "@/components/providers/ScheduleProvider";
import { AppHeader } from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { OPS_KEYS } from "@/lib/schedule/constants";
import { appRowToFlight, formatUpdatedDateForExport } from "@/lib/schedule/exportHelpers";
import { exportFlightSchedule } from "@/lib/exportFlightSchedule";
import {
  fieldDiffersOrig,
  rowMatchesFilter,
} from "@/lib/schedule/rowModel";
import { buildPrintHtml } from "@/lib/schedule/print";
import type { OpsKey, ScheduleRow } from "@/lib/schedule/types";
import { cn } from "@/lib/cn";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Moon, Printer, Sun, Trash2 } from "lucide-react";
import { useTheme } from "next-themes";
import type { DragEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

function OpsCell({
  row,
  day,
  onToggle,
  onText,
}: {
  row: ScheduleRow;
  day: OpsKey;
  onToggle: () => void;
  onText: (v: string) => void;
}) {
  const v = row.ops[day] ?? "";
  const textMode = v && v !== "X" && v !== "x";
  if (textMode) {
    return (
      <input
        className="w-14 min-w-[3rem] rounded-lg border border-amber-400/60 bg-slate-950/30 px-1 py-1 text-center text-[11px] text-slate-100 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        value={v}
        onChange={(e) => onText(e.target.value)}
      />
    );
  }
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.9 }}
      className={cn(
        "h-9 w-9 rounded-xl border text-xs font-bold",
        v === "X" || v === "x"
          ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-400"
          : "border-slate-600 bg-slate-800/50 text-slate-500"
      )}
      onClick={(e) => {
        if (e.shiftKey) {
          onText(" ");
          return;
        }
        onToggle();
      }}
      onDoubleClick={(e) => {
        e.preventDefault();
        onText(" ");
      }}
    >
      {v === "X" || v === "x" ? "X" : "·"}
    </motion.button>
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
    importJsonFile,
    importExcelFile,
    exportJson,
    clearDraft,
  } = useSchedule();
  const { theme, setTheme } = useTheme();
  const jsonRef = useRef<HTMLInputElement>(null);
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
    <div className="pb-28">
      <div ref={printRef} className="hidden print:block" aria-hidden />

      <AppHeader
        title="Flight Schedule"
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
              className="!min-h-10 !min-w-10 !px-2"
              aria-label="Menu thao tác"
              onClick={() => setMenuOpen((o) => !o)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        }
      />

      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-b border-slate-200/80 bg-slate-50/90 dark:border-slate-800 dark:bg-slate-900/50"
          >
            <div className="mx-auto flex max-w-2xl flex-wrap gap-2 px-4 py-3">
              <Button variant="secondary" onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" /> In PDF
              </Button>
              <Button variant="secondary" onClick={() => exportExcel().catch(alert)}>
                Export Excel
              </Button>
              <Button variant="secondary" onClick={exportJson}>
                Export JSON
              </Button>
              <Button variant="secondary" onClick={() => jsonRef.current?.click()}>
                Import JSON
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
          </motion.div>
        ) : null}
      </AnimatePresence>

      <input
        ref={jsonRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={async (e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (!f) return;
          if (!confirm("Thay thế toàn bộ dữ liệu bằng JSON?")) return;
          try {
            await importJsonFile(f);
          } catch (err) {
            alert(String(err));
          }
        }}
      />
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

      <main className="mx-auto max-w-2xl space-y-4 px-4 pt-4">
        <Card>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
            Updated
          </label>
          <Input
            value={state.meta.updatedDate}
            onChange={(e) => setMeta({ updatedDate: e.target.value.trim() || "08APR26" })}
            placeholder="08APR26"
            maxLength={12}
          />
        </Card>

        <Card>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
            {mode === "search" ? "Tìm chuyến" : "Lọc nhanh"}
          </label>
          <Input
            ref={mode === "search" ? searchRef : undefined}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Flt, A/C, RTG…"
          />
        </Card>

        <div className="flex gap-2">
          <Button variant="primary" className="flex-1" onClick={addRow}>
            + Thêm chuyến
          </Button>
        </div>

        <p className="text-[13px] leading-relaxed text-slate-500 dark:text-slate-400">
          Ô đỏ: khác mẫu gốc sau khi đổi STD. OPS: tap = X; Shift+tap / double = gõ giờ.
        </p>

        <Card className="!p-0 overflow-hidden">
          <div className="scrollbar-thin max-h-[min(70vh,560px)] overflow-auto">
            <table className="w-max min-w-full border-separate border-spacing-0 text-left text-[13px]">
              <thead>
                <tr className="sticky top-0 z-10 bg-slate-100/95 text-[10px] font-bold uppercase tracking-wider text-amber-700 backdrop-blur dark:bg-slate-900/95 dark:text-amber-400">
                  <th className="border-b border-amber-500/40 px-1 py-2" />
                  <th className="border-b border-amber-500/40 px-1 py-2">#</th>
                  <th className="border-b border-amber-500/40 px-1 py-2">Flt</th>
                  <th className="border-b border-amber-500/40 px-1 py-2">A/C</th>
                  <th className="border-b border-amber-500/40 px-1 py-2">RTG</th>
                  <th className="border-b border-amber-500/40 px-1 py-2">STD</th>
                  <th className="border-b border-amber-500/40 px-1 py-2">G</th>
                  <th className="border-b border-amber-500/40 px-1 py-2">P</th>
                  <th className="border-b border-amber-500/40 px-1 py-2">D</th>
                  <th className="border-b border-amber-500/40 px-1 py-2">Tr</th>
                  <th className="border-b border-amber-500/40 px-1 py-2">B/U</th>
                  {OPS_KEYS.map((d) => (
                    <th
                      key={d}
                      className="border-b border-amber-500/40 px-0.5 py-2 text-center"
                    >
                      {d.slice(0, 1).toUpperCase()}
                    </th>
                  ))}
                  <th className="border-b border-amber-500/40 px-1 py-2">Rm</th>
                  <th className="border-b border-amber-500/40 px-1 py-2" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, idx) => (
                  <motion.tr
                    key={row.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
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
                    className="border-b border-slate-200/80 odd:bg-white/40 even:bg-slate-50/50 dark:border-slate-800 dark:odd:bg-slate-900/20 dark:even:bg-slate-900/40"
                  >
                    <td className="cursor-grab px-1 text-slate-500" title="Kéo">
                      ⠿
                    </td>
                    <td className="px-1 text-slate-500">{idx + 1}</td>
                    {(["flt", "ac", "rtg"] as const).map((f) => (
                      <td key={f} className="px-0.5 py-1">
                        <input
                          className={cn(
                            "w-full min-w-[3rem] max-w-[5.5rem] rounded-lg border border-slate-600/60 bg-slate-950/20 px-1 py-1 text-[12px] text-slate-100 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                          )}
                          value={String(row[f] ?? "")}
                          onChange={(e) => updateField(row.id, f, e.target.value)}
                        />
                      </td>
                    ))}
                    {(["std", "gen", "per", "doc", "transit", "bu"] as const).map(
                      (f) => (
                        <td key={f} className="px-0.5 py-1">
                          <input
                            key={`${row.id}-${f}-${row[f]}`}
                            className={cn(
                              "w-full min-w-[3rem] max-w-[5.5rem] rounded-lg border px-1 py-1 text-[12px] focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500",
                              fieldDiffersOrig(row, f)
                                ? "border-red-400/80 bg-red-500/10 text-red-100"
                                : "border-slate-600/60 bg-slate-950/20 text-slate-100"
                            )}
                            defaultValue={String(row[f] ?? "")}
                            onBlur={(e) => updateField(row.id, f, e.target.value)}
                          />
                        </td>
                      )
                    )}
                    {OPS_KEYS.map((d) => (
                      <td key={d} className="px-0.5 py-1 text-center">
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
                    <td className="px-0.5 py-1">
                      <input
                        className="w-24 max-w-[8rem] rounded-lg border border-slate-600/60 bg-slate-950/20 px-1 py-1 text-[12px] focus:border-brand-500 focus:outline-none"
                        value={row.remark}
                        onChange={(e) => updateField(row.id, "remark", e.target.value)}
                      />
                    </td>
                    <td className="px-0.5">
                      <Button
                        variant="ghost"
                        className="!min-h-9 !min-w-9 !px-0 text-slate-400 hover:text-red-500"
                        onClick={() => {
                          if (confirm("Xoá dòng?")) removeRow(row.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </main>
    </div>
  );
}

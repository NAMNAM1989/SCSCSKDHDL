"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { OPS_DAY_LABELS, OPS_KEYS } from "@/lib/schedule/constants";
import { fieldDiffersOrig } from "@/lib/schedule/rowModel";
import type { OpsKey, ScheduleRow } from "@/lib/schedule/types";
import { cn } from "@/lib/cn";
import { Trash2 } from "lucide-react";
import { OpsCell } from "./OpsCell";

type Props = {
  rows: ScheduleRow[];
  onUpdateField: (id: string, field: keyof ScheduleRow, value: string) => void;
  onUpdateOps: (id: string, day: OpsKey, value: string) => void;
  onRemoveRow: (id: string) => void;
};

/** Một cột dọc, không cuộn ngang — thay bảng rộng trên mobile */
export function ScheduleMobileCards({
  rows,
  onUpdateField,
  onUpdateOps,
  onRemoveRow,
}: Props) {
  return (
    <div className="flex w-full min-w-0 flex-col gap-3 lg:hidden">
      {rows.map((row, idx) => (
        <Card
          key={row.id}
          className="w-full min-w-0 overflow-hidden border-slate-200/90 p-3 dark:border-slate-700"
        >
          <div className="flex items-start gap-2 border-b border-slate-100 pb-2 dark:border-slate-800">
            <span className="shrink-0 pt-2 text-[11px] font-medium text-slate-500 dark:text-slate-400">
              #{idx + 1}
            </span>
            <div className="min-w-0 flex-1">
              <label className="mb-0.5 block text-[10px] uppercase text-slate-500">
                FLT
              </label>
              <Input
                className="!min-h-10 !text-[15px]"
                value={String(row.flt ?? "")}
                onChange={(e) => onUpdateField(row.id, "flt", e.target.value)}
              />
            </div>
            <Button
              variant="ghost"
              className="!min-h-9 !min-w-9 shrink-0 !p-0 text-slate-400 hover:text-red-500"
              aria-label="Xoá dòng"
              onClick={() => {
                if (confirm("Xoá dòng?")) onRemoveRow(row.id);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <div>
              <label className="mb-0.5 block text-[10px] uppercase text-slate-500">
                A/C
              </label>
              <Input
                className="!min-h-10 !text-[15px]"
                value={String(row.ac ?? "")}
                onChange={(e) => onUpdateField(row.id, "ac", e.target.value)}
              />
            </div>
            <div>
              <label className="mb-0.5 block text-[10px] uppercase text-slate-500">
                RTG
              </label>
              <Input
                className="!min-h-10 !text-[15px]"
                value={String(row.rtg ?? "")}
                onChange={(e) => onUpdateField(row.id, "rtg", e.target.value)}
              />
            </div>
            <div className="col-span-2">
              <label className="mb-0.5 block text-[10px] uppercase text-slate-500">
                STD
              </label>
              <Input
                className="!min-h-10 !text-[15px]"
                value={String(row.std ?? "")}
                onChange={(e) => onUpdateField(row.id, "std", e.target.value)}
              />
            </div>
          </div>

          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {(
              [
                ["gen", "Gen"],
                ["per", "Per"],
                ["doc", "Doc"],
                ["transit", "Tr"],
                ["bu", "B/U"],
              ] as const
            ).map(([key, lab]) => (
              <div key={key} className="min-w-0">
                <label className="mb-0.5 block text-[10px] uppercase text-slate-500">
                  {lab}
                </label>
                <input
                  defaultValue={String(row[key] ?? "")}
                  title={String(row[key] ?? "")}
                  onBlur={(e) => onUpdateField(row.id, key, e.target.value)}
                  className={cn(
                    "w-full min-w-0 rounded-md border px-2 py-2 text-[14px] focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-400/40",
                    fieldDiffersOrig(row, key)
                      ? "border-red-400 bg-red-50 text-red-900 dark:border-red-500 dark:bg-red-950/40 dark:text-red-100"
                      : "border-slate-200 bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                  )}
                />
              </div>
            ))}
          </div>

          <div className="mt-3">
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-800 dark:text-emerald-300">
              OPS (tuần)
            </p>
            <div className="grid w-full min-w-0 grid-cols-7 gap-1">
              {OPS_KEYS.map((d) => (
                <div
                  key={d}
                  className="flex min-w-0 flex-col items-center gap-0.5"
                >
                  <span className="text-[9px] font-medium text-slate-500 dark:text-slate-400">
                    {OPS_DAY_LABELS[d]}
                  </span>
                  <OpsCell
                    row={row}
                    day={d}
                    onToggle={() => {
                      const cur = row.ops[d] || "";
                      onUpdateOps(
                        row.id,
                        d,
                        cur === "X" || cur === "x" ? "" : "X"
                      );
                    }}
                    onText={(val) => onUpdateOps(row.id, d, val)}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3">
            <label className="mb-0.5 block text-[10px] uppercase text-slate-500">
              Ghi chú
            </label>
            <Input
              className="!min-h-10 !text-[15px]"
              value={row.remark}
              onChange={(e) => onUpdateField(row.id, "remark", e.target.value)}
            />
          </div>
        </Card>
      ))}
    </div>
  );
}

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

const fieldIn =
  "w-full min-w-0 rounded-lg border px-2 py-1.5 text-[15px] leading-snug focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20";

/** Thẻ chuyến gọn — dễ quét, ít khoảng trống dọc */
export function ScheduleMobileCards({
  rows,
  onUpdateField,
  onUpdateOps,
  onRemoveRow,
}: Props) {
  return (
    <div className="flex w-full min-w-0 flex-col gap-2 pb-1 lg:hidden">
      {rows.map((row, idx) => (
        <Card
          key={row.id}
          className="overflow-hidden border border-zinc-200/80 bg-white p-0 shadow-sm dark:border-zinc-700/80 dark:bg-zinc-900"
        >
          <div className="flex items-center gap-2 border-b border-zinc-100 bg-zinc-50/80 px-2.5 py-2 dark:border-zinc-800 dark:bg-zinc-900/50">
            <span className="shrink-0 rounded-md bg-brand-600/10 px-1.5 py-0.5 text-[11px] font-bold tabular-nums text-brand-800 dark:bg-brand-500/15 dark:text-brand-200">
              #{idx + 1}
            </span>
            <div className="min-w-0 flex-1">
              <label className="sr-only">FLT</label>
              <Input
                className="!min-h-9 border-zinc-200 !text-[15px] font-medium dark:border-zinc-600"
                placeholder="FLT"
                value={String(row.flt ?? "")}
                onChange={(e) => onUpdateField(row.id, "flt", e.target.value)}
              />
            </div>
            <Button
              variant="ghost"
              className="!h-9 !min-h-9 !w-9 shrink-0 !p-0 text-zinc-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400"
              aria-label="Xoá dòng"
              onClick={() => {
                if (confirm("Xoá dòng?")) onRemoveRow(row.id);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2 px-2.5 py-2">
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  ["ac", "A/C"],
                  ["rtg", "RTG"],
                ] as const
              ).map(([key, lab]) => (
                <div key={key} className="min-w-0">
                  <label className="mb-0.5 block text-[10px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    {lab}
                  </label>
                  <Input
                    className="!min-h-9 !text-[15px]"
                    value={String(row[key] ?? "")}
                    onChange={(e) => onUpdateField(row.id, key, e.target.value)}
                  />
                </div>
              ))}
            </div>
            <div className="min-w-0">
              <label className="mb-0.5 block text-[10px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                STD
              </label>
              <Input
                className="!min-h-9 !text-[15px]"
                value={String(row.std ?? "")}
                onChange={(e) => onUpdateField(row.id, "std", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-3 gap-1.5">
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
                  <label className="mb-0.5 block text-[9px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    {lab}
                  </label>
                  <input
                    defaultValue={String(row[key] ?? "")}
                    title={String(row[key] ?? "")}
                    onBlur={(e) => onUpdateField(row.id, key, e.target.value)}
                    className={cn(
                      fieldIn,
                      fieldDiffersOrig(row, key)
                        ? "border-red-400 bg-red-50 text-red-900 dark:border-red-500 dark:bg-red-950/50 dark:text-red-100"
                        : "border-zinc-200 bg-white text-zinc-900 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
                    )}
                  />
                </div>
              ))}
            </div>

            <div className="rounded-lg border border-emerald-200/60 bg-emerald-50/40 px-2 py-1.5 dark:border-emerald-900/50 dark:bg-emerald-950/20">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-900 dark:text-emerald-300/95">
                OPS tuần
              </p>
              <div className="grid grid-cols-7 gap-0.5">
                {OPS_KEYS.map((d) => (
                  <div
                    key={d}
                    className="flex min-w-0 flex-col items-center gap-0.5"
                  >
                    <span className="w-full truncate text-center text-[8px] font-semibold uppercase leading-none text-zinc-500 dark:text-zinc-400">
                      {OPS_DAY_LABELS[d]}
                    </span>
                    <div className="flex w-full justify-center">
                      <OpsCell
                        row={row}
                        day={d}
                        compact
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
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-0.5 block text-[10px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Ghi chú
              </label>
              <Input
                className="!min-h-9 !text-[15px]"
                value={row.remark}
                onChange={(e) =>
                  onUpdateField(row.id, "remark", e.target.value)
                }
              />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

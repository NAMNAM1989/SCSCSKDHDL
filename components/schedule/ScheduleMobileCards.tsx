"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { OPS_DAY_LABELS, OPS_KEYS } from "@/lib/schedule/constants";
import type { ScheduleRow } from "@/lib/schedule/types";
import { cn } from "@/lib/cn";
import { Clock, Trash2 } from "lucide-react";
import { OpsCell } from "./OpsCell";

type Props = {
  rows: ScheduleRow[];
  /** Mở bảng chỉnh sửa (STD là điểm vào chính) */
  onOpenRowEdit: (id: string) => void;
  onRemoveRow: (id: string) => void;
};

/** Thẻ chuyến gọn — chỉnh sửa qua ô STD / nút mở bảng */
export function ScheduleMobileCards({
  rows,
  onOpenRowEdit,
  onRemoveRow,
}: Props) {
  return (
    <div className="flex w-full min-w-0 flex-col gap-2 pb-1 lg:hidden">
      {rows.map((row, idx) => (
        <Card
          key={row.id}
          className="overflow-hidden border border-zinc-200/80 bg-white p-0 shadow-sm dark:border-zinc-700/80 dark:bg-zinc-900"
        >
          <div className="flex flex-col gap-2 px-2.5 py-2.5">
            <div className="flex items-start gap-2">
              <span className="mt-0.5 shrink-0 rounded-md bg-brand-600/10 px-1.5 py-0.5 text-[11px] font-bold tabular-nums text-brand-800 dark:bg-brand-500/15 dark:text-brand-200">
                #{idx + 1}
              </span>
              <div className="min-w-0 flex-1 space-y-1">
                <p className="truncate text-[15px] font-semibold text-zinc-900 dark:text-zinc-50">
                  {row.flt?.trim() || "— chưa có FLT —"}
                </p>
                <div className="flex flex-wrap gap-1 text-[11px] text-zinc-600 dark:text-zinc-400">
                  {row.ac ? (
                    <span className="rounded bg-zinc-100 px-1.5 py-0.5 dark:bg-zinc-800">
                      {row.ac}
                    </span>
                  ) : null}
                  {row.rtg ? (
                    <span className="rounded bg-zinc-100 px-1.5 py-0.5 dark:bg-zinc-800">
                      {row.rtg}
                    </span>
                  ) : null}
                </div>
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

            <button
              type="button"
              onClick={() => onOpenRowEdit(row.id)}
              className={cn(
                "flex w-full items-center justify-center gap-2 rounded-xl border-2 border-brand-500/45 bg-gradient-to-br from-brand-500/12 to-violet-500/10 px-3 py-2.5 text-left shadow-sm transition hover:border-brand-500/70 hover:from-brand-500/18 hover:to-violet-500/15 active:scale-[0.99] dark:border-brand-500/40 dark:from-brand-500/15 dark:to-violet-950/30"
              )}
            >
              <Clock className="h-5 w-5 shrink-0 text-brand-600 dark:text-brand-300" />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-800/90 dark:text-brand-200/95">
                  STD — chạm để sửa chuyến
                </p>
                <p className="truncate text-lg font-bold tabular-nums text-zinc-900 dark:text-zinc-50">
                  {row.std?.trim() || "—"}
                </p>
              </div>
            </button>

            <div className="rounded-lg border border-zinc-200/80 bg-zinc-50/80 px-2 py-1.5 dark:border-zinc-700/80 dark:bg-zinc-950/40">
              <p className="mb-1 text-[9px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                OPS (xem nhanh)
              </p>
              <div className="grid grid-cols-7 gap-0.5">
                {OPS_KEYS.map((d) => (
                  <div
                    key={d}
                    className="flex min-w-0 flex-col items-center gap-0.5"
                  >
                    <span className="w-full truncate text-center text-[7px] font-semibold uppercase leading-none text-zinc-500 dark:text-zinc-500">
                      {OPS_DAY_LABELS[d]}
                    </span>
                    <div className="flex w-full justify-center">
                      <OpsCell
                        row={row}
                        day={d}
                        compact
                        readOnly
                        onToggle={() => {}}
                        onText={() => {}}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {row.remark?.trim() ? (
              <p className="line-clamp-2 border-t border-zinc-100 pt-1.5 text-[12px] leading-snug text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
                {row.remark}
              </p>
            ) : null}
          </div>
        </Card>
      ))}
    </div>
  );
}

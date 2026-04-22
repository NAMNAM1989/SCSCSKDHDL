"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { OPS_DAY_LABELS, OPS_KEYS } from "@/lib/schedule/constants";
import { fieldDiffersOrig } from "@/lib/schedule/rowModel";
import {
  mobileCardSeasonClass,
  mobileCardShellClass,
  mobileMetaChipClass,
  mobileOpsPanelClass,
  mobileRemarkButtonClass,
  mobileStdButtonClass,
  mobileSttBadgeClass,
} from "@/lib/schedule/season";
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

const CUTOFF_KEYS = [
  ["gen", "G"],
  ["per", "P"],
  ["doc", "D"],
  ["transit", "Tr"],
  ["bu", "B/U"],
] as const;

function cutOffLineParts(row: ScheduleRow) {
  return CUTOFF_KEYS.map(([key, label]) => {
    const v = String(row[key] ?? "").trim();
    if (!v) return null;
    return (
      <span
        key={key}
        className={cn(
          "whitespace-nowrap",
          fieldDiffersOrig(row, key) &&
            "rounded bg-red-100 px-0.5 font-medium text-red-800 dark:bg-red-950/60 dark:text-red-200"
        )}
      >
        {label} {v}
      </span>
    );
  }).filter(Boolean);
}

/** Thẻ chuyến mobile — đủ thông tin: cut-off, OPS gọn, ghi chú luôn hiển thị */
export function ScheduleMobileCards({
  rows,
  onOpenRowEdit,
  onRemoveRow,
}: Props) {
  return (
    <div className="flex w-full min-w-0 flex-col gap-2 pb-1 lg:hidden">
      {rows.map((row, idx) => {
        const cutParts = cutOffLineParts(row);
        return (
          <Card
            key={row.id}
            className={cn(
              "overflow-hidden border border-zinc-200/80 p-0 shadow-sm dark:border-zinc-700/80",
              mobileCardShellClass(row),
              mobileCardSeasonClass(row)
            )}
          >
            <div className="flex flex-col gap-2 px-2.5 py-2.5">
              <div className="flex items-start gap-2">
                <span
                  className={cn(
                    "mt-0.5 shrink-0 rounded-md px-1.5 py-0.5 text-[11px] font-bold tabular-nums",
                    mobileSttBadgeClass(row)
                  )}
                >
                  #{idx + 1}
                </span>
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="text-[15px] font-semibold leading-snug text-zinc-900 dark:text-zinc-50">
                    {row.flt?.trim() || "— chưa có FLT —"}
                  </p>
                  <div className="flex flex-wrap gap-1 text-[11px] text-zinc-600 dark:text-zinc-400">
                    {row.ac ? (
                      <span
                        className={cn(
                          "rounded px-1.5 py-0.5",
                          mobileMetaChipClass(row)
                        )}
                      >
                        {row.ac}
                      </span>
                    ) : null}
                    {row.rtg ? (
                      <span
                        className={cn(
                          "rounded px-1.5 py-0.5",
                          mobileMetaChipClass(row)
                        )}
                      >
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
                  "flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-left active:scale-[0.99]",
                  mobileStdButtonClass(row)
                )}
              >
                <Clock
                  className={cn(
                    "h-5 w-5 shrink-0",
                    row.season === "winter"
                      ? "text-sky-600 dark:text-sky-300"
                      : "text-red-600 dark:text-red-300"
                  )}
                />
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "text-[10px] font-semibold uppercase tracking-wide",
                      row.season === "winter"
                        ? "text-sky-900/90 dark:text-sky-200/95"
                        : "text-red-900/90 dark:text-red-200/95"
                    )}
                  >
                    STD — chạm để sửa chuyến
                  </p>
                  <p className="truncate text-lg font-bold tabular-nums text-zinc-900 dark:text-zinc-50">
                    {row.std?.trim() || "—"}
                  </p>
                </div>
              </button>

              {cutParts.length > 0 ? (
                <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 text-[10px] leading-tight text-zinc-600 dark:text-zinc-400">
                  <span className="shrink-0 font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-500">
                    Cut-off:
                  </span>
                  {cutParts.map((el, i) => (
                    <span key={i} className="flex items-baseline gap-x-1.5">
                      {i > 0 ? (
                        <span className="text-zinc-300 dark:text-zinc-600" aria-hidden>
                          ·
                        </span>
                      ) : null}
                      {el}
                    </span>
                  ))}
                </div>
              ) : null}

              <div
                className={cn(
                  "rounded-lg border px-1.5 py-1",
                  mobileOpsPanelClass(row)
                )}
              >
                <p
                  className={cn(
                    "mb-0.5 px-0.5 text-[8px] font-semibold uppercase tracking-wide",
                    row.season === "winter"
                      ? "text-sky-800/80 dark:text-sky-300/90"
                      : "text-red-800/80 dark:text-red-300/90"
                  )}
                >
                  OPS (xem nhanh)
                </p>
                <div className="grid w-full grid-cols-7 gap-0">
                  {OPS_KEYS.map((d) => (
                    <div
                      key={d}
                      className="flex min-w-0 flex-col items-stretch gap-px"
                    >
                      <span className="truncate text-center text-[6.5px] font-semibold uppercase leading-none text-zinc-500 dark:text-zinc-500">
                        {OPS_DAY_LABELS[d]}
                      </span>
                      <div className="flex w-full justify-center">
                        <OpsCell
                          row={row}
                          day={d}
                          compact
                          dense
                          readOnly
                          onToggle={() => {}}
                          onText={() => {}}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => onOpenRowEdit(row.id)}
                className={cn(
                  "w-full rounded-lg border px-2 py-1.5 text-left transition",
                  mobileRemarkButtonClass(row)
                )}
              >
                <p className="mb-1 text-[9px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  Ghi chú
                </p>
                <p
                  className={cn(
                    "max-h-28 overflow-y-auto whitespace-pre-wrap break-words text-[13px] leading-snug",
                    row.remark?.trim()
                      ? "min-h-[2.75rem] text-zinc-800 dark:text-zinc-200"
                      : "min-h-[2.5rem] text-zinc-400 italic dark:text-zinc-500"
                  )}
                >
                  {row.remark?.trim() ||
                    "Chưa có ghi chú — chạm để mở form sửa chuyến."}
                </p>
              </button>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

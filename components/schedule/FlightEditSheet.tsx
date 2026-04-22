"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { OPS_DAY_LABELS, OPS_KEYS } from "@/lib/schedule/constants";
import { fieldDiffersOrig } from "@/lib/schedule/rowModel";
import type { OpsKey, ScheduleRow } from "@/lib/schedule/types";
import { smartFormatTimeCell } from "@/lib/schedule/time";
import { cn } from "@/lib/cn";
import { X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { OpsCell } from "./OpsCell";

const fieldIn =
  "w-full min-w-0 rounded-lg border px-2 py-1.5 text-[15px] leading-snug focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20";

type Props = {
  open: boolean;
  onClose: () => void;
  row: ScheduleRow | null;
  /** Số thứ tự hiển thị (1-based) */
  rowIndex: number;
  onUpdateField: (id: string, field: keyof ScheduleRow, value: string) => void;
  onUpdateOps: (id: string, day: OpsKey, value: string) => void;
  onRemoveRow: (id: string) => void;
};

export function FlightEditSheet({
  open,
  onClose,
  row,
  rowIndex,
  onUpdateField,
  onUpdateOps,
  onRemoveRow,
}: Props) {
  /** STD: không gọi `smartFormatTimeCell` mỗi phím (tránh nhảy con trỏ) — chỉ commit khi blur / đóng */
  const [stdDraft, setStdDraft] = useState("");
  const stdFocusedRef = useRef(false);
  const stdDraftRef = useRef("");
  stdDraftRef.current = stdDraft;

  useEffect(() => {
    if (!open || !row) return;
    if (stdFocusedRef.current) return;
    setStdDraft(String(row.std ?? ""));
  }, [open, row?.id, row?.std]);

  /** Trùng với blur — chỉ gọi khi chuẩn hoá khác `row.std` (provider cũng no-op, tránh gọi thừa) */
  const commitStd = useCallback(() => {
    if (!row) return;
    if (
      smartFormatTimeCell(stdDraftRef.current) ===
      smartFormatTimeCell(row.std ?? "")
    ) {
      return;
    }
    onUpdateField(row.id, "std", stdDraftRef.current);
  }, [row, onUpdateField]);

  const handleClose = useCallback(() => {
    commitStd();
    onClose();
  }, [commitStd, onClose]);

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "Escape") handleClose();
    },
    [open, handleClose]
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener("keydown", handleKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = prev;
    };
  }, [open, handleKey]);

  if (!open || !row) return null;

  const remove = () => {
    if (!confirm("Xoá chuyến này?")) return;
    onRemoveRow(row.id);
    onClose();
  };

  /** Portal ra `body` — tránh `motion.main` (transform) làm `fixed` lệch / bị cắt bởi overflow */
  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="flight-edit-title"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        className={cn(
          "flex max-h-[min(92vh,900px)] w-full max-w-lg flex-col rounded-t-2xl border bg-white shadow-2xl sm:max-h-[90vh] sm:rounded-2xl",
          row.season === "winter"
            ? "border-sky-400/40 ring-2 ring-sky-500/15 dark:border-sky-600/45 dark:bg-zinc-900 dark:ring-sky-400/20"
            : "border-red-400/35 ring-2 ring-red-500/12 dark:border-red-900/40 dark:bg-zinc-900 dark:ring-red-500/15"
        )}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-zinc-200 px-4 pb-3 pt-4 dark:border-zinc-700">
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Chuyến #{rowIndex}
            </p>
            <h2
              id="flight-edit-title"
              className="truncate text-lg font-semibold text-zinc-900 dark:text-zinc-50"
            >
              {row.flt?.trim() ? row.flt.trim() : "Chuyến mới"}
            </h2>
            <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
              STD là mục chính — chỉnh sửa đầy đủ bên dưới
            </p>
          </div>
          <button
            type="button"
            className="shrink-0 rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            aria-label="Đóng"
            onClick={handleClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto px-4 py-3">
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {(
                [
                  ["flt", "FLT"],
                  ["ac", "A/C"],
                  ["rtg", "RTG"],
                ] as const
              ).map(([key, lab]) => (
                <div key={key} className="min-w-0">
                  <label className="mb-0.5 block text-[10px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    {lab}
                  </label>
                  <Input
                    className="!min-h-10 !text-[15px]"
                    value={String(row[key] ?? "")}
                    onChange={(e) => onUpdateField(row.id, key, e.target.value)}
                  />
                </div>
              ))}
            </div>

            <div>
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Mùa lịch bay
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onUpdateField(row.id, "season", "summer")}
                  className={cn(
                    "rounded-xl border-2 px-3 py-2.5 text-left transition",
                    row.season === "summer"
                      ? "border-red-500 bg-gradient-to-br from-red-50 to-orange-50/80 text-red-950 shadow-sm dark:border-red-400 dark:from-red-950/50 dark:to-zinc-900 dark:text-red-100"
                      : "border-zinc-200 bg-zinc-50 text-zinc-600 hover:border-red-300/60 dark:border-zinc-600 dark:bg-zinc-800/40 dark:text-zinc-400"
                  )}
                >
                  <span className="block text-[13px] font-semibold">Mùa hè</span>
                  <span className="text-[10px] text-red-800/80 dark:text-red-200/80">
                    Viền & tô đỏ
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateField(row.id, "season", "winter")}
                  className={cn(
                    "rounded-xl border-2 px-3 py-2.5 text-left transition",
                    row.season === "winter"
                      ? "border-sky-500 bg-gradient-to-br from-sky-50 to-indigo-50/70 text-sky-950 shadow-sm dark:border-sky-400 dark:from-sky-950/45 dark:to-zinc-900 dark:text-sky-100"
                      : "border-zinc-200 bg-zinc-50 text-zinc-600 hover:border-sky-300/60 dark:border-zinc-600 dark:bg-zinc-800/40 dark:text-zinc-400"
                  )}
                >
                  <span className="block text-[13px] font-semibold">Mùa đông</span>
                  <span className="text-[10px] text-sky-800/80 dark:text-sky-200/80">
                    Viền & tô xanh
                  </span>
                </button>
              </div>
            </div>

            <div className="rounded-xl border-2 border-brand-500/40 bg-brand-50/50 p-3 dark:border-brand-500/35 dark:bg-brand-950/25">
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-brand-800 dark:text-brand-200">
                STD (giờ khởi hành)
              </label>
              <Input
                className="!min-h-11 !border-brand-400/60 !text-lg !font-semibold tabular-nums dark:!border-brand-500/50"
                placeholder="VD: 0845 hoặc 0920"
                value={stdDraft}
                onChange={(e) => setStdDraft(e.target.value)}
                onFocus={() => {
                  stdFocusedRef.current = true;
                }}
                onBlur={() => {
                  stdFocusedRef.current = false;
                  commitStd();
                }}
                autoFocus
              />
            </div>

            <div>
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Cut-off (GEN / PER / DOC / TR / B/U)
              </p>
              <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-5">
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
                      key={`${row.id}-${key}-${row[key]}`}
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
            </div>

            <div className="rounded-lg border border-emerald-200/60 bg-emerald-50/40 px-2.5 py-2 dark:border-emerald-900/50 dark:bg-emerald-950/20">
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-900 dark:text-emerald-300/95">
                OPS tuần
              </p>
              <div className="grid grid-cols-7 gap-1">
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
                className="!min-h-10 !text-[15px]"
                value={row.remark}
                onChange={(e) =>
                  onUpdateField(row.id, "remark", e.target.value)
                }
              />
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2 border-t border-zinc-200 px-4 py-3 dark:border-zinc-700">
          <Button
            variant="danger"
            className="!min-h-10"
            type="button"
            onClick={remove}
          >
            Xoá chuyến
          </Button>
          <Button
            variant="primary"
            className="min-w-[120px] flex-1 !min-h-10 sm:flex-none"
            type="button"
            onClick={handleClose}
          >
            Xong
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}

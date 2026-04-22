"use client";

import { Button } from "@/components/ui/Button";
import { OPS_DAY_HEADER_EN, OPS_DAY_LABELS, OPS_KEYS } from "@/lib/schedule/constants";
import { fieldDiffersOrig } from "@/lib/schedule/rowModel";
import type { ScheduleRow, ScheduleSeason } from "@/lib/schedule/types";
import { cn } from "@/lib/cn";
import { Trash2 } from "lucide-react";
import type { DragEvent } from "react";
import {
  firstColSeasonBorder,
  isWinterRow,
  seasonBadgeClass,
  timeMono,
  timeMonoFont,
  trRowClass,
} from "./airlineOpsTheme";

const baseCell =
  "bg-[#0b1120] group-hover/row:bg-white/[0.04] text-sm leading-snug";
const baseCellSelected = "bg-slate-800/35 group-hover/row:bg-white/[0.06]";

function SeasonBadge({ row }: { row: ScheduleRow }) {
  const w = isWinterRow(row);
  return (
    <span
      className={cn(
        "ml-0.5 inline-flex rounded px-1.5 py-0.5 text-[11px] font-semibold tabular-nums",
        seasonBadgeClass(row)
      )}
      title={w ? "Winter" : "Summer"}
    >
      {w ? "W" : "S"}
    </span>
  );
}

function RouteText({ rtg }: { rtg: string }) {
  const t = String(rtg || "").trim();
  if (!t) return <span className="text-slate-500/60">—</span>;
  const parts = t.split(/[-–—]/);
  if (parts.length < 2) {
    return <span className="text-sm font-medium text-slate-400/90">{t}</span>;
  }
  const a = parts[0].trim();
  const b = parts.slice(1).join("-").trim();
  return (
    <span className="text-sm font-medium text-slate-400/90">
      {a}
      <span className="mx-0.5 font-normal text-slate-500/50">·</span>
      {b}
    </span>
  );
}

function DayDot({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        "inline-block h-2 w-2 rounded-full",
        active ? "bg-emerald-400" : "bg-neutral-700"
      )}
      title={active ? "Active" : "—"}
    />
  );
}

type Props = {
  rows: ScheduleRow[];
  selectedRowId: string | null;
  onSelectRow: (id: string | null) => void;
  onOpenEdit: (id: string) => void;
  onRemoveRow: (id: string) => void;
  onSeasonChange: (id: string, season: ScheduleSeason) => void;
  onDragStart: (e: DragEvent<HTMLTableRowElement>, id: string) => void;
  onDrop: (e: DragEvent<HTMLTableRowElement>, toId: string) => void;
};

const thBase =
  "sticky top-0 z-[24] border-b border-slate-800 bg-slate-950/98 px-2 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400 backdrop-blur-sm lg:text-[13px]";

export function AirlineOpsFlightTable({
  rows,
  selectedRowId,
  onSelectRow,
  onOpenEdit,
  onRemoveRow,
  onSeasonChange,
  onDragStart,
  onDrop,
}: Props) {
  return (
    <div
      className="scrollbar-thin min-h-0 min-w-0 flex-1 overflow-x-auto overflow-y-auto rounded-b-lg bg-[#0b1120]"
      style={{ scrollbarGutter: "stable" }}
    >
      <table className="w-full min-w-[1360px] table-fixed border-collapse text-left text-slate-300">
        <colgroup>
          <col className="w-9" />
          <col className="w-9" />
          <col className="w-28" />
          <col className="w-14" />
          <col className="w-32" />
          <col className="w-40" />
          <col className="w-32" />
          <col className="w-14" />
          <col className="w-14" />
          <col className="w-14" />
          <col className="w-14" />
          <col className="w-14" />
          {OPS_KEYS.map((d) => (
            <col key={d} className="w-9" />
          ))}
          <col className="min-w-[6rem] flex-1" />
          <col className="w-9" />
        </colgroup>
        <thead>
          <tr>
            <th
              className={cn(
                thBase,
                "sticky left-0 z-[30] w-9 min-w-9 max-w-9 border-r border-slate-800/60"
              )}
            />
            <th
              className={cn(
                thBase,
                "sticky left-9 z-[30] w-9 min-w-9 max-w-9 border-r border-slate-800/60 text-center"
              )}
            >
              #
            </th>
            <th
              className={cn(
                thBase,
                "sticky left-[4.5rem] z-[30] w-28 min-w-28 max-w-28 border-r border-slate-800/60"
              )}
              title="Flight number"
            >
              FLT
            </th>
            <th className={thBase} title="Aircraft type">
              A/C
            </th>
            <th className={thBase} title="Route">
              RTG
            </th>
            <th className={thBase} title="Season (Winter / Summer)">
              SEA
            </th>
            <th className={cn(thBase, "text-center")} title="STD (local)">
              STD
            </th>
            <th className={cn(thBase, "text-center")} title="Gen">
              GEN
            </th>
            <th className={cn(thBase, "text-center")} title="Per">
              PER
            </th>
            <th className={cn(thBase, "text-center")} title="Doc">
              DOC
            </th>
            <th className={cn(thBase, "text-center")} title="Transit">
              TRS
            </th>
            <th className={cn(thBase, "text-center")} title="R/U">
              R/U
            </th>
            {OPS_KEYS.map((d) => (
              <th
                key={d}
                className={cn(
                  thBase,
                  "text-center text-[11px] font-semibold leading-tight text-slate-400 lg:text-xs"
                )}
                title={OPS_DAY_LABELS[d]}
              >
                {OPS_DAY_HEADER_EN[d]}
              </th>
            ))}
            <th className={thBase} title="Remark">
              RMK
            </th>
            <th className={cn(thBase, "w-9 min-w-9 p-0 text-center")} />
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => {
            const isSel = row.id === selectedRowId;
            const tip = [
              row.flt,
              row.ac,
              row.rtg,
              row.std,
              row.remark,
            ]
              .filter((x) => String(x || "").trim())
              .join(" · ");

            const cell = (extra?: string) =>
              cn(
                "px-2 py-3 align-middle",
                baseCell,
                isSel && baseCellSelected,
                extra
              );

            return (
              <tr
                key={row.id}
                draggable
                onDragStart={(e) => onDragStart(e, row.id)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => onDrop(e, row.id)}
                onClick={() => onSelectRow(isSel ? null : row.id)}
                title={tip}
                aria-selected={isSel}
                className={trRowClass}
              >
                <td
                  className={cn(
                    cell(),
                    firstColSeasonBorder(row),
                    "sticky left-0 z-[20] w-9 min-w-9 max-w-9 border-r border-slate-800/50 text-center text-slate-600"
                  )}
                >
                  <span className="cursor-grab select-none text-sm">⋮</span>
                </td>
                <td
                  className={cn(
                    cell("text-center text-sm tabular-nums text-slate-500/80"),
                    "sticky left-9 z-[20] w-9 min-w-9 max-w-9 border-r border-slate-800/50"
                  )}
                >
                  {idx + 1}
                </td>
                <td
                  className={cn(
                    cell("text-base font-semibold text-slate-100"),
                    "sticky left-[4.5rem] z-[20] w-28 min-w-28 max-w-28 border-r border-slate-800/50"
                  )}
                >
                  {row.flt || "—"}
                </td>
                <td className={cell("text-slate-500/75")} title={row.ac}>
                  {row.ac || "—"}
                </td>
                <td className={cell("min-w-0")}>
                  <div className="min-w-0 max-w-full truncate">
                    <RouteText rtg={row.rtg} />
                  </div>
                </td>
                <td className={cn(cell(), "min-w-0 overflow-hidden")}>
                  <div className="flex min-w-0 flex-col items-stretch gap-1.5 sm:flex-row sm:items-center sm:gap-2.5">
                    <select
                      aria-label="Season"
                      value={row.season}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) =>
                        onSeasonChange(
                          row.id,
                          e.target.value as ScheduleSeason
                        )
                      }
                      className="min-w-0 cursor-pointer rounded border-0 border-slate-700/50 bg-slate-900/50 py-0.5 pl-1 pr-7 text-left text-sm text-slate-400 outline-none focus:ring-1 focus:ring-slate-600 sm:min-w-[5.5rem] sm:max-w-[7.5rem] sm:shrink-0"
                    >
                      <option value="winter">Winter</option>
                      <option value="summer">Summer</option>
                    </select>
                    <div className="shrink-0 self-start sm:self-center">
                      <SeasonBadge row={row} />
                    </div>
                  </div>
                </td>
                <td
                  className={cn(
                    cell("text-center"),
                    "min-w-0 border-l border-slate-800/50 pl-2 pr-1"
                  )}
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenEdit(row.id);
                    }}
                    className={cn(
                      timeMonoFont,
                      "block w-full min-w-0 whitespace-nowrap px-1.5 text-center text-base text-slate-200 tabular-nums underline-offset-2 hover:underline"
                    )}
                  >
                    {row.std?.trim() || "—"}
                  </button>
                </td>
                {(["gen", "per", "doc", "transit", "bu"] as const).map(
                  (f) => {
                    const diff = fieldDiffersOrig(row, f);
                    const v = String(row[f] ?? "").trim();
                    return (
                      <td
                        key={f}
                        className={cn(
                          cell("text-center"),
                          diff
                            ? "text-rose-300/80"
                            : "text-slate-500/65",
                          timeMono
                        )}
                        title={v}
                      >
                        {v || "—"}
                      </td>
                    );
                  }
                )}
                {OPS_KEYS.map((d) => {
                  const v = row.ops[d] ?? "";
                  const isX = v === "X" || v === "x";
                  const isText =
                    Boolean(String(v).trim()) && v !== "X" && v !== "x";
                  return (
                    <td
                      key={d}
                      className={cell("text-center")}
                    >
                      {isText ? (
                        <span
                          className={cn(
                            "block max-w-full truncate text-xs text-slate-500/70",
                            timeMono
                          )}
                          title={v}
                        >
                          {v}
                        </span>
                      ) : (
                        <div className="flex justify-center">
                          <DayDot active={isX} />
                        </div>
                      )}
                    </td>
                  );
                })}
                <td
                  className={cn(
                    cell("max-w-0 min-w-0 text-slate-500/70"),
                    "truncate"
                  )}
                  title={row.remark}
                >
                  {row.remark || "—"}
                </td>
                <td
                  className={cn(
                    cell("px-0 text-center"),
                    "align-middle"
                  )}
                >
                  <Button
                    variant="ghost"
                    className="!h-9 !min-w-9 !p-0 text-slate-600 hover:text-rose-400/90"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm("Xoá dòng?")) onRemoveRow(row.id);
                    }}
                    aria-label="Xoá dòng"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

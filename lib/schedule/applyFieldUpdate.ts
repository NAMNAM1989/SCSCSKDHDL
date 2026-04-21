import type { ScheduleRow } from "./types";
import { isNAVal, minutesBefore, smartFormatTimeCell } from "./time";
import {
  migrateRow,
  recalcCutoffsFromMb,
  rowHasBaseline,
  snapshotOrigAndMb,
} from "./rowModel";

/**
 * Áp một thay đổi ô lên một dòng lịch.
 * Trả về **cùng tham chiếu `row`** nếu không có thay đổi thực sự (sau chuẩn hoá),
 * để caller có thể bỏ qua setState / debounce save.
 */
export function applyFieldToRow(
  row: ScheduleRow,
  field: keyof ScheduleRow,
  value: string
): ScheduleRow {
  if (field === "std") {
    const formatted = smartFormatTimeCell(value);
    if (formatted === smartFormatTimeCell(row.std ?? "")) return row;
    const next = { ...row };
    next.std = formatted;
    const hadB = rowHasBaseline(next);
    if (!hadB && next.std) snapshotOrigAndMb(next);
    else if (hadB && next.std) recalcCutoffsFromMb(next);
    migrateRow(next);
    return next;
  }

  if (
    field === "gen" ||
    field === "per" ||
    field === "doc" ||
    field === "transit" ||
    field === "bu"
  ) {
    const f = field;
    const formatted = smartFormatTimeCell(value);
    if (formatted === smartFormatTimeCell(String(row[f] ?? ""))) return row;
    const next = { ...row };
    next[f] = formatted;
    if (next.std && next[f] && !isNAVal(next[f])) {
      if (!next.mb)
        next.mb = {
          gen: null,
          per: null,
          doc: null,
          transit: null,
          bu: null,
        };
      next.mb[f] = minutesBefore(next.std, next[f]);
    } else if (next.mb) {
      next.mb[f] = null;
    }
    migrateRow(next);
    return next;
  }

  if (field === "flt") {
    if (value === row.flt) return row;
    const next = { ...row, flt: value };
    migrateRow(next);
    return next;
  }
  if (field === "ac") {
    if (value === row.ac) return row;
    const next = { ...row, ac: value };
    migrateRow(next);
    return next;
  }
  if (field === "rtg") {
    if (value === row.rtg) return row;
    const next = { ...row, rtg: value };
    migrateRow(next);
    return next;
  }
  if (field === "remark") {
    if (value === row.remark) return row;
    const next = { ...row, remark: value };
    migrateRow(next);
    return next;
  }

  return row;
}

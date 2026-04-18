import * as XLSX from "xlsx";
import { pad2 } from "./time";
import { newRowId, normalizeRow, snapshotOrigAndMb } from "./rowModel";
import type { ScheduleRow } from "./types";

function norm(s: unknown): string {
  return String(s == null ? "" : s)
    .replace(/\r\n/g, "\n")
    .trim()
    .replace(/\s+/g, " ");
}

function cellStr(v: unknown): string {
  if (v == null || v === "") return "";
  if (v instanceof Date && !isNaN(v.getTime())) {
    const h = pad2(v.getHours());
    const m = pad2(v.getMinutes());
    if (h !== "00" || m !== "00") return h + ":" + m;
  }
  return String(v).trim();
}

function cellToHM(v: unknown): string | null {
  if (v == null || v === "") return null;
  if (typeof v === "string") {
    const low = v.trim().toLowerCase();
    if (low === "n/a" || low === "na" || low === "-" || low === "—") return null;
  }
  if (v instanceof Date && !isNaN(v.getTime())) {
    return pad2(v.getHours()) + ":" + pad2(v.getMinutes());
  }
  if (typeof v === "number") {
    if (v > 0 && v < 1) {
      const tm = Math.round(v * 24 * 60);
      const h = Math.floor(tm / 60) % 24;
      const m = tm % 60;
      return pad2(h) + ":" + pad2(m);
    }
    if (typeof XLSX.SSF !== "undefined" && XLSX.SSF.parse_date_code) {
      const d = XLSX.SSF.parse_date_code(v);
      if (d) return pad2(d.H) + ":" + pad2(d.M);
    }
  }
  const s = String(v);
  const m = s.match(/(\d{1,2})\s*:\s*(\d{2})/);
  if (m) return pad2(parseInt(m[1], 10)) + ":" + pad2(parseInt(m[2], 10));
  return null;
}

function excelCutCell(v: unknown): string {
  if (v == null || v === "") return "";
  if (typeof v === "string") {
    const low = v.trim().toLowerCase();
    if (low === "n/a" || low === "na") return "N/A";
  }
  const hm = cellToHM(v);
  if (hm != null) return hm;
  return cellStr(v);
}

function mapHeaderRow(row: unknown[]): Record<string, number> {
  const idx: Record<string, number> = {
    flt: 0,
    ac: 1,
    rtg: 2,
    std: 3,
    gen: 4,
    per: 5,
    doc: 6,
    transit: 7,
    bu: 8,
  };
  if (!row || !row.length) return idx;
  for (let c = 0; c < row.length; c++) {
    const h = norm(row[c]).toLowerCase();
    if (!h) continue;
    if (h.includes("flt") && (h.includes("nbr") || h.includes("number"))) idx.flt = c;
    else if (h === "a/c" || h.startsWith("a/c")) idx.ac = c;
    else if (h === "rtg" || h.includes("rtg")) idx.rtg = c;
    else if (h === "std" || (h.length <= 6 && /^std/.test(h))) idx.std = c;
    else if (h.includes("gen") && (h.includes("cut") || h.includes("time"))) idx.gen = c;
    else if (h.includes("per") && h.includes("cut")) idx.per = c;
    else if (h.includes("doc") && h.includes("cut") && !h.includes("transit") && !h.includes("out"))
      idx.doc = c;
    else if (h.includes("transit")) idx.transit = c;
    else if (h.includes("b/u") || (h.includes("doc") && h.includes("out"))) idx.bu = c;
  }
  return idx;
}

function mapDayColumns(dayRow: unknown[]): {
  mon: number;
  tue: number;
  wed: number;
  thu: number;
  fri: number;
  sat: number;
  sun: number;
  remark: number;
} {
  const d = {
    mon: -1,
    tue: -1,
    wed: -1,
    thu: -1,
    fri: -1,
    sat: -1,
    sun: -1,
    remark: -1,
  };
  if (!dayRow) return d;
  for (let c = 0; c < dayRow.length; c++) {
    const t = norm(dayRow[c]).toLowerCase();
    if (t === "mon") d.mon = c;
    else if (t === "tue") d.tue = c;
    else if (t === "wed") d.wed = c;
    else if (t === "thu") d.thu = c;
    else if (t === "fri") d.fri = c;
    else if (t === "sat") d.sat = c;
    else if (t === "sun") d.sun = c;
    else if (t.includes("remark")) d.remark = c;
  }
  if (d.remark < 0) {
    for (let c2 = dayRow.length - 1; c2 >= 0; c2--) {
      if (norm(dayRow[c2]).toLowerCase().includes("remark")) {
        d.remark = c2;
        break;
      }
    }
  }
  return d;
}

function isDataRow(row: unknown[], idx: Record<string, number>): boolean {
  const f = row && row[idx.flt];
  if (f == null || f === "") return false;
  const t = String(f).trim();
  if (!t) return false;
  if (/^total$/i.test(t)) return false;
  return true;
}

export function parseExcelWorkbook(buf: ArrayBuffer): ScheduleRow[] {
  const wb = XLSX.read(buf, { type: "array", cellDates: true });
  const name = wb.SheetNames[0];
  const ws = wb.Sheets[name];
  const rows = XLSX.utils.sheet_to_json(ws, {
    header: 1,
    defval: null,
    raw: true,
  }) as unknown[][];

  let headerRow = -1;
  for (let r = 0; r < Math.min(25, rows.length); r++) {
    const row = rows[r] || [];
    for (let c = 0; c < row.length; c++) {
      const cell = norm(row[c]).toLowerCase();
      if (cell.includes("flt") && cell.includes("nbr")) {
        headerRow = r;
        break;
      }
    }
    if (headerRow >= 0) break;
  }
  if (headerRow < 0) throw new Error("Không tìm thấy dòng tiêu đề (Flt Nbr).");

  const col = mapHeaderRow(rows[headerRow]);
  const dayHeaderRow = rows[headerRow + 1] || [];
  const daysMap = mapDayColumns(dayHeaderRow);
  const dataStart = headerRow + 2;
  const out: ScheduleRow[] = [];

  for (let i = dataStart; i < rows.length; i++) {
    const row = rows[i];
    if (!row) continue;
    if (!isDataRow(row, col)) continue;
    const flt = String(row[col.flt] == null ? "" : row[col.flt]).trim();
    const ac = row[col.ac] != null ? String(row[col.ac]).trim() : "";
    const rtg = row[col.rtg] != null ? String(row[col.rtg]).trim() : "";
    const std = excelCutCell(row[col.std]);
    const gen = excelCutCell(row[col.gen]);
    const per = excelCutCell(row[col.per]);
    const doc = excelCutCell(row[col.doc]);
    const transit = excelCutCell(row[col.transit]);
    const bu = excelCutCell(row[col.bu]);
    if (!std) continue;

    const dayAt = (key: keyof typeof daysMap): string => {
      const ix = daysMap[key];
      if (ix == null || ix < 0) return "";
      return cellStr(row[ix]);
    };

    let remark = "";
    if (daysMap.remark >= 0) remark = cellStr(row[daysMap.remark]);

    const one = normalizeRow({
      id: newRowId(),
      flt,
      ac,
      rtg,
      std,
      gen,
      per,
      doc,
      transit,
      bu,
      ops: {
        mon: dayAt("mon"),
        tue: dayAt("tue"),
        wed: dayAt("wed"),
        thu: dayAt("thu"),
        fri: dayAt("fri"),
        sat: dayAt("sat"),
        sun: dayAt("sun"),
      },
      remark,
    });
    if (!one) continue;
    snapshotOrigAndMb(one);
    out.push(one);
  }
  if (!out.length) throw new Error("Không đọc được dòng chuyến bay hợp lệ (cần có STD).");
  return out;
}

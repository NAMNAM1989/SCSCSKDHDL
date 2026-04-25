import { OPS_KEYS } from "./constants";
import type { Flight } from "./flightTypes";
import type { ScheduleRow } from "./types";

export function formatUpdatedDateForExport(raw: string): string {
  const t = String(raw || "").trim();
  if (!t) return "\u2014";
  const m = t.match(/^(\d{1,2})-([A-Za-z]{3})-(\d{4})$/i);
  if (m) return m[1].padStart(2, "0") + "-" + m[2].toUpperCase() + "-" + m[3];
  const m2 = t.match(/^(\d{2})([A-Za-z]{3})(\d{2})$/i);
  if (m2) {
    const y = 2000 + parseInt(m2[3], 10);
    return m2[1] + "-" + m2[2].toUpperCase() + "-" + String(y);
  }
  return t;
}

export function appRowToFlight(row: ScheduleRow): Flight {
  return {
    flt: row.flt,
    ac: row.ac,
    rtg: row.rtg,
    std: row.std,
    coGen: row.gen,
    coPer: row.per,
    coDoc: row.doc,
    coTransit: row.transit,
    buDone: row.bu,
    days: OPS_KEYS.map((k) => {
      const v = row.ops[k];
      if (v == null || String(v).trim() === "") return null;
      return String(v);
    }),
    remark: row.remark || "",
  };
}

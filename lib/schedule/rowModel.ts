import { OPS_KEYS } from "./constants";
import { normalizeSeason } from "./season";
import type { MbMap, OpsMap, OrigSnapshot, ScheduleRow } from "./types";
import { applyBefore, isNAVal, minutesBefore } from "./time";

export function newRowId(): string {
  return (
    "r-" +
    Date.now().toString(36) +
    "-" +
    Math.random().toString(36).slice(2, 10)
  );
}

export function emptyOps(): OpsMap {
  return { mon: "", tue: "", wed: "", thu: "", fri: "", sat: "", sun: "" };
}

export function normalizeOps(o: unknown): OpsMap {
  const src = o && typeof o === "object" ? (o as Record<string, unknown>) : {};
  const out = emptyOps();
  for (const k of OPS_KEYS) {
    out[k] = src[k] != null ? String(src[k]) : "";
  }
  return out;
}

function cloneOrig(o: unknown): OrigSnapshot | null {
  if (!o || typeof o !== "object") return null;
  const x = o as Record<string, unknown>;
  return {
    std: x.std != null ? String(x.std) : "",
    gen: x.gen != null ? String(x.gen) : "",
    per: x.per != null ? String(x.per) : "",
    doc: x.doc != null ? String(x.doc) : "",
    transit: x.transit != null ? String(x.transit) : "",
    bu: x.bu != null ? String(x.bu) : "",
  };
}

function cloneMb(m: unknown): MbMap | null {
  if (!m || typeof m !== "object") return null;
  const x = m as Record<string, unknown>;
  return {
    gen: x.gen != null && x.gen !== "" ? Number(x.gen) : null,
    per: x.per != null && x.per !== "" ? Number(x.per) : null,
    doc: x.doc != null && x.doc !== "" ? Number(x.doc) : null,
    transit: x.transit != null && x.transit !== "" ? Number(x.transit) : null,
    bu: x.bu != null && x.bu !== "" ? Number(x.bu) : null,
  };
}

export function normalizeRow(r: unknown): ScheduleRow | null {
  if (!r || typeof r !== "object") return null;
  const x = r as Record<string, unknown>;
  return {
    id: typeof x.id === "string" && x.id ? x.id : newRowId(),
    season: normalizeSeason(x.season),
    flt: x.flt != null ? String(x.flt) : "",
    ac: x.ac != null ? String(x.ac) : "",
    rtg: x.rtg != null ? String(x.rtg) : "",
    std: x.std != null ? String(x.std) : "",
    stdHighlightUntil:
      x.stdHighlightUntil != null && String(x.stdHighlightUntil).trim()
        ? String(x.stdHighlightUntil)
        : null,
    gen: x.gen != null ? String(x.gen) : "",
    per: x.per != null ? String(x.per) : "",
    doc: x.doc != null ? String(x.doc) : "",
    transit: x.transit != null ? String(x.transit) : "",
    bu: x.bu != null ? String(x.bu) : "",
    ops: normalizeOps(x.ops),
    remark: x.remark != null ? String(x.remark) : "",
    orig: cloneOrig(x.orig),
    mb: cloneMb(x.mb),
  };
}

export function snapshotOrigAndMb(row: ScheduleRow): void {
  row.orig = {
    std: row.std || "",
    gen: row.gen || "",
    per: row.per || "",
    doc: row.doc || "",
    transit: row.transit || "",
    bu: row.bu || "",
  };
  row.mb = { gen: null, per: null, doc: null, transit: null, bu: null };
  if (!row.orig.std) return;
  const cuts = ["gen", "per", "doc", "transit", "bu"] as const;
  for (const f of cuts) {
    const val = row.orig[f];
    if (!val || isNAVal(val)) {
      row.mb![f] = null;
      continue;
    }
    row.mb![f] = minutesBefore(row.orig.std, val);
  }
}

export function rowHasBaseline(row: ScheduleRow): boolean {
  return !!(row.orig && String(row.orig.std || "").trim() !== "");
}

export function recomputeMbFromOrig(row: ScheduleRow): void {
  if (!row.orig) return;
  row.mb = { gen: null, per: null, doc: null, transit: null, bu: null };
  const std = row.orig.std || "";
  if (!String(std).trim()) return;
  const cuts = ["gen", "per", "doc", "transit", "bu"] as const;
  for (const f of cuts) {
    const val = row.orig[f];
    if (!val || isNAVal(val)) {
      row.mb![f] = null;
      continue;
    }
    row.mb![f] = minutesBefore(std, val);
  }
}

export function recalcCutoffsFromMb(row: ScheduleRow): void {
  if (!row.mb || !row.std) return;
  const cuts = ["gen", "per", "doc", "transit", "bu"] as const;
  for (const f of cuts) {
    const mb = row.mb[f];
    if (mb == null) continue;
    const v = applyBefore(row.std, mb);
    if (v) row[f] = v;
  }
}

export function migrateRow(row: ScheduleRow): void {
  if (!row.orig) {
    snapshotOrigAndMb(row);
    return;
  }
  if (!row.mb || typeof row.mb !== "object") {
    recomputeMbFromOrig(row);
    return;
  }
  const cuts = ["gen", "per", "doc", "transit", "bu"] as const;
  let hasMb = false;
  for (const f of cuts) {
    if (row.mb[f] != null) {
      hasMb = true;
      break;
    }
  }
  if (!hasMb && String(row.orig.std || "").trim()) {
    recomputeMbFromOrig(row);
  }
}

export function fieldDiffersOrig(
  row: ScheduleRow,
  field: "std" | "gen" | "per" | "doc" | "transit" | "bu"
): boolean {
  if (!row.orig) return false;
  const a = String(row[field] != null ? row[field] : "").trim();
  const b = String(
    row.orig[field as keyof OrigSnapshot] != null
      ? row.orig[field as keyof OrigSnapshot]
      : ""
  ).trim();
  if (isNAVal(a) && isNAVal(b)) return false;
  return a !== b;
}

export function rowMatchesFilter(
  row: ScheduleRow,
  q: string
): boolean {
  if (!q) return true;
  const blob = [row.flt, row.ac, row.rtg].join(" ").toLowerCase();
  return blob.includes(q.toLowerCase());
}

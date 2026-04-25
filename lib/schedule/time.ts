export function pad2(n: number): string {
  const x = Math.floor(n);
  return (x < 10 ? "0" : "") + x;
}

export function parseHM(s: string | undefined | null): number | null {
  if (!s || typeof s !== "string") return null;
  const p = s.trim().split(":");
  if (p.length < 2) return null;
  const h = parseInt(p[0], 10);
  const m = parseInt(p[1], 10);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return (h * 60 + m) % (24 * 60);
}

export function formatHM(mins: number | null | undefined): string {
  if (mins == null || Number.isNaN(mins)) return "";
  const x = ((mins % (24 * 60)) + 24 * 60) % (24 * 60);
  const h = Math.floor(x / 60);
  const mi = x % 60;
  return pad2(h) + ":" + pad2(mi);
}

export function minutesBefore(stdStr: string, cutStr: string): number | null {
  const s = parseHM(stdStr);
  const c = parseHM(cutStr);
  if (s == null || c == null) return null;
  let d = s - c;
  if (d < 0) d += 24 * 60;
  return d;
}

export function applyBefore(stdNewStr: string, mb: number): string | null {
  const s = parseHM(stdNewStr);
  if (s == null) return null;
  let g = s - mb;
  while (g < 0) g += 24 * 60;
  return formatHM(g);
}

export function isNAVal(v: string | undefined | null): boolean {
  return String(v || "")
    .trim()
    .toLowerCase() === "n/a";
}

/** Chuẩn hoá nhập giờ */
export function smartFormatTimeCell(raw: string | undefined | null): string {
  const s = String(raw == null ? "" : raw).trim();
  if (!s) return "";
  const low = s.toLowerCase();
  if (low === "na" || low === "n/a") return "N/A";
  const digits = s.replace(/\D/g, "");
  if (digits.length === 1 || digits.length === 2) {
    const hh = parseInt(digits, 10);
    if (!Number.isNaN(hh) && hh >= 0 && hh <= 23) return pad2(hh) + ":00";
  }
  if (digits.length === 3) {
    const h1 = parseInt(digits.charAt(0), 10);
    const m1 = parseInt(digits.slice(1), 10);
    if (!Number.isNaN(h1) && !Number.isNaN(m1)) return pad2(h1) + ":" + pad2(m1);
  }
  if (digits.length === 4) {
    const h2 = parseInt(digits.slice(0, 2), 10);
    const m2 = parseInt(digits.slice(2), 10);
    if (!Number.isNaN(h2) && !Number.isNaN(m2)) return pad2(h2) + ":" + pad2(m2);
  }
  if (s.includes(":")) {
    const pm = parseHM(s);
    if (pm != null) return formatHM(pm);
  }
  return s;
}

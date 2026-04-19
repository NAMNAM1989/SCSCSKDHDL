import { isNAVal } from "./time";
import type { ScheduleState } from "./types";

const PDF_TITLE = "SUM2025 FLT SKD & HDL";

function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttr(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/'/g, "&#39;");
}

function cellPrintHtml(v: unknown): string {
  const t = String(v == null ? "" : v).trim();
  if (!t) return "";
  if (isNAVal(t)) return '<span class="pdf-na">N/A</span>';
  return escapeHtml(t);
}

export function rowColorForFlight(fltNbr: string): string {
  const code =
    String(fltNbr || "")
      .trim()
      .toUpperCase()
      .match(/^(\d[A-Z]|[A-Z]{2})/);
  const c = code ? code[1] : "";
  if (c === "TG") return "#00b050";
  if (["CV", "LH", "MF", "TR"].includes(c)) return "#c00000";
  if (
    [
      "VJ", "SQ", "CX", "5X", "6E", "BI", "JL", "KE", "OZ", "TK", "HU", "NX",
      "BR", "PR", "WB", "ET", "QR", "EK", "NH", "CI", "LD", "TH",
    ].includes(c)
  )
    return "#0070c0";
  return "#000000";
}

export function buildPrintHtml(state: ScheduleState): string {
  const ud =
    state.meta && state.meta.updatedDate
      ? String(state.meta.updatedDate)
      : "08APR26";
  const banner =
    '<div class="pdf-banner">' +
    '<div class="pdf-banner__left">SCSC/OPS/EXP</div>' +
    '<div class="pdf-banner__center">' +
    '<div class="pdf-banner__title">' +
    escapeHtml(PDF_TITLE) +
    "</div>" +
    '<div class="pdf-banner__updated">UPDATED ' +
    escapeHtml(ud) +
    "</div></div>" +
    '<div class="pdf-banner__right">INTERNAL USE ONLY</div></div>';

  const colgroup =
    "<colgroup>" +
    '<col style="width:7%"/>' +
    '<col style="width:5%"/>' +
    '<col style="width:9%"/>' +
    '<col style="width:6%"/>' +
    '<col style="width:5.5%"/>' +
    '<col style="width:5.5%"/>' +
    '<col style="width:5.5%"/>' +
    '<col style="width:6%"/>' +
    '<col style="width:7%"/>' +
    '<col style="width:3.8%"/>' +
    '<col style="width:3.8%"/>' +
    '<col style="width:3.8%"/>' +
    '<col style="width:3.8%"/>' +
    '<col style="width:3.8%"/>' +
    '<col style="width:3.8%"/>' +
    '<col style="width:3.8%"/>' +
    '<col style="width:16.7%"/>' +
    "</colgroup>";

  const thead =
    "<thead>" +
    "<tr>" +
    '<th rowspan="2">Flt Nbr</th>' +
    '<th rowspan="2">A/C</th>' +
    '<th rowspan="2">RTG</th>' +
    '<th rowspan="2">STD</th>' +
    '<th colspan="4">Cut-off</th>' +
    '<th rowspan="2">B/U done<br/>DOC out</th>' +
    '<th colspan="7">OPS DAYS</th>' +
    '<th rowspan="2">REMARK</th>' +
    "</tr>" +
    "<tr>" +
    "<th>time for<br/>GEN</th>" +
    "<th>time for<br/>PER</th>" +
    "<th>time for<br/>DOC</th>" +
    "<th>time for<br/>transit</th>" +
    "<th>Mon</th><th>Tue</th><th>Wed</th><th>Thu</th><th>Fri</th><th>Sat</th>" +
    '<th class="sun-col">Sun</th>' +
    "</tr>" +
    "</thead>";

  const OPS_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;

  let body = "<tbody>";
  for (const r of state.rows) {
    const col = escapeAttr(rowColorForFlight(r.flt));
    body += '<tr style="color:' + col + '">';
    body += "<td>" + cellPrintHtml(r.flt) + "</td>";
    body += "<td>" + cellPrintHtml(r.ac) + "</td>";
    body += "<td>" + cellPrintHtml(r.rtg) + "</td>";
    body += "<td>" + cellPrintHtml(r.std) + "</td>";
    body += "<td>" + cellPrintHtml(r.gen) + "</td>";
    body += "<td>" + cellPrintHtml(r.per) + "</td>";
    body += "<td>" + cellPrintHtml(r.doc) + "</td>";
    body += "<td>" + cellPrintHtml(r.transit) + "</td>";
    body += "<td>" + cellPrintHtml(r.bu) + "</td>";
    for (let d = 0; d < OPS_KEYS.length; d++) {
      const dk = OPS_KEYS[d];
      const sun = dk === "sun" ? ' class="sun-col"' : "";
      body += "<td" + sun + ">";
      body += cellPrintHtml(r.ops[dk]);
      body += "</td>";
    }
    body += '<td class="remark-col">' + cellPrintHtml(r.remark) + "</td>";
    body += "</tr>";
  }
  body += "</tbody>";

  return (
    banner +
    '<div class="pdf-table-wrap"><table class="pdf-table">' +
    colgroup +
    thead +
    body +
    "</table></div>"
  );
}

import { printTextColorForSeason } from "./season";
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
    const col = escapeAttr(printTextColorForSeason(r));
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

export function buildPrintDocument(state: ScheduleState): string {
  return (
    "<!doctype html>" +
    '<html lang="vi"><head><meta charset="utf-8"/>' +
    "<title>SCSC Print</title>" +
    "<style>" +
    "@page{size:A4 landscape;margin:1cm;}" +
    "html,body{margin:0;padding:0;background:#fff;color:#000;font-family:Arial,Helvetica,sans-serif;}" +
    ".print-root{padding:0;}" +
    ".pdf-banner{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:.35rem;padding-bottom:.25rem;border-bottom:2px solid #000;}" +
    ".pdf-banner__left{font-weight:700;font-size:11pt;color:#000;}" +
    ".pdf-banner__center{flex:1;text-align:center;min-width:0;}" +
    ".pdf-banner__title{font-size:16pt;font-weight:700;color:#c00000;margin:0;line-height:1.15;}" +
    ".pdf-banner__updated{margin-top:.15rem;font-size:11pt;font-weight:700;color:#00b050;text-decoration:underline;}" +
    ".pdf-banner__right{font-size:10pt;font-weight:700;color:#000;white-space:nowrap;}" +
    ".pdf-table-wrap{margin-top:.2rem;overflow:visible;}" +
    "table.pdf-table{width:100%;border-collapse:collapse;font-size:10pt;table-layout:fixed;}" +
    "table.pdf-table th,table.pdf-table td{border:1px solid #000;padding:.12rem .18rem;text-align:center;vertical-align:middle;word-wrap:break-word;}" +
    "table.pdf-table thead th{background:#ff0;color:#000;font-weight:700;font-size:11pt;}" +
    "table.pdf-table thead th.sun-col,table.pdf-table tbody td.sun-col{background:#fce4e4;}" +
    "table.pdf-table tbody td{font-size:10pt;background:#fff;}" +
    "table.pdf-table tbody tr:nth-child(even) td:not(.sun-col){background:#fff;}" +
    "table.pdf-table td.remark-col{text-align:left;font-size:9pt;white-space:normal;}" +
    ".pdf-na{color:#e06666;font-style:italic;}" +
    "@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact;}}" +
    "</style></head><body>" +
    '<main class="print-root">' +
    buildPrintHtml(state) +
    "</main></body></html>"
  );
}

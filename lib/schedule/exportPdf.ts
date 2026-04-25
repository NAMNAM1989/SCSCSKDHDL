import { OPS_DAY_HEADER_EN, OPS_KEYS } from "./constants";
import { countFlightsWithDayTick } from "./opsDayCounts";
import { formatUpdatedDateForExport } from "./exportHelpers";
import { printTextColorForSeason } from "./season";
import type { ScheduleState } from "./types";

/**
 * jsPDF font mặc định (Helvetica) dùng WinAnsi — không in được Unicode đầy đủ.
 * Chuẩn hoá: bỏ dấu tổ hợp + thay bullet/tick bằng "X" + gạch ngang ASCII.
 */
function pdfSafeText(raw: string): string {
  let s = String(raw ?? "");
  s = s.replace(/[\u25CF\u25CB\u2022\u2219\u2713\u2714]/g, "X");
  s = s.normalize("NFD").replace(/\p{M}+/gu, "");
  s = s.replace(/[\u2014\u2013]/g, "-");
  return s;
}

function safeCell(v: unknown): string {
  const t = pdfSafeText(String(v ?? "").trim());
  return t || " ";
}

/**
 * Xuất file PDF theo layout bảng mẫu EXP_SKDHDL_UPDATE.
 * Lazy-load jspdf + autotable để không tăng bundle ban đầu.
 */
export async function exportSchedulePdf(state: ScheduleState): Promise<void> {
  const [{ default: JsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);

  const doc = new JsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
    putOnlyUsedFonts: true,
    compress: true,
  });

  const updated = formatUpdatedDateForExport(state.meta.updatedDate || "08APR26");
  const pageCenterX = 148.5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(178, 34, 34);
  doc.text(
    pdfSafeText("SCSC_2026 — FLIGHT SCHEDULE & HANDLING (EXPORT)"),
    pageCenterX,
    10,
    {
      align: "center",
    }
  );
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.text(
    pdfSafeText(
      `SCSC / OPS / EXP          Updated: ${updated}          INTERNAL USE ONLY`
    ),
    pageCenterX,
    15,
    { align: "center" }
  );
  doc.setDrawColor(0, 0, 0);
  doc.line(10, 18, 287, 18);

  const head = [
    [
      pdfSafeText("Flt Nbr"),
      pdfSafeText("A/C"),
      pdfSafeText("Routing"),
      pdfSafeText("STD"),
      pdfSafeText("Cut-off\nGEN"),
      pdfSafeText("Cut-off\nPER"),
      pdfSafeText("Cut-off\nDOC"),
      pdfSafeText("Cut-off\nTransit"),
      pdfSafeText("R/U"),
      ...OPS_KEYS.map((k) => pdfSafeText(OPS_DAY_HEADER_EN[k])),
      pdfSafeText("Remark"),
    ],
  ];

  const opsMark = (v: string): string => {
    const s = String(v ?? "").trim();
    if (!s) return "";
    if (s === "X" || s === "x") return "X";
    return pdfSafeText(s);
  };

  const dayTotals = countFlightsWithDayTick(state.rows);
  const body = state.rows.map((r) => {
    const row = [
      safeCell(r.flt),
      safeCell(r.ac),
      safeCell(r.rtg),
      safeCell(r.std),
      safeCell(r.gen),
      safeCell(r.per),
      safeCell(r.doc),
      safeCell(r.transit),
      safeCell(r.bu),
      ...OPS_KEYS.map((k) => opsMark(r.ops[k])),
      safeCell(r.remark),
    ];
    return row;
  });
  body.push([
    pdfSafeText("TOTAL (Flights / day)"),
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    ...dayTotals.map((n) => String(n)),
    "",
  ]);

  autoTable(doc, {
    startY: 20,
    head,
    body,
    theme: "grid",
    tableLineColor: [0, 0, 0],
    tableLineWidth: 0.2,
    styles: {
      font: "helvetica",
      fontSize: 8,
      cellPadding: 0.7,
      lineWidth: 0.2,
      lineColor: [0, 0, 0],
      textColor: [0, 0, 0],
      overflow: "linebreak",
      halign: "center",
      valign: "middle",
    },
    headStyles: {
      fillColor: [255, 255, 0],
      textColor: [0, 0, 0],
      fontStyle: "bold",
      fontSize: 9,
    },
    columnStyles: {
      0: { cellWidth: 18 },
      1: { cellWidth: 12 },
      2: { cellWidth: 21 },
      3: { cellWidth: 12 },
      4: { cellWidth: 12 },
      5: { cellWidth: 12 },
      6: { cellWidth: 12 },
      7: { cellWidth: 14 },
      8: { cellWidth: 13 },
      9: { cellWidth: 8 },
      10: { cellWidth: 8 },
      11: { cellWidth: 8 },
      12: { cellWidth: 8 },
      13: { cellWidth: 8 },
      14: { cellWidth: 8 },
      15: { cellWidth: 8 },
      16: { cellWidth: 37, halign: "left" },
    },
    didParseCell: (hook) => {
      if (hook.section === "body") {
        const row = state.rows[hook.row.index];
        const isTotalRow = hook.row.index === state.rows.length;
        if (isTotalRow) {
          hook.cell.styles.fontStyle = "bold";
          hook.cell.styles.textColor = [0, 0, 0];
          hook.cell.styles.fillColor = [245, 245, 245];
        } else if (row) {
          const col = printTextColorForSeason(row);
          if (col === "#1d4ed8") hook.cell.styles.textColor = [29, 78, 216];
          else hook.cell.styles.textColor = [185, 28, 28];
        }
      }
      // SUN column pastel
      if (hook.column.index === 15) {
        hook.cell.styles.fillColor = [252, 228, 228];
      }
      if (hook.section === "body" && hook.column.index === 16) {
        hook.cell.styles.halign = "left";
      }
    },
  });

  const endY = (doc as unknown as { lastAutoTable?: { finalY?: number } }).lastAutoTable
    ?.finalY;
  const legendY = (endY ?? 180) + 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  const legend = pdfSafeText(
    "Ky hieu: X = co khai thac        HH:MM = chuyen co gio STD dac biet trong ngay do        - = khong ap dung (N/A)"
  );
  const legendLines = doc.splitTextToSize(legend, 277);
  doc.text(legendLines, 10, legendY);

  doc.save("EXP_SKDHDL_UPDATE.pdf");
}

import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import type { ExportParams, Flight } from "./schedule/flightTypes";

export type { ExportParams, Flight } from "./schedule/flightTypes";

export function airlinePrefix(flt: string): string {
  let p = "";
  for (const ch of flt) {
    if (/[A-Za-z]/.test(ch)) p += ch;
    else break;
  }
  return p || flt.slice(0, 2);
}

function stdSortKey(std: string): number {
  const m = std.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return 99999;
  return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
}

function sortFlights(flights: Flight[]): Flight[] {
  return [...flights].sort((a, b) => {
    const pa = airlinePrefix(a.flt);
    const pb = airlinePrefix(b.flt);
    if (pa !== pb) return pa.localeCompare(pb);
    return stdSortKey(a.std) - stdSortKey(b.std);
  });
}

const EM_DASH = "\u2014";
const BLACK_CIRCLE = "\u25CF";
const timeRegex = /(\d{1,2}:\d{2})/;

const BD_BODY = {
  top: { style: "thin" as const, color: { argb: "FF000000" } },
  bottom: { style: "thin" as const, color: { argb: "FF000000" } },
  left: { style: "thin" as const, color: { argb: "FF000000" } },
  right: { style: "thin" as const, color: { argb: "FF000000" } },
};

const BD_TOTAL = {
  top: { style: "medium" as const, color: { argb: "FF000000" } },
  bottom: { style: "medium" as const, color: { argb: "FF000000" } },
  left: { style: "thin" as const, color: { argb: "FF000000" } },
  right: { style: "thin" as const, color: { argb: "FF000000" } },
};

const GRAY_TOTAL_FILL = {
  type: "pattern" as const,
  pattern: "solid" as const,
  fgColor: { argb: "FFBFBFBF" },
};

const HEADERS = [
  "Flt Nbr",
  "A/C",
  "Routing",
  "STD",
  "Cut-off\nGEN",
  "Cut-off\nPER",
  "Cut-off\nDOC",
  "Cut-off\nTransit",
  "B/U Done",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sun",
  "Remark",
];

const COL_LETTERS = ["J", "K", "L", "M", "N", "O", "P"];

const EMPTY_FLIGHT_ROW: Flight = {
  flt: "",
  ac: "",
  rtg: "",
  std: "",
  coGen: "",
  coPer: "",
  coDoc: "",
  coTransit: "",
  buDone: "",
  days: [null, null, null, null, null, null, null],
  remark: "",
};

function ensureSevenDays(days: (string | null | undefined)[]): (string | null)[] {
  const out: (string | null)[] = [];
  for (let i = 0; i < 7; i++) {
    const v = days[i];
    if (v === null || v === undefined) out.push(null);
    else if (typeof v === "string" && v.trim() === "") out.push(null);
    else out.push(v);
  }
  return out;
}

function downloadBlob(blob: Blob, filename: string): void {
  try {
    saveAs(blob, filename);
  } catch {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  }
}

export async function exportFlightSchedule(params: ExportParams): Promise<void> {
  const rawFlights = params.flights.map((f) => ({
    ...f,
    days: ensureSevenDays(f.days),
  }));

  const sortedFlights =
    rawFlights.length > 0 ? sortFlights(rawFlights) : [EMPTY_FLIGHT_ROW];

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "SCSC/OPS/EXP";
  workbook.created = new Date();

  const ws = workbook.addWorksheet("Flight Schedule", {
    views: [
      {
        state: "frozen",
        xSplit: 0,
        ySplit: 4,
        zoomScale: 100,
        showGridLines: false,
      },
    ],
    pageSetup: {
      paperSize: 9,
      orientation: "landscape",
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 1,
      horizontalCentered: true,
      verticalCentered: false,
      margins: {
        left: 0.3,
        right: 0.3,
        top: 0.4,
        bottom: 0.4,
        header: 0.2,
        footer: 0.2,
      },
      printTitlesRow: "1:4",
      showGridLines: false,
    },
    headerFooter: {
      oddFooter:
        "&L&9SCSC/OPS/EXP — EXP SKDHDL&C&9Page &P of &N&R&9Printed &D &T",
    },
    properties: { defaultRowHeight: 19 },
  });

  const widths = [9, 7, 11, 7, 9, 9, 9, 10, 9, 5, 5, 5, 5, 5, 5, 5, 22];
  widths.forEach((w, i) => {
    ws.getColumn(i + 1).width = w;
  });

  ws.mergeCells("A1:Q1");
  const t1 = ws.getCell("A1");
  t1.value = "SUM2025 — FLIGHT SCHEDULE & HANDLING (EXPORT)";
  t1.font = { name: "Arial", bold: true, size: 15, color: { argb: "FF000000" } };
  t1.alignment = { horizontal: "center", vertical: "middle" };
  ws.getRow(1).height = 28;

  ws.mergeCells("A2:Q2");
  const t2 = ws.getCell("A2");
  t2.value = `SCSC / OPS / EXP          Updated: ${params.updatedDate}          INTERNAL USE ONLY`;
  t2.font = { name: "Arial", size: 10, color: { argb: "FF000000" } };
  t2.alignment = { horizontal: "center", vertical: "middle" };
  ws.getRow(2).height = 18;

  ws.getRow(3).height = 8;

  const headerRow = ws.getRow(4);
  HEADERS.forEach((h, i) => {
    const cell = headerRow.getCell(i + 1);
    cell.value = h;
    cell.font = {
      name: "Arial",
      bold: true,
      size: 10,
      color: { argb: "FF000000" },
    };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFD9D9D9" },
    };
    cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    cell.border = {
      top: { style: "medium", color: { argb: "FF000000" } },
      bottom: { style: "medium", color: { argb: "FF000000" } },
      left: { style: "thin", color: { argb: "FF000000" } },
      right: { style: "thin", color: { argb: "FF000000" } },
    };
  });
  headerRow.height = 34;

  const startRow = 5;
  sortedFlights.forEach((flight, idx) => {
    const rowNum = startRow + idx;
    const row = ws.getRow(rowNum);

    const baseVals = [
      flight.flt,
      flight.ac,
      flight.rtg,
      flight.std,
      flight.coGen,
      flight.coPer,
      flight.coDoc,
      flight.coTransit,
      flight.buDone,
    ];

    baseVals.forEach((v, i) => {
      const cell = row.getCell(i + 1);
      const trimmed = v != null ? String(v).trim() : "";
      cell.value = trimmed ? trimmed : EM_DASH;
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.border = BD_BODY;
      cell.font = {
        name: "Arial",
        size: 10,
        bold: i === 0,
        color: { argb: "FF000000" },
      };
    });

    flight.days.forEach((dval, di) => {
      const cell = row.getCell(10 + di);
      cell.border = BD_BODY;
      cell.alignment = { horizontal: "center", vertical: "middle" };

      if (dval === null || dval === undefined) {
        cell.value = "";
        cell.font = { name: "Arial", size: 10, color: { argb: "FF000000" } };
        return;
      }

      const s = String(dval).trim();
      if (s === "X" || s === "x") {
        cell.value = BLACK_CIRCLE;
        cell.font = {
          name: "Arial",
          bold: true,
          size: 12,
          color: { argb: "FF000000" },
        };
      } else {
        const m = s.match(timeRegex);
        cell.value = m ? m[1] : s;
        cell.font = {
          name: "Arial",
          bold: true,
          size: 9,
          color: { argb: "FF000000" },
        };
      }
    });

    const rCell = row.getCell(17);
    rCell.value = flight.remark || "";
    rCell.alignment = {
      horizontal: "left",
      vertical: "middle",
      wrapText: true,
      indent: 1,
    };
    rCell.border = BD_BODY;
    rCell.font = {
      name: "Arial",
      italic: true,
      size: 9,
      color: { argb: "FF000000" },
    };

    row.height = 19;
  });

  const totalRowNum = startRow + sortedFlights.length;
  const totalRow = ws.getRow(totalRowNum);

  ws.mergeCells(totalRowNum, 1, totalRowNum, 9);

  for (let c = 1; c <= 9; c++) {
    const cell = totalRow.getCell(c);
    cell.fill = GRAY_TOTAL_FILL;
    cell.border = BD_TOTAL;
  }
  const labelCell = totalRow.getCell(1);
  labelCell.value = "TOTAL  (Flights / day)";
  labelCell.font = {
    name: "Arial",
    bold: true,
    size: 11,
    color: { argb: "FF000000" },
  };
  labelCell.alignment = { horizontal: "center", vertical: "middle" };

  const dataEndRow = totalRowNum - 1;
  COL_LETTERS.forEach((col, di) => {
    const cell = totalRow.getCell(10 + di);
    cell.value = {
      formula: `COUNTA(${col}${startRow}:${col}${dataEndRow})`,
    };
    cell.font = {
      name: "Arial",
      bold: true,
      size: 12,
      color: { argb: "FF000000" },
    };
    cell.fill = GRAY_TOTAL_FILL;
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.border = BD_TOTAL;
  });

  const qCell = totalRow.getCell(17);
  qCell.value = "";
  qCell.fill = GRAY_TOTAL_FILL;
  qCell.border = BD_TOTAL;

  totalRow.height = 24;

  ws.getRow(totalRowNum + 1).height = 6;

  const legendRowNum = totalRowNum + 2;
  ws.mergeCells(legendRowNum, 1, legendRowNum, 17);
  const lCell = ws.getCell(`A${legendRowNum}`);
  lCell.value =
    "Ký hiệu:     ●  =  có khai thác        " +
    "HH:MM  =  chuyến có giờ STD đặc biệt trong ngày đó        " +
    "—  =  không áp dụng (N/A)";
  lCell.font = {
    name: "Arial",
    italic: true,
    size: 9,
    color: { argb: "FF000000" },
  };
  lCell.alignment = { horizontal: "left", vertical: "middle", indent: 1 };
  ws.getRow(legendRowNum).height = 18;

  ws.pageSetup.printArea = `A1:Q${legendRowNum}`;

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const today = new Date();
  const dd = String(today.getDate()).padStart(2, "0");
  const MMM = today.toLocaleString("en-US", { month: "short" }).toUpperCase();
  const YY = String(today.getFullYear()).slice(-2);
  const filename = `EXP_SKDHDL_UPDATE_${dd}${MMM}${YY}.xlsx`;

  downloadBlob(blob, filename);
}


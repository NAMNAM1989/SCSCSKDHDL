"use strict";
(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // node_modules/file-saver/dist/FileSaver.min.js
  var require_FileSaver_min = __commonJS({
    "node_modules/file-saver/dist/FileSaver.min.js"(exports, module) {
      (function(a, b) {
        if ("function" == typeof define && define.amd) define([], b);
        else if ("undefined" != typeof exports) b();
        else {
          b(), a.FileSaver = { exports: {} }.exports;
        }
      })(exports, function() {
        "use strict";
        function b(a2, b2) {
          return "undefined" == typeof b2 ? b2 = { autoBom: false } : "object" != typeof b2 && (console.warn("Deprecated: Expected third argument to be a object"), b2 = { autoBom: !b2 }), b2.autoBom && /^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(a2.type) ? new Blob(["\uFEFF", a2], { type: a2.type }) : a2;
        }
        function c(a2, b2, c2) {
          var d2 = new XMLHttpRequest();
          d2.open("GET", a2), d2.responseType = "blob", d2.onload = function() {
            g(d2.response, b2, c2);
          }, d2.onerror = function() {
            console.error("could not download file");
          }, d2.send();
        }
        function d(a2) {
          var b2 = new XMLHttpRequest();
          b2.open("HEAD", a2, false);
          try {
            b2.send();
          } catch (a3) {
          }
          return 200 <= b2.status && 299 >= b2.status;
        }
        function e(a2) {
          try {
            a2.dispatchEvent(new MouseEvent("click"));
          } catch (c2) {
            var b2 = document.createEvent("MouseEvents");
            b2.initMouseEvent("click", true, true, window, 0, 0, 0, 80, 20, false, false, false, false, 0, null), a2.dispatchEvent(b2);
          }
        }
        var f = "object" == typeof window && window.window === window ? window : "object" == typeof self && self.self === self ? self : "object" == typeof global && global.global === global ? global : void 0, a = f.navigator && /Macintosh/.test(navigator.userAgent) && /AppleWebKit/.test(navigator.userAgent) && !/Safari/.test(navigator.userAgent), g = f.saveAs || ("object" != typeof window || window !== f ? function() {
        } : "download" in HTMLAnchorElement.prototype && !a ? function(b2, g2, h) {
          var i = f.URL || f.webkitURL, j = document.createElement("a");
          g2 = g2 || b2.name || "download", j.download = g2, j.rel = "noopener", "string" == typeof b2 ? (j.href = b2, j.origin === location.origin ? e(j) : d(j.href) ? c(b2, g2, h) : e(j, j.target = "_blank")) : (j.href = i.createObjectURL(b2), setTimeout(function() {
            i.revokeObjectURL(j.href);
          }, 4e4), setTimeout(function() {
            e(j);
          }, 0));
        } : "msSaveOrOpenBlob" in navigator ? function(f2, g2, h) {
          if (g2 = g2 || f2.name || "download", "string" != typeof f2) navigator.msSaveOrOpenBlob(b(f2, h), g2);
          else if (d(f2)) c(f2, g2, h);
          else {
            var i = document.createElement("a");
            i.href = f2, i.target = "_blank", setTimeout(function() {
              e(i);
            });
          }
        } : function(b2, d2, e2, g2) {
          if (g2 = g2 || open("", "_blank"), g2 && (g2.document.title = g2.document.body.innerText = "downloading..."), "string" == typeof b2) return c(b2, d2, e2);
          var h = "application/octet-stream" === b2.type, i = /constructor/i.test(f.HTMLElement) || f.safari, j = /CriOS\/[\d]+/.test(navigator.userAgent);
          if ((j || h && i || a) && "undefined" != typeof FileReader) {
            var k = new FileReader();
            k.onloadend = function() {
              var a2 = k.result;
              a2 = j ? a2 : a2.replace(/^data:[^;]*;/, "data:attachment/file;"), g2 ? g2.location.href = a2 : location = a2, g2 = null;
            }, k.readAsDataURL(b2);
          } else {
            var l = f.URL || f.webkitURL, m = l.createObjectURL(b2);
            g2 ? g2.location = m : location.href = m, g2 = null, setTimeout(function() {
              l.revokeObjectURL(m);
            }, 4e4);
          }
        });
        f.saveAs = g.saveAs = g, "undefined" != typeof module && (module.exports = g);
      });
    }
  });

  // src/lib/exportFlightSchedule.ts
  var import_file_saver = __toESM(require_FileSaver_min());
  function getExcelJS() {
    const w = globalThis;
    if (!w.ExcelJS?.Workbook) {
      throw new Error(
        "Thi\u1EBFu exceljs.min.js \u2014 \u0111\u1EB7t file n\xE0y c\u1EA1nh index.html (tr\u01B0\u1EDBc exportFlightSchedule.bundle.js)."
      );
    }
    return w.ExcelJS;
  }
  function airlinePrefix(flt) {
    let p = "";
    for (const ch of flt) {
      if (/[A-Za-z]/.test(ch)) p += ch;
      else break;
    }
    return p || flt.slice(0, 2);
  }
  function stdSortKey(std) {
    const m = std.trim().match(/^(\d{1,2}):(\d{2})$/);
    if (!m) return 99999;
    return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
  }
  function sortFlights(flights) {
    return [...flights].sort((a, b) => {
      const pa = airlinePrefix(a.flt);
      const pb = airlinePrefix(b.flt);
      if (pa !== pb) return pa.localeCompare(pb);
      return stdSortKey(a.std) - stdSortKey(b.std);
    });
  }
  var EM_DASH = "\u2014";
  var BLACK_CIRCLE = "\u25CF";
  var timeRegex = /(\d{1,2}:\d{2})/;
  var BD_BODY = {
    top: { style: "thin", color: { argb: "FF000000" } },
    bottom: { style: "thin", color: { argb: "FF000000" } },
    left: { style: "thin", color: { argb: "FF000000" } },
    right: { style: "thin", color: { argb: "FF000000" } }
  };
  var BD_TOTAL = {
    top: { style: "medium", color: { argb: "FF000000" } },
    bottom: { style: "medium", color: { argb: "FF000000" } },
    left: { style: "thin", color: { argb: "FF000000" } },
    right: { style: "thin", color: { argb: "FF000000" } }
  };
  var GRAY_TOTAL_FILL = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFBFBFBF" }
  };
  var HEADERS = [
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
    "Remark"
  ];
  var COL_LETTERS = ["J", "K", "L", "M", "N", "O", "P"];
  var EMPTY_FLIGHT_ROW = {
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
    remark: ""
  };
  function ensureSevenDays(days) {
    const out = [];
    for (let i = 0; i < 7; i++) {
      const v = days[i];
      if (v === null || v === void 0) out.push(null);
      else if (typeof v === "string" && v.trim() === "") out.push(null);
      else out.push(v);
    }
    return out;
  }
  function downloadBlob(blob, filename) {
    try {
      (0, import_file_saver.saveAs)(blob, filename);
    } catch {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      a.click();
      URL.revokeObjectURL(a.href);
    }
  }
  async function exportFlightSchedule(params) {
    const rawFlights = params.flights.map((f) => ({
      ...f,
      days: ensureSevenDays(f.days)
    }));
    const sortedFlights = rawFlights.length > 0 ? sortFlights(rawFlights) : [EMPTY_FLIGHT_ROW];
    const ExcelJS = getExcelJS();
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "SCSC/OPS/EXP";
    workbook.created = /* @__PURE__ */ new Date();
    const ws = workbook.addWorksheet("Flight Schedule", {
      views: [
        {
          state: "frozen",
          xSplit: 0,
          ySplit: 4,
          zoomScale: 100,
          showGridLines: false
        }
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
          footer: 0.2
        },
        printTitlesRow: "1:4",
        showGridLines: false
      },
      headerFooter: {
        oddFooter: "&L&9SCSC/OPS/EXP \u2014 EXP SKDHDL&C&9Page &P of &N&R&9Printed &D &T"
      },
      properties: { defaultRowHeight: 19 }
    });
    const widths = [9, 7, 11, 7, 9, 9, 9, 10, 9, 5, 5, 5, 5, 5, 5, 5, 22];
    widths.forEach((w, i) => {
      ws.getColumn(i + 1).width = w;
    });
    ws.mergeCells("A1:Q1");
    const t1 = ws.getCell("A1");
    t1.value = "SUM2025 \u2014 FLIGHT SCHEDULE & HANDLING (EXPORT)";
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
        color: { argb: "FF000000" }
      };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFD9D9D9" }
      };
      cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
      cell.border = {
        top: { style: "medium", color: { argb: "FF000000" } },
        bottom: { style: "medium", color: { argb: "FF000000" } },
        left: { style: "thin", color: { argb: "FF000000" } },
        right: { style: "thin", color: { argb: "FF000000" } }
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
        flight.buDone
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
          color: { argb: "FF000000" }
        };
      });
      flight.days.forEach((dval, di) => {
        const cell = row.getCell(10 + di);
        cell.border = BD_BODY;
        cell.alignment = { horizontal: "center", vertical: "middle" };
        if (dval === null || dval === void 0) {
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
            color: { argb: "FF000000" }
          };
        } else {
          const m = s.match(timeRegex);
          cell.value = m ? m[1] : s;
          cell.font = {
            name: "Arial",
            bold: true,
            size: 9,
            color: { argb: "FF000000" }
          };
        }
      });
      const rCell = row.getCell(17);
      rCell.value = flight.remark || "";
      rCell.alignment = {
        horizontal: "left",
        vertical: "middle",
        wrapText: true,
        indent: 1
      };
      rCell.border = BD_BODY;
      rCell.font = {
        name: "Arial",
        italic: true,
        size: 9,
        color: { argb: "FF000000" }
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
      color: { argb: "FF000000" }
    };
    labelCell.alignment = { horizontal: "center", vertical: "middle" };
    const dataEndRow = totalRowNum - 1;
    COL_LETTERS.forEach((col, di) => {
      const cell = totalRow.getCell(10 + di);
      cell.value = {
        formula: `COUNTA(${col}${startRow}:${col}${dataEndRow})`
      };
      cell.font = {
        name: "Arial",
        bold: true,
        size: 12,
        color: { argb: "FF000000" }
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
    lCell.value = "K\xFD hi\u1EC7u:     \u25CF  =  c\xF3 khai th\xE1c        HH:MM  =  chuy\u1EBFn c\xF3 gi\u1EDD STD \u0111\u1EB7c bi\u1EC7t trong ng\xE0y \u0111\xF3        \u2014  =  kh\xF4ng \xE1p d\u1EE5ng (N/A)";
    lCell.font = {
      name: "Arial",
      italic: true,
      size: 9,
      color: { argb: "FF000000" }
    };
    lCell.alignment = { horizontal: "left", vertical: "middle", indent: 1 };
    ws.getRow(legendRowNum).height = 18;
    ws.pageSetup.printArea = `A1:Q${legendRowNum}`;
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    });
    const today = /* @__PURE__ */ new Date();
    const dd = String(today.getDate()).padStart(2, "0");
    const MMM = today.toLocaleString("en-US", { month: "short" }).toUpperCase();
    const YY = String(today.getFullYear()).slice(-2);
    const filename = `EXP_SKDHDL_UPDATE_${dd}${MMM}${YY}.xlsx`;
    downloadBlob(blob, filename);
  }
  if (typeof window !== "undefined") {
    window.exportFlightSchedule = exportFlightSchedule;
  }
})();

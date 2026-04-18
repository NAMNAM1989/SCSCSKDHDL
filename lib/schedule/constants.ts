import type { OpsKey, ScheduleRow } from "./types";

export const STORAGE_KEY = "cutoff-scsc-rows-v2";
export const META_KEY = "cutoff-scsc-meta-v2";
export const SAVE_MS = 300;

export const OPS_KEYS = [
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
  "sun",
] as const;

/** Nhãn ngắn theo lịch VN (desktop — cột OPS) */
export const OPS_DAY_LABELS: Record<OpsKey, string> = {
  mon: "T2",
  tue: "T3",
  wed: "T4",
  thu: "T5",
  fri: "T6",
  sat: "T7",
  sun: "CN",
};

/** Nhãn cột OPS kiểu bảng cut-off (MON…SUN) — gọn ngang */
export const OPS_DAY_HEADER_EN: Record<OpsKey, string> = {
  mon: "MON",
  tue: "TUE",
  wed: "WED",
  thu: "THU",
  fri: "FRI",
  sat: "SAT",
  sun: "SUN",
};

export const TIME_FIELDS = ["std", "gen", "per", "doc", "transit", "bu"] as const;

export const SEED_ROWS: Omit<ScheduleRow, "id" | "orig" | "mb">[] = [
  {
    flt: "VJ811",
    ac: "A321",
    rtg: "SGN-SIN",
    std: "06:00",
    gen: "04:00",
    per: "",
    doc: "",
    transit: "",
    bu: "05:00",
    ops: {
      mon: "X",
      tue: "X",
      wed: "X",
      thu: "X",
      fri: "X",
      sat: "X",
      sun: "X",
    },
    remark: "",
  },
  {
    flt: "CV7856",
    ac: "B747F",
    rtg: "SGN-LUX",
    std: "01:25",
    gen: "19:25",
    per: "N/A",
    doc: "N/A",
    transit: "N/A",
    bu: "21:25",
    ops: { mon: "", tue: "", wed: "", thu: "", fri: "", sat: "", sun: "X" },
    remark: "",
  },
  {
    flt: "TG551",
    ac: "A320",
    rtg: "SGN-BKK",
    std: "08:30",
    gen: "06:30",
    per: "",
    doc: "",
    transit: "",
    bu: "07:00",
    ops: {
      mon: "X",
      tue: "X",
      wed: "X",
      thu: "X",
      fri: "X",
      sat: "X",
      sun: "X",
    },
    remark: "",
  },
];

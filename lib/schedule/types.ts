export type OpsKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export interface OpsMap {
  mon: string;
  tue: string;
  wed: string;
  thu: string;
  fri: string;
  sat: string;
  sun: string;
}

export interface OrigSnapshot {
  std: string;
  gen: string;
  per: string;
  doc: string;
  transit: string;
  bu: string;
}

export interface MbMap {
  gen: number | null;
  per: number | null;
  doc: number | null;
  transit: number | null;
  bu: number | null;
}

export interface ScheduleRow {
  id: string;
  flt: string;
  ac: string;
  rtg: string;
  std: string;
  gen: string;
  per: string;
  doc: string;
  transit: string;
  bu: string;
  ops: OpsMap;
  remark: string;
  orig?: OrigSnapshot | null;
  mb?: MbMap | null;
}

export interface ScheduleMeta {
  updatedDate: string;
}

export interface ScheduleState {
  rows: ScheduleRow[];
  meta: ScheduleMeta;
}

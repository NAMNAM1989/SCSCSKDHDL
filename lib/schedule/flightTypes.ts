export interface Flight {
  flt: string;
  ac: string;
  rtg: string;
  std: string;
  coGen: string;
  coPer: string;
  coDoc: string;
  coTransit: string;
  buDone: string;
  days: (string | null)[];
  remark: string;
}

export interface ExportParams {
  flights: Flight[];
  updatedDate: string;
}

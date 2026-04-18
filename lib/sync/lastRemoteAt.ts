const KEY = "cutoff-scsc-last-remote-at-v1";

/** Chưa từng áp timestamp từ server — dùng để không ghi đè seed local bằng payload rỗng */
export const NEVER_SYNCED_AT = "1970-01-01T00:00:00.000Z";

export function getLastRemoteIso(): string {
  try {
    if (typeof localStorage === "undefined") return NEVER_SYNCED_AT;
    return localStorage.getItem(KEY) || NEVER_SYNCED_AT;
  } catch {
    return NEVER_SYNCED_AT;
  }
}

export function hasNeverSyncedFromRemote(): boolean {
  return getLastRemoteIso() === NEVER_SYNCED_AT;
}

export function setLastRemoteIso(iso: string): void {
  try {
    if (typeof localStorage !== "undefined") localStorage.setItem(KEY, iso);
  } catch {
    /* ignore */
  }
}

export function clearLastRemoteIso(): void {
  try {
    if (typeof localStorage !== "undefined") localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

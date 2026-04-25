/** Cấu hình Supabase do người dùng lưu trên từng trình duyệt (điện thoại / máy khác). */

export type SyncLocalPrefs = {
  url: string;
  key: string;
  docId: string;
};

const K_URL = "scsc_sync_supabase_url";
const K_KEY = "scsc_sync_supabase_anon_key";
const K_DOC = "scsc_sync_doc_id";

export function readSyncPrefsFromLocalStorage(): SyncLocalPrefs | null {
  if (typeof window === "undefined") return null;
  try {
    const url = localStorage.getItem(K_URL)?.trim() ?? "";
    const key = localStorage.getItem(K_KEY)?.trim() ?? "";
    const docId = localStorage.getItem(K_DOC)?.trim() || "default";
    if (url && key) return { url, key, docId };
  } catch {
    /* private mode, v.v. */
  }
  return null;
}

export function saveSyncPrefsToLocalStorage(p: SyncLocalPrefs): void {
  localStorage.setItem(K_URL, p.url.trim());
  localStorage.setItem(K_KEY, p.key.trim());
  localStorage.setItem(K_DOC, (p.docId || "default").trim());
}

export function clearSyncPrefsFromLocalStorage(): void {
  try {
    localStorage.removeItem(K_URL);
    localStorage.removeItem(K_KEY);
    localStorage.removeItem(K_DOC);
  } catch {
    /* ignore */
  }
}

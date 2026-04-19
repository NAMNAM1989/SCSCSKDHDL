/** Biến môi trường build (NEXT_PUBLIC_*) + override runtime (sync-config.json / Docker). */

type RuntimeOverride = {
  url: string;
  key: string;
  docId: string;
};

let runtimeOverride: RuntimeOverride | null = null;

/**
 * Áp dụng URL/key từ sync-config.json (Railway / runtime).
 * Dùng dynamic import để tránh vòng phụ thuộc với remoteSupabase.
 */
export function applySyncRuntimeOverride(c: RuntimeOverride): void {
  runtimeOverride = c;
  void import("./remoteSupabase").then((m) => m.resetSupabaseClient());
}

/** Xoá override (ví dụ user gỡ cấu hình cloud trên máy này). */
export function clearSyncRuntimeOverride(): void {
  runtimeOverride = null;
  void import("./remoteSupabase").then((m) => m.resetSupabaseClient());
}

/** Đã nhúng URL + anon key lúc build (NEXT_PUBLIC_*). */
export function hasEmbeddedSupabaseEnv(): boolean {
  const u = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const k = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  return Boolean(u && k);
}

export function getSupabaseUrl(): string | undefined {
  const v = runtimeOverride?.url ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  return typeof v === "string" && v.trim() ? v.trim() : undefined;
}

export function getSupabaseAnonKey(): string | undefined {
  const v = runtimeOverride?.key ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return typeof v === "string" && v.trim() ? v.trim() : undefined;
}

export function getSyncDocId(): string {
  const v = runtimeOverride?.docId ?? process.env.NEXT_PUBLIC_SYNC_DOC_ID;
  return typeof v === "string" && v.trim() ? v.trim() : "default";
}

export function isSupabaseConfigured(): boolean {
  return Boolean(getSupabaseUrl() && getSupabaseAnonKey());
}

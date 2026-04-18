/** Biến môi trường — chỉ đọc phía client (NEXT_PUBLIC_*) */

export function getSupabaseUrl(): string | undefined {
  return process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || undefined;
}

export function getSupabaseAnonKey(): string | undefined {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || undefined;
}

export function getSyncDocId(): string {
  return (
    process.env.NEXT_PUBLIC_SYNC_DOC_ID?.trim() || "default"
  );
}

export function isSupabaseConfigured(): boolean {
  return Boolean(getSupabaseUrl() && getSupabaseAnonKey());
}

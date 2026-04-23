/** Một điểm dynamic-import `@supabase/supabase-js` để tách chunk và tái dùng promise. */
export type SupabaseJsModule = typeof import("@supabase/supabase-js");

let supabaseModulePromise: Promise<SupabaseJsModule> | null = null;

export function loadSupabaseJs(): Promise<SupabaseJsModule> {
  if (!supabaseModulePromise) {
    supabaseModulePromise = import("@supabase/supabase-js");
  }
  return supabaseModulePromise;
}

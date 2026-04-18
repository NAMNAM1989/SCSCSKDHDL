import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { hydrateScheduleState } from "@/lib/sync/hydrate";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/sync/env";
import type { ScheduleState } from "@/lib/schedule/types";

let client: SupabaseClient | null = null;

function getClient(): SupabaseClient | null {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();
  if (!url || !key) return null;
  if (!client) client = createClient(url, key);
  return client;
}

export async function fetchRemoteState(
  docId: string
): Promise<{ state: ScheduleState; updatedAt: string } | null> {
  const sb = getClient();
  if (!sb) return null;
  const { data, error } = await sb
    .from("schedule_state")
    .select("payload, updated_at")
    .eq("id", docId)
    .maybeSingle();
  if (error || !data) return null;
  const payload = data.payload as unknown;
  const updatedAt =
    typeof data.updated_at === "string" ? data.updated_at : null;
  if (!updatedAt) return null;
  const state = hydrateScheduleState(payload);
  if (!state) return null;
  return { state, updatedAt };
}

export async function upsertRemoteState(
  docId: string,
  state: ScheduleState
): Promise<string | null> {
  const sb = getClient();
  if (!sb) return null;
  const iso = new Date().toISOString();
  const { data, error } = await sb
    .from("schedule_state")
    .upsert(
      { id: docId, payload: state, updated_at: iso },
      { onConflict: "id" }
    )
    .select("updated_at")
    .single();
  if (error) throw error;
  const at = data?.updated_at;
  return typeof at === "string" ? at : iso;
}

export function subscribeRemoteState(
  docId: string,
  onChange: (state: ScheduleState, updatedAt: string) => void
): () => void {
  const sb = getClient();
  if (!sb) return () => {};

  const realtimeChannel = sb
    .channel(`schedule_state:${docId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "schedule_state",
        filter: `id=eq.${docId}`,
      },
      (payload) => {
        const row = payload.new as {
          payload?: unknown;
          updated_at?: string;
        } | null;
        if (!row?.payload || typeof row.updated_at !== "string") return;
        const state = hydrateScheduleState(row.payload);
        if (!state) return;
        onChange(state, row.updated_at);
      }
    )
    .subscribe();

  return () => {
    void sb.removeChannel(realtimeChannel);
  };
}

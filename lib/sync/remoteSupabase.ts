import { hydrateScheduleState } from "@/lib/sync/hydrate";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/sync/env";
import { loadSupabaseJs } from "@/lib/sync/loadSupabaseJs";
import type { ScheduleState } from "@/lib/schedule/types";
import type { SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;
let clientKey = "";

/** Gọi khi URL/key đổi (cấu hình runtime) để tạo client mới. */
export function resetSupabaseClient(): void {
  client = null;
  clientKey = "";
}

async function ensureClient(): Promise<SupabaseClient | null> {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();
  if (!url || !key) return null;
  const k = `${url}|${key}`;
  if (client && clientKey === k) return client;
  const { createClient } = await loadSupabaseJs();
  client = createClient(url, key);
  clientKey = k;
  return client;
}

export async function fetchRemoteState(
  docId: string
): Promise<{ state: ScheduleState; updatedAt: string } | null> {
  const sb = await ensureClient();
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
  const sb = await ensureClient();
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
  let cancelled = false;
  let debounce: ReturnType<typeof setTimeout> | null = null;
  let channelCleanup: (() => void) | null = null;

  void ensureClient().then((sb) => {
    if (!sb || cancelled) return;

    const schedulePull = () => {
      if (debounce) clearTimeout(debounce);
      debounce = setTimeout(() => {
        debounce = null;
        void fetchRemoteState(docId).then((r) => {
          if (!r) return;
          onChange(r.state, r.updatedAt);
        });
      }, 280);
    };

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
        () => {
          schedulePull();
        }
      )
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          schedulePull();
        }
      });

    channelCleanup = () => {
      if (debounce) clearTimeout(debounce);
      debounce = null;
      void sb.removeChannel(realtimeChannel);
    };
  });

  return () => {
    cancelled = true;
    if (debounce) clearTimeout(debounce);
    debounce = null;
    channelCleanup?.();
    channelCleanup = null;
  };
}

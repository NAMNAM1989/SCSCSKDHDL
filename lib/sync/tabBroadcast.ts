import type { ScheduleState } from "@/lib/schedule/types";

const CHANNEL = "cutoff-scsc-schedule-v1";

export type TabMessage = {
  type: "schedule";
  state: ScheduleState;
  source: string;
};

export function createTabSync(
  tabId: string,
  onRemote: (state: ScheduleState) => void
): { broadcast: (state: ScheduleState) => void; close: () => void } {
  if (typeof BroadcastChannel === "undefined") {
    return { broadcast: () => {}, close: () => {} };
  }
  const bc = new BroadcastChannel(CHANNEL);
  bc.onmessage = (ev: MessageEvent<TabMessage>) => {
    const d = ev.data;
    if (!d || d.type !== "schedule" || d.source === tabId) return;
    onRemote(d.state);
  };
  return {
    broadcast(state: ScheduleState) {
      bc.postMessage({ type: "schedule", state, source: tabId } satisfies TabMessage);
    },
    close() {
      bc.close();
    },
  };
}

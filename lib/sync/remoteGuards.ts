import { hasNeverSyncedFromRemote } from "@/lib/sync/lastRemoteAt";
import type { ScheduleState } from "@/lib/schedule/types";

/** Tránh ghi đè seed local bằng bản cloud rỗng trước khi user lần đầu đồng bộ */
export function shouldSkipEmptyRemoteOverwrite(
  remote: ScheduleState,
  localRowCount: number
): boolean {
  return (
    hasNeverSyncedFromRemote() &&
    remote.rows.length === 0 &&
    localRowCount > 0
  );
}

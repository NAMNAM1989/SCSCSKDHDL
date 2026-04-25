"use client";

import dynamic from "next/dynamic";

/**
 * Tách chunk lịch (bảng + mobile + sheet) khỏi entry route — giảm JS ban đầu.
 */
export const ScheduleClientDynamic = dynamic(
  () =>
    import("./ScheduleClient").then((m) => ({
      default: m.ScheduleClient,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[40vh] flex-1 items-center justify-center px-4 text-sm text-zinc-500 dark:text-zinc-400">
        Đang tải lịch…
      </div>
    ),
  }
);

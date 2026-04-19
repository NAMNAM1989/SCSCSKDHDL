"use client";

import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useSchedule } from "@/components/providers/ScheduleProvider";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export default function ProfilePage() {
  const { theme, setTheme } = useTheme();
  const { clearDraft, sync } = useSchedule();

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Giao diện, đồng bộ và dữ liệu cục bộ."
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Giao diện
          </p>
          <div className="mt-4 flex gap-3">
            <Button
              variant={theme === "light" ? "primary" : "secondary"}
              className="flex-1"
              onClick={() => setTheme("light")}
            >
              <Sun className="mr-2 h-4 w-4" /> Sáng
            </Button>
            <Button
              variant={theme === "dark" ? "primary" : "secondary"}
              className="flex-1"
              onClick={() => setTheme("dark")}
            >
              <Moon className="mr-2 h-4 w-4" /> Tối
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Đồng bộ
          </p>
          <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            {sync.cloudEnabled ? (
              <>
                <span className="font-medium text-emerald-700 dark:text-emerald-400">
                  Supabase Realtime
                </span>
                {" — "}
                thay đổi đẩy lên cloud; thiết bị khác nhận cập nhật gần thời
                gian thực.
              </>
            ) : (
              <>
                Chưa bật cloud: thêm{" "}
                <code className="rounded-md bg-zinc-100 px-1.5 py-0.5 text-xs dark:bg-zinc-800">
                  NEXT_PUBLIC_SUPABASE_URL
                </code>{" "}
                +{" "}
                <code className="rounded-md bg-zinc-100 px-1.5 py-0.5 text-xs dark:bg-zinc-800">
                  NEXT_PUBLIC_SUPABASE_ANON_KEY
                </code>{" "}
                lúc build, hoặc trên Railway đặt{" "}
                <code className="rounded-md bg-zinc-100 px-1.5 py-0.5 text-xs dark:bg-zinc-800">
                  SYNC_SUPABASE_URL
                </code>{" "}
                /{" "}
                <code className="rounded-md bg-zinc-100 px-1.5 py-0.5 text-xs dark:bg-zinc-800">
                  SYNC_SUPABASE_ANON_KEY
                </code>{" "}
                (file{" "}
                <code className="rounded-md bg-zinc-100 px-1.5 py-0.5 text-xs dark:bg-zinc-800">
                  sync-config.json
                </code>{" "}
                tạo khi container khởi động). Chỉ tab cùng máy đồng bộ qua
                BroadcastChannel.
              </>
            )}
          </p>
          {sync.cloudEnabled && sync.lastRemoteAt ? (
            <p className="mt-3 text-xs text-zinc-500">
              Lần đồng bộ server:{" "}
              {new Date(sync.lastRemoteAt).toLocaleString("vi-VN")}
            </p>
          ) : null}
          {sync.error ? (
            <p className="mt-3 text-xs text-red-600 dark:text-red-400">
              {sync.error}
            </p>
          ) : null}
          <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
            Luôn có bản sao localStorage để mở nhanh khi offline.
          </p>
          <Button
            variant="danger"
            className="mt-6 w-full"
            onClick={() => {
              if (!confirm("Xoá toàn bộ nháp?")) return;
              if (!confirm("Xác nhận lần 2.")) return;
              clearDraft();
            }}
          >
            Xoá dữ liệu cục bộ
          </Button>
        </Card>
      </div>
    </div>
  );
}

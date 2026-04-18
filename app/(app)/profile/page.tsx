"use client";

import { AppHeader } from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useSchedule } from "@/components/providers/ScheduleProvider";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export default function ProfilePage() {
  const { theme, setTheme } = useTheme();
  const { clearDraft, sync } = useSchedule();

  return (
    <div className="flex flex-1 flex-col pb-28 lg:pb-8">
      <AppHeader title="Profile" subtitle="Cài đặt nhanh" />
      <main className="mx-auto w-full max-w-md space-y-3 px-4 pt-4 lg:max-w-6xl lg:space-y-0 lg:px-6 lg:pt-4">
        <div className="grid gap-3 md:grid-cols-2 lg:gap-4">
          <Card>
            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
              Giao diện
            </p>
            <div className="mt-3 flex gap-2">
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

          <Card>
            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
              Đồng bộ
            </p>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              {sync.cloudEnabled ? (
                <>
                  <span className="font-medium text-emerald-700 dark:text-emerald-400">
                    Supabase Realtime
                  </span>
                  {" — "}
                  thay đổi được đẩy lên cloud; các thiết bị/tab khác nhận cập nhật
                  gần như tức thì (sau debounce ~300ms).
                </>
              ) : (
                <>
                  Chưa cấu hình{" "}
                  <code className="rounded bg-slate-100 px-1 text-xs dark:bg-slate-800">
                    NEXT_PUBLIC_SUPABASE_*
                  </code>
                  . Dữ liệu chỉ lưu trên trình duyệt này; đồng bộ giữa các tab
                  cùng máy qua BroadcastChannel + sự kiện storage.
                </>
              )}
            </p>
            {sync.cloudEnabled && sync.lastRemoteAt ? (
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-500">
                Lần đồng bộ server gần nhất:{" "}
                {new Date(sync.lastRemoteAt).toLocaleString("vi-VN")}
              </p>
            ) : null}
            {sync.error ? (
              <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                Lỗi đồng bộ: {sync.error}
              </p>
            ) : null}
            <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Luôn có bản sao cục bộ (localStorage) để mở nhanh khi offline.
            </p>
            <Button
              variant="danger"
              className="mt-4 w-full"
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
      </main>
    </div>
  );
}

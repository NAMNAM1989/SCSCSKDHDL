"use client";

import { AppHeader } from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useSchedule } from "@/components/providers/ScheduleProvider";
import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export default function ProfilePage() {
  const { theme, setTheme } = useTheme();
  const { clearDraft } = useSchedule();

  return (
    <div className="pb-28 lg:pb-8">
      <AppHeader title="Profile" subtitle="Cài đặt nhanh" />
      <main className="mx-auto max-w-2xl space-y-4 px-4 pt-4 lg:max-w-[min(100%,1600px)] lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
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
        </motion.div>

        <Card>
          <p className="text-[15px] leading-relaxed text-slate-600 dark:text-slate-400">
            Ứng dụng lưu dữ liệu cục bộ trên trình duyệt (localStorage). Không
            đồng bộ server.
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
      </main>
    </div>
  );
}

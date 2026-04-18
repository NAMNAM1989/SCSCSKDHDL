"use client";

import { MetricCard } from "@/components/dashboard/MetricCard";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card } from "@/components/ui/Card";
import { useSchedule } from "@/components/providers/ScheduleProvider";
import { motion } from "framer-motion";
import {
  Bell,
  Cloud,
  FileSpreadsheet,
  FileUp,
  Plane,
} from "lucide-react";

const tips = [
  {
    title: "Import / Export",
    desc: "Thanh công cụ trên trang Schedule: Excel, in PDF. Trên điện thoại dùng menu ⋮.",
    icon: FileUp,
  },
  {
    title: "Excel xuất in",
    desc: "Export tạo file EXP_SKDHDL_UPDATE_*.xlsx chuẩn in A4.",
    icon: FileSpreadsheet,
  },
  {
    title: "Tự động lưu",
    desc: "Nháp lưu sau mỗi thay đổi (~300ms). Có thể bật đồng bộ cloud trong Settings.",
    icon: Bell,
  },
];

export default function ActivityPage() {
  const { state, sync } = useSchedule();
  const rowCount = state.rows.length;

  return (
    <div>
      <PageHeader
        title="Activity"
        description="Tổng quan workspace và mẹo thao tác nhanh."
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          label="Chuyến trong bộ nhớ"
          value={rowCount}
          hint="Số dòng schedule hiện tại"
          icon={Plane}
          trend={{ positive: true, text: "Cập nhật theo thời gian thực" }}
        />
        <MetricCard
          label="Đồng bộ cloud"
          value={sync.cloudEnabled ? "Bật" : "Tắt"}
          hint={
            sync.cloudEnabled
              ? "Supabase Realtime"
              : "Cấu hình trong Settings"
          }
          icon={Bell}
        />
        <MetricCard
          label="Workspace"
          value="SCSC"
          hint="Cut-off · OPS · EXP"
          icon={Cloud}
        />
      </div>

      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        Hướng dẫn
      </h3>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tips.map((it, i) => (
          <motion.div
            key={it.title}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="flex h-full gap-4 p-5 transition-shadow hover:shadow-md">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                <it.icon className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <div className="min-w-0">
                <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
                  {it.title}
                </h2>
                <p className="mt-1.5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {it.desc}
                </p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

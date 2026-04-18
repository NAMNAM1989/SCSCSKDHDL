"use client";

import { AppHeader } from "@/components/layout/AppHeader";
import { Card } from "@/components/ui/Card";
import { motion } from "framer-motion";
import { Bell, FileSpreadsheet, FileUp } from "lucide-react";

const items = [
  {
    title: "Import / Export",
    desc: "Trên desktop: thanh công cụ ngay dưới header. Trên điện thoại: menu ⋮ trên Home.",
    icon: FileUp,
  },
  {
    title: "Excel xuất in",
    desc: "Export Excel tạo file EXP_SKDHDL_UPDATE_*.xlsx chuẩn in A4.",
    icon: FileSpreadsheet,
  },
  {
    title: "Thông báo",
    desc: "Hoạt động lưu nháp tự động sau mỗi thay đổi (≈300ms).",
    icon: Bell,
  },
];

export default function ActivityPage() {
  return (
    <div className="pb-28 lg:pb-8">
      <AppHeader title="Activity" subtitle="Mẹo & luồng làm việc" />
      <main className="mx-auto max-w-2xl space-y-4 px-4 pt-4 lg:max-w-[min(100%,1600px)] lg:px-8">
        {items.map((it, i) => (
          <motion.div
            key={it.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.25 }}
          >
            <Card className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-100 text-brand-700 dark:bg-brand-950/80 dark:text-brand-300">
                <it.icon className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-[17px] font-semibold text-slate-900 dark:text-white">
                  {it.title}
                </h2>
                <p className="mt-1 text-[15px] leading-relaxed text-slate-600 dark:text-slate-400">
                  {it.desc}
                </p>
              </div>
            </Card>
          </motion.div>
        ))}
      </main>
    </div>
  );
}

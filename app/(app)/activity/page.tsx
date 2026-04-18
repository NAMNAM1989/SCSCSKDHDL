"use client";

import { AppHeader } from "@/components/layout/AppHeader";
import { Card } from "@/components/ui/Card";
import { Bell, FileSpreadsheet, FileUp } from "lucide-react";

const items = [
  {
    title: "Import / Export",
    desc: "Trên desktop: thanh công cụ dưới header (Excel, in PDF) và sidebar trái. Trên điện thoại: menu ⋮ trên Home.",
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
    <div className="flex flex-1 flex-col pb-28 lg:pb-8">
      <AppHeader title="Activity" subtitle="Mẹo & luồng làm việc" />
      <main className="mx-auto w-full max-w-md space-y-3 px-4 pt-4 lg:max-w-6xl lg:space-y-0 lg:px-6 lg:pt-4">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 lg:gap-4">
          {items.map((it) => (
            <Card key={it.title} className="flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded border border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                <it.icon className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-[15px] font-semibold text-slate-900 dark:text-slate-100">
                  {it.title}
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {it.desc}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}

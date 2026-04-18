import { BottomNav } from "@/components/layout/BottomNav";
import { ScheduleProvider } from "@/components/providers/ScheduleProvider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ScheduleProvider>
      <div className="min-h-dvh bg-slate-50 dark:bg-slate-950">{children}</div>
      <BottomNav />
    </ScheduleProvider>
  );
}

import { BottomNav } from "@/components/layout/BottomNav";
import { DesktopSidebar } from "@/components/layout/DesktopSidebar";
import { ScheduleProvider } from "@/components/providers/ScheduleProvider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ScheduleProvider>
      <DesktopSidebar />
      <div className="min-h-dvh bg-slate-50 dark:bg-slate-950 lg:pl-60">{children}</div>
      <BottomNav />
    </ScheduleProvider>
  );
}

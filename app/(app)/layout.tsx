import { BottomNav } from "@/components/layout/BottomNav";
import { DesktopSidebar } from "@/components/layout/DesktopSidebar";
import { ScheduleProvider } from "@/components/providers/ScheduleProvider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ScheduleProvider>
      <div className="flex min-h-dvh w-full max-w-full flex-col overflow-x-hidden bg-slate-100 dark:bg-slate-950">
        <DesktopSidebar />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col lg:pl-56">
          {children}
        </div>
      </div>
      <BottomNav />
    </ScheduleProvider>
  );
}

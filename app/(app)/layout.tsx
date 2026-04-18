import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ScheduleProvider } from "@/components/providers/ScheduleProvider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ScheduleProvider>
      <DashboardShell>{children}</DashboardShell>
    </ScheduleProvider>
  );
}

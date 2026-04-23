import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { ScheduleProvider } from "@/components/providers/ScheduleProvider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ScheduleProvider>
        <DashboardShell>{children}</DashboardShell>
      </ScheduleProvider>
    </AuthProvider>
  );
}

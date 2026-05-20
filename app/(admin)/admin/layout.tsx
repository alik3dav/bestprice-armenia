import type { ReactNode } from "react";
import { requireAdmin } from "@/lib/auth/guards";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminTopbar } from "@/components/admin/topbar";
import { DashboardLayoutShell } from "@/components/admin/dashboard-layout-shell";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireAdmin();

  return <DashboardLayoutShell sidebar={<AdminSidebar />} topbar={<AdminTopbar />}>{children}</DashboardLayoutShell>;
}

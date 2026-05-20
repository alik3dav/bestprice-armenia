import type { ReactNode } from "react";
import { requireMerchant } from "@/lib/auth/guards";
import { DashboardLayoutShell } from "@/components/admin/dashboard-layout-shell";
import { DashboardSidebar } from "@/components/admin/sidebar";
import { DashboardTopbar } from "@/components/admin/topbar";

const merchantItems = [["Dashboard", "/merchant/dashboard"],["Offers", "/merchant/offers"]] as const;

export default async function MerchantLayout({ children }: { children: ReactNode }) {
  await requireMerchant();

  return (
    <DashboardLayoutShell
      sidebar={<DashboardSidebar title="BestPrice CRM" items={merchantItems} />}
      topbar={<DashboardTopbar heading="Merchant Dashboard" subheading="Dense workflow mode" />}
    >
      {children}
    </DashboardLayoutShell>
  );
}

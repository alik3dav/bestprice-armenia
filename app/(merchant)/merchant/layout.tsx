import type { ReactNode } from "react";
import { CircleDollarSign, LayoutDashboard } from "lucide-react";
import { requireMerchant } from "@/lib/auth/guards";
import { DashboardLayoutShell } from "@/components/admin/dashboard-layout-shell";
import { DashboardSidebar, type SidebarItem } from "@/components/admin/sidebar";
import { DashboardTopbar } from "@/components/admin/topbar";

const merchantItems: ReadonlyArray<SidebarItem> = [
  { label: "Dashboard", href: "/merchant/dashboard", icon: LayoutDashboard },
  { label: "Offers", href: "/merchant/offers", icon: CircleDollarSign }
];

export default async function MerchantLayout({ children }: { children: ReactNode }) {
  await requireMerchant();

  return (
    <DashboardLayoutShell
      sidebar={<DashboardSidebar title="BestPrice CRM" items={merchantItems} />}
      topbar={<DashboardTopbar heading="Merchant Dashboard" subheading="Offer pricing and availability workflow" actionLabel="New offer" actionHref="/merchant/offers/new" />}
    >
      {children}
    </DashboardLayoutShell>
  );
}

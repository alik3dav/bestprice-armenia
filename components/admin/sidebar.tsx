"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import {
  BadgePercent,
  Boxes,
  Building2,
  CircleDollarSign,
  LayoutDashboard,
  ListTree,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  UsersRound
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type SidebarItem = {
  label: string;
  href: Route;
  icon: LucideIcon;
};

type DashboardSidebarProps = {
  title: string;
  items: ReadonlyArray<SidebarItem>;
};

function isActivePath(pathname: string, href: string) {
  if (href === "/admin") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DashboardSidebar({ title, items }: DashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden h-screen w-[264px] shrink-0 border-r border-slate-200/80 bg-white/95 px-3 py-4 shadow-[1px_0_0_rgba(15,23,42,0.02)] lg:flex lg:flex-col">
      <div className="mb-6 flex items-center gap-3 px-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-teal-200 bg-teal-50 text-teal-700">
          <BadgePercent className="h-4 w-4" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-semibold leading-5 text-slate-950">{title}</p>
          <p className="text-xs text-slate-500">Commerce operations</p>
        </div>
      </div>

      <nav aria-label="Admin navigation" className="flex-1 space-y-6">
        <div>
          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Workspace</p>
          <div className="space-y-1">
            {items.map(({ label, href, icon: Icon }) => {
              const active = isActivePath(pathname, href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`group flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                    active
                      ? "bg-slate-950 text-white shadow-sm shadow-slate-950/10"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon className={`h-4 w-4 ${active ? "text-teal-200" : "text-slate-400 group-hover:text-slate-700"}`} aria-hidden="true" />
                  <span>{label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-700 ring-1 ring-slate-200">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-slate-900">Admin console</p>
            <p className="truncate text-[11px] text-slate-500">Secure workflow mode</p>
          </div>
          <Settings className="h-4 w-4 text-slate-400" aria-hidden="true" />
        </div>
      </div>
    </aside>
  );
}

const items: ReadonlyArray<SidebarItem> = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Products", href: "/admin/products", icon: Boxes },
  { label: "Categories", href: "/admin/categories", icon: ListTree },
  { label: "Merchants", href: "/admin/merchants", icon: Building2 },
  { label: "Users", href: "/admin/users", icon: UsersRound },
  { label: "Offers", href: "/admin/offers", icon: CircleDollarSign },
  { label: "Spec Templates", href: "/admin/spec-templates", icon: SlidersHorizontal }
];

export function AdminSidebar() {
  return <DashboardSidebar title="BestPrice CRM" items={items} />;
}

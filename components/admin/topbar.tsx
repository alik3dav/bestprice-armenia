import Link from "next/link";
import type { Route } from "next";
import { Bell, CalendarDays, Command, Plus, Search, SlidersHorizontal } from "lucide-react";

type DashboardTopbarProps = {
  heading: string;
  subheading: string;
  actionLabel?: string;
  actionHref?: Route;
};

export function DashboardTopbar({ heading, subheading, actionLabel, actionHref }: DashboardTopbarProps) {
  return (
    <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between gap-4 border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-xl lg:px-6">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-slate-950">{heading}</p>
        <p className="truncate text-xs text-slate-500">{subheading}</p>
      </div>

      <div className="flex flex-1 items-center justify-end gap-2">
        <label className="relative hidden w-full max-w-md items-center md:flex">
          <Search className="pointer-events-none absolute left-3 h-4 w-4 text-slate-400" aria-hidden="true" />
          <input
            className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-9 pr-16 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-300 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
            placeholder="Search products, merchants, offers..."
            type="search"
            aria-label="Search admin records"
          />
          <span className="pointer-events-none absolute right-2 hidden items-center gap-1 rounded-lg border border-slate-200 bg-white px-1.5 py-1 text-[11px] font-medium text-slate-400 xl:flex">
            <Command className="h-3 w-3" aria-hidden="true" />K
          </span>
        </label>

        <button className="hidden h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 lg:flex">
          <CalendarDays className="h-4 w-4 text-slate-400" aria-hidden="true" />
          Last 30 days
        </button>
        <button aria-label="Open filters" className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-900">
          <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
        </button>
        <button aria-label="Notifications" className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-900">
          <Bell className="h-4 w-4" aria-hidden="true" />
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-teal-500 ring-2 ring-white" />
        </button>
        {actionHref ? (
          <Link href={actionHref} className="hidden h-10 items-center gap-2 rounded-xl bg-slate-950 px-3.5 text-sm font-semibold text-white shadow-sm shadow-slate-950/10 transition hover:bg-slate-800 sm:flex">
            <Plus className="h-4 w-4" aria-hidden="true" />
            {actionLabel ?? "New record"}
          </Link>
        ) : null}
      </div>
    </header>
  );
}

export function AdminTopbar() {
  return (
    <DashboardTopbar
      heading="Admin Dashboard"
      subheading="Inventory, merchants, offers, and catalog governance"
      actionLabel="New product"
      actionHref="/admin/products/new"
    />
  );
}

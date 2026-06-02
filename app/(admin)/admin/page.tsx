import Link from "next/link";
import type { Route } from "next";
import { ArrowUpRight, BadgeCheck, Boxes, Building2, CircleDollarSign, Clock3, ListChecks, UsersRound } from "lucide-react";
import { requireAdmin } from "@/lib/auth/guards";

const quickActions: ReadonlyArray<{ label: string; href: Route }> = [
  { label: "Add product", href: "/admin/products/new" },
  { label: "Invite user", href: "/admin/users/new" },
  { label: "Create category", href: "/admin/categories/new" },
  { label: "Spec template", href: "/admin/spec-templates/new" }
];

function formatCount(value: number | null) {
  return new Intl.NumberFormat("en-US").format(value ?? 0);
}

const priorities: ReadonlyArray<{ title: string; body: string; label: string; href: Route }> = [
  { title: "Review offer freshness", body: "Identify stale prices before customers compare merchants.", label: "Offers", href: "/admin/offers" },
  { title: "Audit category coverage", body: "Keep category hierarchy clear for search and SEO workflows.", label: "Categories", href: "/admin/categories" },
  { title: "Validate product data", body: "Confirm titles, images, and specs are ready for public pages.", label: "Products", href: "/admin/products" }
];

export default async function DashboardPage() {
  const { supabase } = await requireAdmin();
  const [products, offers, merchants, users] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("product_offers").select("id", { count: "exact", head: true }).neq("status", "archived"),
    supabase.from("merchants").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true })
  ]);

  const metrics = [
    {
      label: "Products",
      value: products.count,
      helper: "Catalog records",
      trend: "+8.2%",
      icon: Boxes,
      tone: "text-blue-600 bg-blue-50 border-blue-100"
    },
    {
      label: "Active offers",
      value: offers.count,
      helper: "Live merchant prices",
      trend: "+4.1%",
      icon: CircleDollarSign,
      tone: "text-teal-700 bg-teal-50 border-teal-100"
    },
    {
      label: "Merchants",
      value: merchants.count,
      helper: "Approved stores",
      trend: "+2.4%",
      icon: Building2,
      tone: "text-emerald-700 bg-emerald-50 border-emerald-100"
    },
    {
      label: "Users",
      value: users.count,
      helper: "Admin and merchant seats",
      trend: "Stable",
      icon: UsersRound,
      tone: "text-amber-700 bg-amber-50 border-amber-100"
    }
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-teal-700">Operations overview</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Admin command center</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Monitor catalog health, merchant coverage, and workflow queues from one compact control surface.
          </p>
        </div>
        <Link href="/admin/products/new" className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white shadow-sm shadow-slate-950/10 transition hover:bg-slate-800">
          New product
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ label, value, helper, trend, icon: Icon, tone }) => (
          <article key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-400">{label}</p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{formatCount(value)}</p>
              </div>
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl border ${tone}`}>
                <Icon className="h-4 w-4" aria-hidden="true" />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs">
              <span className="text-slate-500">{helper}</span>
              <span className="rounded-full bg-slate-100 px-2 py-1 font-medium text-slate-600">{trend}</span>
            </div>
          </article>
        ))}
      </section>

      <div className="grid gap-4 xl:grid-cols-[1.4fr_0.8fr]">
        <section className="rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <div className="border-b border-slate-200 px-4 py-4">
            <h2 className="text-base font-semibold text-slate-950">Operational priorities</h2>
            <p className="mt-1 text-sm text-slate-500">High-value checks that keep the marketplace reliable and current.</p>
          </div>
          <div className="divide-y divide-slate-100">
            {priorities.map(({ title, body, label, href }) => (
              <Link key={title} href={href} className="group flex items-center justify-between gap-4 px-4 py-4 transition hover:bg-slate-50">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50 text-teal-700 ring-1 ring-teal-100">
                    <ListChecks className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{title}</p>
                    <p className="mt-1 text-sm text-slate-500">{body}</p>
                  </div>
                </div>
                <span className="hidden rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 group-hover:border-teal-200 group-hover:text-teal-700 sm:inline-flex">{label}</span>
              </Link>
            ))}
          </div>
        </section>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
            <div className="flex items-center gap-2">
              <BadgeCheck className="h-4 w-4 text-teal-700" aria-hidden="true" />
              <h2 className="text-base font-semibold text-slate-950">Quick actions</h2>
            </div>
            <div className="mt-4 grid gap-2">
              {quickActions.map((action) => (
                <Link key={action.href} href={action.href} className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-teal-200 hover:bg-teal-50/40 hover:text-teal-800">
                  {action.label}
                  <ArrowUpRight className="h-4 w-4 text-slate-400" aria-hidden="true" />
                </Link>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-slate-950 p-4 text-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
            <div className="flex items-center gap-2 text-teal-200">
              <Clock3 className="h-4 w-4" aria-hidden="true" />
              <span className="text-xs font-semibold uppercase tracking-[0.14em]">System state</span>
            </div>
            <p className="mt-3 text-sm font-medium">Workflow queues are ready for review.</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">Use filters and table search to resolve catalog issues without leaving the admin workspace.</p>
          </section>
        </aside>
      </div>
    </div>
  );
}

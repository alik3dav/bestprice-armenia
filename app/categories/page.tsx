import Link from "next/link";
import { PublicFooter } from "@/components/public/public-footer";
import { PublicHeader } from "@/components/public/public-header";
import { CategoryBreadcrumbs, breadcrumbJsonLd } from "@/components/public/category-breadcrumbs";
import { createClient } from "@/lib/supabase/server";

export default async function CategoriesIndexPage() {
  const supabase = await createClient();
  const auth = await supabase.auth.getUser();
  const userEmail = auth.data.user?.email ?? null;
  const { data: categories } = await supabase
    .from("categories")
    .select("id,name,slug,parent_id")
    .eq("status", "active")
    .is("parent_id", null)
    .order("name", { ascending: true });

  const breadcrumbItems = [
    { label: "Գլխավոր", href: "/" },
    { label: "Կատեգորիաներ" },
  ];

  const breadcrumbLd = breadcrumbJsonLd(
    [
      { label: "Գլխավոր", href: "/" },
      { label: "Կատեգորիաներ", href: "/categories" },
    ],
    process.env.NEXT_PUBLIC_SITE_URL,
  );

  return (
    <main className="min-h-screen bg-[var(--color-page-bg)] text-[var(--color-text-primary)]">
      <PublicHeader userEmail={userEmail} />
      <section className="mx-auto w-full max-w-[1200px] px-3 py-5 sm:px-5 lg:px-6">
        <CategoryBreadcrumbs items={breadcrumbItems} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
        <div className="rounded-lg bg-[var(--color-surface)] p-4 sm:p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold text-[var(--color-brand-red)]">BestPrice Armenia</p>
              <h1 className="mt-1 text-2xl font-semibold leading-tight text-[var(--color-text-primary)]">Կատեգորիաներ</h1>
            </div>
            <p className="text-sm text-[var(--color-text-secondary)]">{categories?.length ?? 0} հիմնական կատեգորիա</p>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {(categories ?? []).map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="group flex min-h-20 items-center justify-between rounded-md border border-[var(--color-border-muted)] bg-[var(--color-surface)] p-3 text-sm font-semibold text-[var(--color-text-primary)] transition hover:border-[var(--color-brand-red)] hover:text-[var(--color-brand-red)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-red)] focus:ring-offset-2"
              >
                <span className="line-clamp-2">{category.name}</span>
                <span aria-hidden="true" className="ml-2 text-[var(--color-text-muted)] transition group-hover:text-[var(--color-brand-red)]">›</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <PublicFooter />
    </main>
  );
}

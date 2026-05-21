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

  return <main className="min-h-screen bg-white text-slate-900"><PublicHeader userEmail={userEmail} />
    <section className="mx-auto w-full max-w-7xl p-6">
      <CategoryBreadcrumbs items={breadcrumbItems} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <h1 className="text-2xl font-semibold">Կատեգորիաներ</h1>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {(categories ?? []).map((category) => <Link key={category.id} href={`/categories/${category.slug}`} className="rounded-xl bg-[#f6f6f6] p-3 text-sm font-medium">{category.name}</Link>)}
      </div>
    </section>
    <PublicFooter />
  </main>;
}

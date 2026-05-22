import type { Metadata } from "next";
import { Suspense } from "react";
import { PublicHeader } from "@/components/public/public-header";
import { PublicFooter } from "@/components/public/public-footer";
import { LatestProductsSection, LatestProductsSkeleton } from "@/components/public/latest-products-section";
import { CategoryCard } from "@/components/public/category-card";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "BestPrice Armenia | Ապրանքների և առաջարկների համեմատում",
  description: "Համեմատեք ապրանքներն ու վաճառողների առաջարկները մեկ վայրում։",
};

function hasSupabaseEnv() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export default async function HomePage() {
  let user: { email?: string | null } | null = null;
  let categories: { id: string; name: string; slug: string; image_url: string | null }[] = [];

  if (hasSupabaseEnv()) {
    try {
      const supabase = await createClient();
      const authResult = await supabase.auth.getUser();
      user = authResult.data.user;

      const { data: categoriesData } = await supabase
        .from("categories")
        .select("id,name,slug,image_url,parent_id")
        .eq("status", "active")
        .order("name");

      categories = (categoriesData ?? []).filter((c:any) => Boolean(c.parent_id));
    } catch (error) {
      console.error("Failed to load homepage categories from Supabase", error);
    }
  }

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <PublicHeader userEmail={user?.email ?? null} />

      <section className="w-full px-4 py-8 sm:px-6 lg:px-10">
        <h1 className="text-2xl font-semibold tracking-tight">Հանրաճանաչ կատեգորիաներ</h1>
        {categories.length > 0 ? (
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                name={category.name}
                href={`/categories/${category.slug}`}
                imageUrl={category.image_url}
              />
            ))}
          </div>
        ) : (
          <p className="mt-4 rounded-xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">Ակտիվ կատեգորիաներ դեռ չկան։</p>
        )}
      </section>

      <Suspense fallback={<LatestProductsSkeleton />}>
        <LatestProductsSection />
      </Suspense>

      <PublicFooter />
    </main>
  );
}

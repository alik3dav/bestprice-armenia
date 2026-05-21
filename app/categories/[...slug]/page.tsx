import { notFound } from "next/navigation";
import Link from "next/link";
import { PublicHeader } from "@/components/public/public-header";
import { PublicFooter } from "@/components/public/public-footer";
import { createClient } from "@/lib/supabase/server";

export default async function CategoryHierarchyPage({ params, searchParams }: any) { /* simplified */
  const supabase = await createClient();
  const auth = await supabase.auth.getUser();
  const userEmail = auth.data.user?.email ?? null;
  const segments: string[] = (await params).slug;
  const { data: allCats } = await supabase.from("categories").select("id,name,slug,parent_id,status").eq("status", "active");
  const cats = allCats ?? [];
  let current = cats.find((c) => !c.parent_id && c.slug === segments[0]);
  if (!current) notFound();
  for (const seg of segments.slice(1)) { current = cats.find((c) => c.parent_id === current!.id && c.slug === seg); if (!current) notFound(); }
  const children = cats.filter((c) => c.parent_id === current!.id);
  if (children.length) return <main className="min-h-screen bg-white text-slate-900"><PublicHeader userEmail={userEmail} /><section className="mx-auto w-full max-w-7xl p-6"><h1 className="text-2xl font-semibold">{current!.name}</h1><div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">{children.map((child) => <Link key={child.id} href={`/categories/${[...segments, child.slug].join("/")}`} className="rounded-xl bg-[#f6f6f6] p-3 text-sm font-medium">{child.name}</Link>)}</div></section>      <PublicFooter />
    </main>;
  const { data: products } = await supabase.from("products").select("id,title,slug,short_description,description,images").eq("category_id", current!.id).eq("status", "active");
  return <main className="min-h-screen bg-white text-slate-900"><PublicHeader userEmail={userEmail} /><section className="mx-auto w-full max-w-7xl p-6"><h1 className="text-2xl font-semibold">{current!.name}</h1><div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{(products ?? []).map((p) => <Link key={p.id} href={`/products/${p.slug}`} className="block rounded-xl border p-3"><h3 className="font-semibold">{p.title}</h3><p className="text-sm text-slate-500">{p.short_description || p.description}</p></Link>)}</div></section>      <PublicFooter />
    </main>;
}

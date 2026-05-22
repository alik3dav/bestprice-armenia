import { notFound } from "next/navigation";
import Link from "next/link";
import { ProductGridCard } from "@/components/public/product-grid-card";
import { PublicHeader } from "@/components/public/public-header";
import { PublicFooter } from "@/components/public/public-footer";
import { createClient } from "@/lib/supabase/server";
import { CategoryBreadcrumbs, breadcrumbJsonLd, type BreadcrumbItem } from "@/components/public/category-breadcrumbs";

export default async function CategoryHierarchyPage({ params }: any) {
  const supabase = await createClient();
  const auth = await supabase.auth.getUser();
  const userEmail = auth.data.user?.email ?? null;
  const segments: string[] = (await params).slug;
  const { data: allCats } = await supabase.from("categories").select("id,name,slug,parent_id,status").eq("status", "active");
  const cats = allCats ?? [];

  let current = cats.find((c) => !c.parent_id && c.slug === segments[0]);
  if (!current) notFound();
  const chain = [current];
  for (const seg of segments.slice(1)) {
    current = cats.find((c) => c.parent_id === current!.id && c.slug === seg);
    if (!current) notFound();
    chain.push(current);
  }

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Գլխավոր", href: "/" },
    { label: "Կատեգորիաներ", href: "/categories" },
    ...chain.map((c, i) => ({ label: c.name, href: `/categories/${chain.slice(0, i + 1).map((x) => x.slug).join("/")}` })),
  ];
  breadcrumbItems[breadcrumbItems.length - 1] = { label: breadcrumbItems[breadcrumbItems.length - 1].label };
  const breadcrumbLd = breadcrumbJsonLd(
    [
      ...breadcrumbItems.filter((i): i is { label: string; href: string } => Boolean(i.href)),
      { label: chain[chain.length - 1].name, href: `/categories/${chain.map((c) => c.slug).join("/")}` },
    ],
    process.env.NEXT_PUBLIC_SITE_URL,
  );

  const children = cats.filter((c) => c.parent_id === current!.id);
  if (children.length) return <main className="min-h-screen bg-white text-slate-900"><PublicHeader userEmail={userEmail} /><section className="mx-auto w-full max-w-7xl p-6"><CategoryBreadcrumbs items={breadcrumbItems} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} /><h1 className="text-2xl font-semibold">{current!.name}</h1><div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">{children.map((child) => <Link key={child.id} href={`/categories/${[...segments, child.slug].join("/")}`} className="rounded-xl bg-[#f6f6f6] p-3 text-sm font-medium">{child.name}</Link>)}</div></section>      <PublicFooter />
    </main>;

  const { data: products } = await supabase.from("products").select("id,title,slug,images").eq("category_id", current!.id).eq("status", "active");
  const productIds = (products ?? []).map((p) => p.id);
  const { data: offersData } = productIds.length ? await supabase.from("product_offers").select("product_id,price,status").eq("status", "active").in("product_id", productIds) : { data: [] };
  const offersByProduct = new Map<string, { product_id: string; price: number }[]>();
  for (const offer of offersData ?? []) offersByProduct.set(offer.product_id, [...(offersByProduct.get(offer.product_id) ?? []), offer]);

  return <main className="min-h-screen bg-white text-slate-900"><PublicHeader userEmail={userEmail} /><section className="mx-auto w-full max-w-7xl p-6"><CategoryBreadcrumbs items={breadcrumbItems} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} /><h1 className="text-2xl font-semibold">{current!.name}</h1><div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{(products ?? []).map((p) => { const offers = offersByProduct.get(p.id) ?? []; const lowest = offers.reduce((min, offer) => (min === null || offer.price < min ? offer.price : min), null as number | null); return <ProductGridCard key={p.id} product={p} lowestPriceAMD={lowest} activeOfferCount={offers.length} />; })}</div></section>      <PublicFooter />
    </main>;
}

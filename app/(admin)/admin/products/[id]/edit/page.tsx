import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/guards";
import { ProductForm } from "@/components/admin/product-form";

const productSchema = z.object({
  title: z.string().trim().min(2),
  slug: z.string().trim().min(2).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  categoryId: z.string().uuid(),
  brandId: z.string().uuid().optional().or(z.literal("")),
  model: z.string().trim().max(120).optional(),
  description: z.string().trim().max(5000).optional(),
  status: z.enum(["draft", "active", "archived"]),
  images: z.string().trim().optional()
});
const parseImages = (value?: string) => (value ? value.split(/\r?\n|,/).map((v) => v.trim()).filter(Boolean) : []);

export default async function ProductEditPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams?: Promise<{ error?: string }> }) {
  const { id } = await params;
  const query = await searchParams;
  const { supabase } = await requireAdmin();
  const [productResult, categoriesResult, brandsResult] = await Promise.all([
    supabase.from("products").select("id,title,slug,category_id,brand_id,model,description,status,images").eq("id", id).single(),
    supabase.from("categories").select("id,name,status").order("name", { ascending: true }),
    supabase.from("brands").select("id,name").order("name", { ascending: true })
  ]);
  if (!productResult.data) notFound();

  async function updateProduct(formData: FormData) {
    "use server";
    const { supabase: c } = await requireAdmin();
    const parsed = productSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) redirect(`/admin/products/${id}/edit?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Invalid form")}`);
    const d = parsed.data;
    const { error } = await c.from("products").update({ title: d.title, slug: d.slug, category_id: d.categoryId, brand_id: d.brandId || null, model: d.model || null, description: d.description || null, status: d.status, images: parseImages(d.images) }).eq("id", id);
    if (error) redirect(`/admin/products/${id}/edit?error=${encodeURIComponent(error.message)}`);
    redirect("/admin/products");
  }

  const p = productResult.data;
  return <section className="space-y-4 rounded border bg-white p-4"><div className="flex items-center justify-between gap-3"><div><h1 className="text-xl font-semibold">Edit Product</h1><p className="text-sm text-slate-500">Update product details in the catalog.</p></div><Link href="/admin/products" className="rounded border px-3 py-2 text-sm hover:bg-slate-50">Back to products</Link></div>{(query?.error || categoriesResult.error || brandsResult.error) ? <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{query?.error ?? categoriesResult.error?.message ?? brandsResult.error?.message}</div> : null}<ProductForm action={updateProduct} categories={categoriesResult.data ?? []} brands={brandsResult.data ?? []} backHref="/admin/products" submitLabel="Save product" submitLoadingLabel="Saving..." defaultValues={{ title: p.title, slug: p.slug, categoryId: p.category_id, brandId: p.brand_id ?? "", model: p.model ?? "", description: p.description ?? "", status: p.status, images: Array.isArray(p.images) ? p.images.join("\n") : "" }} /></section>;
}

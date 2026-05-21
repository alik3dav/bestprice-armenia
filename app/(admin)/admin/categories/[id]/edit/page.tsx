import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/guards";
import { CategoryForm } from "@/components/admin/category-form";

const categorySchema = z.object({ name: z.string().trim().min(2), slug: z.string().trim().min(2).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/), status: z.enum(["draft", "active", "archived"]), imageUrl: z.string().trim().optional(), parentId: z.string().uuid().optional().or(z.literal("")) });

export default async function CategoryEditPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams?: Promise<{ error?: string }> }) {
  const { id } = await params;
  const query = await searchParams;
  const { supabase } = await requireAdmin();
  const { data: category } = await supabase.from("categories").select("id,name,slug,status,image_url,parent_id").eq("id", id).single();
  if (!category) notFound();
  const { data: allCategories } = await supabase.from("categories").select("id,name,parent_id").order("name");
  const categoryOptions = (allCategories ?? []).map((c:any)=>({id:c.id,name:c.name,depth:c.parent_id?1:0}));
  async function updateCategory(formData: FormData) {
    "use server";
    const { supabase: c } = await requireAdmin();
    const parsed = categorySchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) redirect(`/admin/categories/${id}/edit?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Invalid form")}`);
    const { error } = await c.from("categories").update({ name: parsed.data.name, slug: parsed.data.slug, status: parsed.data.status, image_url: parsed.data.imageUrl || null, parent_id: parsed.data.parentId || null }).eq("id", id);
    if (error) redirect(`/admin/categories/${id}/edit?error=${encodeURIComponent(error.message)}`);
    redirect("/admin/categories");
  }
  return <section className="space-y-4 rounded border bg-white p-4"><div className="flex items-center justify-between gap-3"><div><h1 className="text-xl font-semibold">Edit Category</h1><p className="text-sm text-slate-500">Update category details used to organize products.</p></div><Link href="/admin/categories" className="rounded border px-3 py-2 text-sm hover:bg-slate-50">Back to categories</Link></div>{query?.error ? <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{query.error}</div>:null}<CategoryForm action={updateCategory} backHref="/admin/categories" submitLabel="Save category" submitLoadingLabel="Saving..." defaultValues={{ name: category.name, slug: category.slug, status: category.status, imageUrl: category.image_url ?? "", parentId: category.parent_id ?? "" }} categoryOptions={categoryOptions} currentCategoryId={id} /></section>;
}

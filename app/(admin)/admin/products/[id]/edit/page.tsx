import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guards";

export default async function ProductEditPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams?: Promise<{ error?: string }> }) {
  const { id } = await params;
  const query = await searchParams;
  const { supabase } = await requireAdmin();
  const { data: product } = await supabase.from("products").select("id,title,status").eq("id", id).single();
  if (!product) notFound();

  async function updateProduct(formData: FormData) {
    "use server";
    const { supabase: c } = await requireAdmin();
    const { error } = await c.from("products").update({ title: String(formData.get("title") ?? ""), status: String(formData.get("status") ?? "draft") }).eq("id", id);
    if (error) redirect(`/admin/products/${id}/edit?error=${encodeURIComponent(error.message)}`);
    redirect("/admin/products");
  }
  return <section className="space-y-4 rounded border bg-white p-4"><h1 className="text-xl font-semibold">Edit Product</h1>{query?.error ? <p className="text-sm text-red-600">{query.error}</p>:null}<form action={updateProduct} className="space-y-3 max-w-xl"><input name="title" defaultValue={product.title} className="w-full rounded border px-3 py-2" required/><select name="status" defaultValue={product.status} className="w-full rounded border px-3 py-2"><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select><div className="flex gap-2"><Link className="rounded border px-3 py-2 text-sm" href="/admin/products">Cancel</Link><button className="rounded bg-slate-900 px-3 py-2 text-sm text-white">Save</button></div></form></section>;
}

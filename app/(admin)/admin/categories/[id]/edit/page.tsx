import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guards";

export default async function CategoryEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const { data: category } = await supabase.from("categories").select("id,name,status").eq("id", id).single();
  if (!category) notFound();
  async function updateCategory(formData: FormData) {
    "use server";
    const { supabase: c } = await requireAdmin();
    await c.from("categories").update({ name: String(formData.get("name") ?? ""), status: String(formData.get("status") ?? "active") }).eq("id", id);
    redirect("/admin/categories");
  }
  return <section className="space-y-4 rounded border bg-white p-4"><h1 className="text-xl font-semibold">Edit Category</h1><form action={updateCategory} className="space-y-3 max-w-xl"><input name="name" defaultValue={category.name} className="w-full rounded border px-3 py-2" required/><select name="status" defaultValue={category.status} className="w-full rounded border px-3 py-2"><option value="active">Active</option><option value="inactive">Inactive</option></select><div className="flex gap-2"><Link className="rounded border px-3 py-2 text-sm" href="/admin/categories">Cancel</Link><button className="rounded bg-slate-900 px-3 py-2 text-sm text-white">Save</button></div></form></section>;
}

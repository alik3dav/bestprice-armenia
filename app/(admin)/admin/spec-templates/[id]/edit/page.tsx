import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guards";

export default async function SpecTemplateEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const { data: group } = await supabase.from("specification_groups").select("id,name").eq("id", id).single();
  if (!group) notFound();
  async function updateGroup(formData: FormData) {
    "use server";
    const { supabase: c } = await requireAdmin();
    await c.from("specification_groups").update({ name: String(formData.get("name") ?? "") }).eq("id", id);
    redirect("/admin/spec-templates");
  }
  return <section className="space-y-4 rounded border bg-white p-4"><h1 className="text-xl font-semibold">Edit Spec Template</h1><form action={updateGroup} className="space-y-3 max-w-xl"><input name="name" defaultValue={group.name} className="w-full rounded border px-3 py-2" required/><div className="flex gap-2"><Link className="rounded border px-3 py-2 text-sm" href="/admin/spec-templates">Cancel</Link><button className="rounded bg-slate-900 px-3 py-2 text-sm text-white">Save</button></div></form></section>;
}

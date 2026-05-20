import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/guards";
import { SpecTemplateForm, type SpecTemplateFieldDraft } from "@/components/admin/spec-template-form";

const fieldTypeSchema = z.enum(["text", "number", "boolean", "select", "multi-select"]);
const schema = z.object({ name: z.string().trim().min(2), categoryId: z.string().uuid(), fields: z.array(z.object({ name: z.string().trim().min(1), key: z.string().trim().min(1).regex(/^[a-z0-9_]+$/), fieldType: fieldTypeSchema, required: z.boolean(), sortOrder: z.number().int(), options: z.array(z.string().trim().min(1)).default([]) })).min(1) });

export default async function SpecTemplateEditPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams?: Promise<{ error?: string }> }) {
  const { id } = await params;
  const query = await searchParams;
  const { supabase } = await requireAdmin();
  const [groupResult, fieldsResult, categoriesResult] = await Promise.all([
    supabase.from("specification_groups").select("id,name,category_id").eq("id", id).single(),
    supabase.from("specification_fields").select("id,name,key,field_type,required,sort_order,options").eq("group_id", id).order("sort_order", { ascending: true }),
    supabase.from("categories").select("id,name,status").order("name", { ascending: true })
  ]);
  if (!groupResult.data) notFound();

  async function updateGroup(formData: FormData) {
    "use server";
    const { supabase: c } = await requireAdmin();
    let fieldsParsed: unknown = [];
    try { fieldsParsed = JSON.parse(String(formData.get("fields") ?? "[]")); } catch { redirect(`/admin/spec-templates/${id}/edit?error=${encodeURIComponent("Specification fields payload is invalid JSON.")}`); }
    const parsed = schema.safeParse({ name: formData.get("name"), categoryId: formData.get("categoryId"), fields: fieldsParsed });
    if (!parsed.success) redirect(`/admin/spec-templates/${id}/edit?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Invalid form")}`);
    const d = parsed.data;
    const { error: groupError } = await c.from("specification_groups").update({ name: d.name, category_id: d.categoryId }).eq("id", id);
    if (groupError) redirect(`/admin/spec-templates/${id}/edit?error=${encodeURIComponent(groupError.message)}`);
    await c.from("specification_fields").delete().eq("group_id", id);
    const { error: fieldsError } = await c.from("specification_fields").insert(d.fields.map((f) => ({ group_id: id, name: f.name, key: f.key, field_type: f.fieldType, required: f.required, sort_order: f.sortOrder, options: f.fieldType === "select" || f.fieldType === "multi-select" ? f.options : null })));
    if (fieldsError) redirect(`/admin/spec-templates/${id}/edit?error=${encodeURIComponent(fieldsError.message)}`);
    redirect("/admin/spec-templates");
  }

  const defaultFields: SpecTemplateFieldDraft[] = (fieldsResult.data ?? []).map((f) => ({ id: f.id, name: f.name, key: f.key, fieldType: f.field_type as SpecTemplateFieldDraft["fieldType"], required: f.required, sortOrder: f.sort_order, optionsText: Array.isArray(f.options) ? f.options.join("\n") : "" }));
  return <section className="space-y-4 rounded border bg-white p-4"><div className="flex items-center justify-between gap-3"><div><h1 className="text-xl font-semibold">Edit Spec Template</h1><p className="text-sm text-slate-500">Update category-linked template and specification fields.</p></div><Link href="/admin/spec-templates" className="rounded border px-3 py-2 text-sm hover:bg-slate-50">Back to spec templates</Link></div>{(query?.error || categoriesResult.error || fieldsResult.error) ? <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{query?.error ?? categoriesResult.error?.message ?? fieldsResult.error?.message}</div> : null}<SpecTemplateForm categories={categoriesResult.data ?? []} action={updateGroup} backHref="/admin/spec-templates" submitLabel="Save spec template" submitLoadingLabel="Saving..." defaultValues={{ name: groupResult.data.name, categoryId: groupResult.data.category_id, fields: defaultFields }} /></section>;
}

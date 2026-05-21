import Link from "next/link";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/guards";
import { SpecTemplateForm } from "@/components/admin/spec-template-form";

const fieldTypeSchema = z.enum(["text", "number", "boolean", "select", "multi-select"]);
const payloadSchema = z.object({
  groups: z.array(z.object({ id: z.string(), name: z.string().trim().min(1), sortOrder: z.number().int() })).min(1),
  fields: z.array(z.object({ groupId: z.string(), name: z.string().trim().min(1), key: z.string().trim().min(1).regex(/^[a-z0-9_]+$/), fieldType: fieldTypeSchema, required: z.boolean(), sortOrder: z.number().int(), options: z.array(z.string().trim().min(1)).default([]) })).min(1)
});

export default async function NewSpecTemplatePage({ searchParams }: { searchParams?: Promise<{ error?: string }> }) {
  const { supabase } = await requireAdmin();
  const params = await searchParams;
  const categoriesResult = await supabase.from("categories").select("id,name,status,parent_id").order("name", { ascending: true });
  const allCategories = categoriesResult.data ?? [];
  const parentIds = new Set(allCategories.map((c:any)=>c.parent_id).filter(Boolean));
  const categories = allCategories.filter((c:any)=>!parentIds.has(c.id));

  async function createSpecTemplate(formData: FormData) {
    "use server";
    const { supabase: c } = await requireAdmin();
    let payload: unknown = { groups: [], fields: [] };
    try { payload = JSON.parse(String(formData.get("specPayload") ?? "{}")); } catch { redirect(`/admin/spec-templates/new?error=${encodeURIComponent("Specification payload is invalid JSON.")}`); }
    const parsed = payloadSchema.safeParse(payload);
    if (!parsed.success) redirect(`/admin/spec-templates/new?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Please review the form and try again.")}`);

    const keys = new Set<string>();
    for (const field of parsed.data.fields) {
      if (keys.has(field.key)) redirect(`/admin/spec-templates/new?error=${encodeURIComponent(`Duplicate key found: ${field.key}.`)}`);
      keys.add(field.key);
    }

    const { data: template, error: templateError } = await c.from("specification_groups").insert({ name: formData.get("name"), category_id: formData.get("categoryId"), sort_order: 0 }).select("id").single();
    if (templateError || !template) redirect(`/admin/spec-templates/new?error=${encodeURIComponent(templateError?.message ?? "Failed to create specification template.")}`);

    const { data: groupRows, error: groupsError } = await c.from("specification_template_groups").insert(parsed.data.groups.map((g, i) => ({ template_id: template.id, name: g.name, sort_order: i }))).select("id,name");
    if (groupsError || !groupRows) redirect(`/admin/spec-templates/new?error=${encodeURIComponent(groupsError?.message ?? "Failed to create template groups")}`);
    const map = new Map(groupRows.map((g) => [g.name, g.id]));

    const { error: fieldsError } = await c.from("specification_fields").insert(parsed.data.fields.map((f) => ({ template_group_id: map.get(parsed.data.groups.find((g) => g.id === f.groupId)?.name ?? ""), name: f.name, key: f.key, field_type: f.fieldType, required: f.required, sort_order: f.sortOrder, options: f.fieldType === "select" || f.fieldType === "multi-select" ? f.options : null })));
    if (fieldsError) redirect(`/admin/spec-templates/new?error=${encodeURIComponent(fieldsError.message)}`);
    redirect("/admin/spec-templates");
  }

  return <section className="space-y-4 rounded border bg-white p-4"><div className="flex items-center justify-between gap-3"><div><h1 className="text-xl font-semibold">Create Spec Template</h1><p className="text-sm text-slate-500">Create a category-linked template and define dynamic specification fields.</p></div><Link href="/admin/spec-templates" className="rounded border px-3 py-2 text-sm hover:bg-slate-50">Back to spec templates</Link></div>{categoriesResult.error ? <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{categoriesResult.error.message}</div> : null}{params?.error ? <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{params.error}</div> : null}{!categoriesResult.error && categories.length === 0 ? <div className="rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">No categories available. Create a category before adding a spec template.</div> : <SpecTemplateForm categories={categories} action={createSpecTemplate} backHref="/admin/spec-templates" submitLabel="Create spec template" submitLoadingLabel="Creating..." defaultValues={{ name: "", categoryId: "", groups: [{ id: "seed", name: "Display", sortOrder: 0 }], fields: [] }} />}</section>;
}

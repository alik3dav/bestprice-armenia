import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/guards";
import { SpecTemplateForm, type SpecTemplateFieldDraft, type SpecTemplateGroupDraft } from "@/components/admin/spec-template-form";

const fieldTypeSchema = z.enum(["text", "number", "boolean", "select", "multi-select"]);
const payloadSchema = z.object({ groups: z.array(z.object({ id: z.string(), name: z.string().trim().min(1), sortOrder: z.number().int() })).min(1), fields: z.array(z.object({ id: z.string(), persistedId: z.string().uuid().nullable().optional(), groupId: z.string(), name: z.string().trim().min(1), key: z.string().trim().min(1).regex(/^[a-z0-9_]+$/), fieldType: fieldTypeSchema, required: z.boolean(), sortOrder: z.number().int(), options: z.array(z.string().trim().min(1)).default([]) })).min(1) });

export default async function SpecTemplateEditPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams?: Promise<{ error?: string }> }) {
  const { id } = await params;
  const query = await searchParams;
  const { supabase } = await requireAdmin();
  const [templateResult, groupsResult, fieldsResult, categoriesResult] = await Promise.all([
    supabase.from("specification_groups").select("id,name,category_id").eq("id", id).single(),
    supabase.from("specification_template_groups").select("id,name,sort_order").eq("template_id", id).order("sort_order", { ascending: true }),
    supabase.from("specification_fields").select("id,name,key,field_type,required,sort_order,options,template_group_id").order("sort_order", { ascending: true }),
    supabase.from("categories").select("id,name,status").order("name", { ascending: true })
  ]);
  if (!templateResult.data) notFound();

  async function updateTemplate(formData: FormData) {
    "use server";
    const { supabase: c } = await requireAdmin();
    let payload: unknown = { groups: [], fields: [] };
    try { payload = JSON.parse(String(formData.get("specPayload") ?? "{}")); } catch { redirect(`/admin/spec-templates/${id}/edit?error=${encodeURIComponent("Specification payload is invalid JSON.")}`); }
    const parsed = payloadSchema.safeParse(payload);
    if (!parsed.success) redirect(`/admin/spec-templates/${id}/edit?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Invalid form")}`);

    const keys = new Set<string>();
    for (const f of parsed.data.fields) { if (keys.has(f.key)) redirect(`/admin/spec-templates/${id}/edit?error=${encodeURIComponent(`Duplicate key found: ${f.key}.`)}`); keys.add(f.key); }

    const { error: tErr } = await c.from("specification_groups").update({ name: formData.get("name"), category_id: formData.get("categoryId") }).eq("id", id);
    if (tErr) redirect(`/admin/spec-templates/${id}/edit?error=${encodeURIComponent(tErr.message)}`);

    const previousGroups = groupsResult.data ?? [];
    const previousGroupIds = previousGroups.map((g) => g.id);
    const nextGroupIds = new Set(parsed.data.groups.map((g) => g.id));
    const removedGroupIds = previousGroupIds.filter((groupId) => !nextGroupIds.has(groupId));

    const groupsToInsert = parsed.data.groups.filter((g) => !previousGroupIds.includes(g.id));
    if (groupsToInsert.length > 0) {
      const { error: insErr } = await c.from("specification_template_groups").insert(groupsToInsert.map((g) => ({ id: g.id, template_id: id, name: g.name, sort_order: g.sortOrder })));
      if (insErr) redirect(`/admin/spec-templates/${id}/edit?error=${encodeURIComponent(insErr.message)}`);
    }

    for (const g of parsed.data.groups) {
      if (previousGroupIds.includes(g.id)) {
        const { error: updErr } = await c.from("specification_template_groups").update({ name: g.name, sort_order: g.sortOrder }).eq("id", g.id).eq("template_id", id);
        if (updErr) redirect(`/admin/spec-templates/${id}/edit?error=${encodeURIComponent(updErr.message)}`);
      }
    }
    if (removedGroupIds.length > 0) await c.from("specification_template_groups").delete().in("id", removedGroupIds).eq("template_id", id);

    const previousFields = (fieldsResult.data ?? []).filter((f) => f.template_group_id && previousGroupIds.includes(f.template_group_id));
    const previousFieldIds = previousFields.map((f) => f.id);
    const persistedFieldIds = parsed.data.fields.map((f) => f.persistedId).filter((value): value is string => Boolean(value));
    const removedFieldIds = previousFieldIds.filter((fieldId) => !persistedFieldIds.includes(fieldId));
    if (removedFieldIds.length > 0) {
      await c.from("product_specification_values").delete().in("field_id", removedFieldIds);
      await c.from("specification_fields").delete().in("id", removedFieldIds);
    }

    const { error: fErr } = await c.from("specification_fields").upsert(parsed.data.fields.map((f) => ({ id: f.persistedId ?? f.id, template_group_id: f.groupId, name: f.name, key: f.key, field_type: f.fieldType, required: f.required, sort_order: f.sortOrder, options: f.fieldType === "select" || f.fieldType === "multi-select" ? f.options : null })), { onConflict: "id" });
    if (fErr) redirect(`/admin/spec-templates/${id}/edit?error=${encodeURIComponent(fErr.message)}`);
    redirect("/admin/spec-templates");
  }

  const groupIds = new Set((groupsResult.data ?? []).map((g) => g.id));
  const defaultGroups: SpecTemplateGroupDraft[] = (groupsResult.data ?? []).map((g) => ({ id: g.id, name: g.name, sortOrder: g.sort_order }));
  const defaultFields: SpecTemplateFieldDraft[] = (fieldsResult.data ?? []).filter((f) => f.template_group_id && groupIds.has(f.template_group_id)).map((f) => ({ id: f.id, persistedId: f.id, groupId: f.template_group_id as string, name: f.name, key: f.key, fieldType: f.field_type as SpecTemplateFieldDraft["fieldType"], required: f.required, sortOrder: f.sort_order, optionsText: Array.isArray(f.options) ? f.options.join("\n") : "" }));

  return <section className="space-y-4 rounded border bg-white p-4"><div className="flex items-center justify-between gap-3"><div><h1 className="text-xl font-semibold">Edit Spec Template</h1><p className="text-sm text-slate-500">Update category-linked template and specification fields.</p></div><Link href="/admin/spec-templates" className="rounded border px-3 py-2 text-sm hover:bg-slate-50">Back to spec templates</Link></div>{(query?.error || categoriesResult.error || fieldsResult.error || groupsResult.error) ? <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{query?.error ?? categoriesResult.error?.message ?? fieldsResult.error?.message ?? groupsResult.error?.message}</div> : null}<SpecTemplateForm categories={categoriesResult.data ?? []} action={updateTemplate} backHref="/admin/spec-templates" submitLabel="Save spec template" submitLoadingLabel="Saving..." defaultValues={{ name: templateResult.data.name, categoryId: templateResult.data.category_id, groups: defaultGroups, fields: defaultFields }} /></section>;
}

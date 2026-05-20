import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/guards";
import { ProductForm } from "@/components/admin/product-form";

const productSchema = z.object({
  title: z.string().trim().min(2),
  slug: z.string().trim().min(2).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  categoryId: z.string().uuid(),
  description: z.string().trim().max(5000).optional(),
  status: z.enum(["draft", "active", "archived"]),
  images: z.string().trim().optional()
});
const parseImages = (value?: string) => (value ? value.split(/\r?\n|,/).map((v) => v.trim()).filter(Boolean) : []);

export default async function ProductEditPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams?: Promise<{ error?: string }> }) {
  const { id } = await params;
  const query = await searchParams;
  const { supabase } = await requireAdmin();
  const [productResult, categoriesResult, templatesResult, templateGroupsResult, fieldsResult, valuesResult] = await Promise.all([
    supabase.from("products").select("id,title,slug,category_id,description,status,images").eq("id", id).single(),
    supabase.from("categories").select("id,name,status").order("name", { ascending: true }),
    supabase.from("specification_groups").select("id,name,category_id"),
    supabase.from("specification_template_groups").select("id,name,template_id,sort_order"),
    supabase.from("specification_fields").select("id,name,key,field_type,required,sort_order,options,template_group_id"),
    supabase.from("product_specification_values").select("field_id,value_text,value_number,value_boolean,value_select").eq("product_id", id)
  ]);
  if (!productResult.data) notFound();

  const templatesByCategory = Object.fromEntries((templatesResult.data ?? []).map((t) => {
    const groups = (templateGroupsResult.data ?? []).filter((g) => g.template_id === t.id).sort((a, b) => a.sort_order - b.sort_order).map((g) => ({
      id: g.id, name: g.name, sortOrder: g.sort_order,
      fields: (fieldsResult.data ?? []).filter((f) => f.template_group_id === g.id).sort((a, b) => a.sort_order - b.sort_order).map((f) => ({ id: f.id, name: f.name, key: f.key, fieldType: f.field_type, required: f.required, sortOrder: f.sort_order, options: Array.isArray(f.options) ? f.options : [] }))
    }));
    return [t.category_id, { templateId: t.id, templateName: t.name, groups }];
  }));

  const fieldById = new Map((fieldsResult.data ?? []).map((f) => [f.id, f]));
  const specValues = Object.fromEntries((valuesResult.data ?? []).flatMap((v) => {
    const field = fieldById.get(v.field_id);
    if (!field) return [];
    if (field.field_type === "multi-select") {
      try { return [[field.id, JSON.parse(v.value_text ?? "[]")]]; } catch { return [[field.key, []]]; }
    }
    return [[field.id, v.value_select ?? v.value_text ?? (v.value_number?.toString()) ?? (v.value_boolean === null ? "" : String(v.value_boolean)) ?? ""]];
  }));

  async function updateProduct(formData: FormData) {
    "use server";
    const { supabase: c } = await requireAdmin();
    const parsed = productSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) redirect(`/admin/products/${id}/edit?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Invalid form")}`);
    const d = parsed.data;
    const { error } = await c.from("products").update({ title: d.title, slug: d.slug, category_id: d.categoryId, description: d.description || null, status: d.status, images: parseImages(d.images) }).eq("id", id);
    if (error) redirect(`/admin/products/${id}/edit?error=${encodeURIComponent(error.message)}`);

    await c.from("product_specification_values").delete().eq("product_id", id);
    const specValuesRaw = String(formData.get("specValues") ?? "{}");
    const parsedValues = JSON.parse(specValuesRaw) as Record<string, string | string[]>;
    const selectedTemplate = templatesByCategory[d.categoryId];
    if (selectedTemplate) {
      const fieldRows = selectedTemplate.groups.flatMap((g: { fields: Array<{ key: string; id: string; fieldType: string }> }) => g.fields);
      const payload = fieldRows.flatMap((f: { key: string; id: string; fieldType: string }) => {
        const v = parsedValues[f.id];
        const empty = Array.isArray(v) ? v.length === 0 : !String(v ?? "").trim();
        if (empty) return [];
        return [{ product_id: id, field_id: f.id, value_text: f.fieldType === "text" || f.fieldType === "multi-select" ? (Array.isArray(v) ? JSON.stringify(v) : String(v)) : null, value_number: f.fieldType === "number" ? Number(v) : null, value_boolean: f.fieldType === "boolean" ? String(v) === "true" : null, value_select: f.fieldType === "select" ? String(v) : null }];
      });
      if (payload.length > 0) await c.from("product_specification_values").insert(payload);
    }

    redirect("/admin/products");
  }

  const p = productResult.data;
  return <section className="space-y-4 rounded border bg-white p-4"><div className="flex items-center justify-between gap-3"><div><h1 className="text-xl font-semibold">Edit Product</h1><p className="text-sm text-slate-500">Update product details in the catalog.</p></div><Link href="/admin/products" className="rounded border px-3 py-2 text-sm hover:bg-slate-50">Back to products</Link></div>{(query?.error || categoriesResult.error || fieldsResult.error || templateGroupsResult.error || templatesResult.error || valuesResult.error) ? <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{query?.error ?? categoriesResult.error?.message ?? fieldsResult.error?.message ?? templateGroupsResult.error?.message ?? templatesResult.error?.message ?? valuesResult.error?.message}</div> : null}<ProductForm action={updateProduct} categories={categoriesResult.data ?? []} templatesByCategory={templatesByCategory} backHref="/admin/products" submitLabel="Save product" submitLoadingLabel="Saving..." defaultValues={{ title: p.title, slug: p.slug, categoryId: p.category_id, description: p.description ?? "", status: p.status, images: Array.isArray(p.images) ? p.images.join("\n") : "", specValues }} /></section>;
}

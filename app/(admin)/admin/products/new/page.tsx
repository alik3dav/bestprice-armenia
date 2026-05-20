import Link from "next/link";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/guards";
import { ProductForm } from "@/components/admin/product-form";

const createProductSchema = z.object({
  title: z.string().trim().min(2, "Title must be at least 2 characters."),
  slug: z.string().trim().min(2, "Slug must be at least 2 characters.").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase and use hyphens only."),
  categoryId: z.string().uuid("Please choose a valid category."),
  description: z.string().trim().max(5000, "Description is too long.").optional(),
  status: z.enum(["draft", "active", "archived"]),
  images: z.string().trim().optional()
});

function parseImages(imagesInput: string | undefined) {
  if (!imagesInput) return [] as string[];

  return imagesInput
    .split(/\r?\n|,/)
    .map((value) => value.trim())
    .filter(Boolean);
}

export default async function NewProductPage({ searchParams }: { searchParams?: Promise<{ error?: string }> }) {
  const { supabase } = await requireAdmin();
  const params = await searchParams;

  const [categoriesResult, templatesResult, templateGroupsResult, fieldsResult] = await Promise.all([
    supabase.from("categories").select("id,name,status").order("name", { ascending: true }),
    supabase.from("specification_groups").select("id,name,category_id"),
    supabase.from("specification_template_groups").select("id,name,template_id,sort_order"),
    supabase.from("specification_fields").select("id,name,key,field_type,required,sort_order,options,template_group_id")
  ]);

  const categories = categoriesResult.data ?? [];

  const templatesByCategory = Object.fromEntries((templatesResult.data ?? []).map((t) => {
    const groups = (templateGroupsResult.data ?? []).filter((g) => g.template_id === t.id).sort((a,b)=>a.sort_order-b.sort_order).map((g) => ({
      id: g.id, name: g.name, sortOrder: g.sort_order,
      fields: (fieldsResult.data ?? []).filter((f) => f.template_group_id === g.id).sort((a,b)=>a.sort_order-b.sort_order).map((f) => ({ id: f.id, name: f.name, key: f.key, fieldType: f.field_type, required: f.required, sortOrder: f.sort_order, options: Array.isArray(f.options) ? f.options : [] }))
    }));
    return [t.category_id, { templateId: t.id, templateName: t.name, groups }];
  }));

  const loadError = categoriesResult.error?.message || templatesResult.error?.message || templateGroupsResult.error?.message || fieldsResult.error?.message;

  async function createProduct(formData: FormData) {
    "use server";
    const { supabase: actionClient } = await requireAdmin();

    const parsed = createProductSchema.safeParse({
      title: formData.get("title"),
      slug: formData.get("slug"),
      categoryId: formData.get("categoryId"),
      description: formData.get("description"),
      status: formData.get("status"),
      images: formData.get("images")
    });

    if (!parsed.success) {
      redirect(`/admin/products/new?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Please review the form and try again.")}`);
    }

    const data = parsed.data;
    const { data: created, error } = await actionClient.from("products").insert({
      title: data.title,
      slug: data.slug,
      category_id: data.categoryId,
      description: data.description || null,
      status: data.status,
      images: parseImages(data.images)
    }).select("id").single();

    if (error || !created) {
      redirect(`/admin/products/new?error=${encodeURIComponent(error?.message ?? "Failed to create product")}`);
    }

    const specValuesRaw = String(formData.get("specValues") ?? "{}");
    const parsedValues = JSON.parse(specValuesRaw) as Record<string, string | string[]>;
    const selectedTemplate = templatesByCategory[data.categoryId];
    if (selectedTemplate) {
      const fieldRows = selectedTemplate.groups.flatMap((g: { fields: Array<{ key: string; id: string; fieldType: string }> }) => g.fields);
      const payload = fieldRows.flatMap((f: { key: string; id: string; fieldType: string }) => {
        const v = parsedValues[f.id];
        const empty = Array.isArray(v) ? v.length === 0 : !String(v ?? "").trim();
        if (empty) return [];
        return [{ product_id: created.id, field_id: f.id, value_text: f.fieldType === "text" || f.fieldType === "multi-select" ? (Array.isArray(v) ? JSON.stringify(v) : String(v)) : null, value_number: f.fieldType === "number" ? Number(v) : null, value_boolean: f.fieldType === "boolean" ? String(v) === "true" : null, value_select: f.fieldType === "select" ? String(v) : null }];
      });
      if (payload.length > 0) await actionClient.from("product_specification_values").insert(payload);
    }

    redirect("/admin/products");
  }

  return (
    <section className="space-y-4 rounded border bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Create Product</h1>
          <p className="text-sm text-slate-500">Add a new product to the catalog.</p>
        </div>
        <Link href="/admin/products" className="rounded border px-3 py-2 text-sm hover:bg-slate-50">Back to products</Link>
      </div>

      {loadError ? <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{loadError}</div> : null}
      {params?.error ? <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{params.error}</div> : null}

      {!loadError && categories.length === 0 ? (
        <div className="rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">No categories available. Create a category before adding products.</div>
      ) : (
        <ProductForm action={createProduct} categories={categories} templatesByCategory={templatesByCategory} backHref="/admin/products" submitLabel="Create product" submitLoadingLabel="Creating..." disableSubmit={categories.length === 0} defaultValues={{ title: "", slug: "", categoryId: "", description: "", status: "draft", images: "" }} />
      )}
    </section>
  );
}

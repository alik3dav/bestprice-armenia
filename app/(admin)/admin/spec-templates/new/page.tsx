import Link from "next/link";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/guards";
import { SpecTemplateForm } from "@/components/admin/spec-template-form";

const fieldTypeSchema = z.enum(["text", "number", "boolean", "select", "multi-select"]);

const createSpecTemplateSchema = z.object({
  name: z.string().trim().min(2, "Template name must be at least 2 characters."),
  categoryId: z.string().uuid("Please choose a valid category."),
  fields: z
    .array(
      z.object({
        name: z.string().trim().min(1, "Field label/name is required."),
        key: z.string().trim().min(1, "Field key/slug is required.").regex(/^[a-z0-9_]+$/, "Field key/slug must use lowercase letters, numbers, and underscores only."),
        fieldType: fieldTypeSchema,
        required: z.boolean(),
        sortOrder: z.number().int(),
        options: z.array(z.string().trim().min(1)).default([])
      })
    )
    .min(1, "Add at least one specification field.")
});

export default async function NewSpecTemplatePage({ searchParams }: { searchParams?: Promise<{ error?: string }> }) {
  const { supabase } = await requireAdmin();
  const params = await searchParams;
  const categoriesResult = await supabase.from("categories").select("id,name,status").order("name", { ascending: true });
  const categories = categoriesResult.data ?? [];

  async function createSpecTemplate(formData: FormData) {
    "use server";
    const { supabase: actionClient } = await requireAdmin();

    const fieldsInput = formData.get("fields");
    let parsedFields: unknown = [];

    if (typeof fieldsInput === "string") {
      try {
        parsedFields = JSON.parse(fieldsInput);
      } catch {
        redirect(`/admin/spec-templates/new?error=${encodeURIComponent("Specification fields payload is invalid JSON.")}`);
      }
    }

    const parsed = createSpecTemplateSchema.safeParse({
      name: formData.get("name"),
      categoryId: formData.get("categoryId"),
      fields: parsedFields
    });

    if (!parsed.success) {
      redirect(`/admin/spec-templates/new?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Please review the form and try again.")}`);
    }

    const keys = new Set<string>();
    for (const field of parsed.data.fields) {
      if (keys.has(field.key)) {
        redirect(`/admin/spec-templates/new?error=${encodeURIComponent(`Duplicate key found: ${field.key}.`)}`);
      }
      keys.add(field.key);

      if ((field.fieldType === "select" || field.fieldType === "multi-select") && field.options.length === 0) {
        redirect(`/admin/spec-templates/new?error=${encodeURIComponent(`Field \"${field.name}\" requires at least one option.`)}`);
      }
    }

    const { data: group, error: groupError } = await actionClient
      .from("specification_groups")
      .insert({ name: parsed.data.name, category_id: parsed.data.categoryId, sort_order: 0 })
      .select("id")
      .single();

    if (groupError || !group) {
      redirect(`/admin/spec-templates/new?error=${encodeURIComponent(groupError?.message ?? "Failed to create specification template.")}`);
    }

    const { error: fieldsError } = await actionClient.from("specification_fields").insert(
      parsed.data.fields.map((field) => ({
        group_id: group.id,
        name: field.name,
        key: field.key,
        field_type: field.fieldType,
        required: field.required,
        sort_order: field.sortOrder,
        options: field.fieldType === "select" || field.fieldType === "multi-select" ? field.options : null
      }))
    );

    if (fieldsError) {
      await actionClient.from("specification_groups").delete().eq("id", group.id);
      redirect(`/admin/spec-templates/new?error=${encodeURIComponent(fieldsError.message)}`);
    }

    redirect("/admin/spec-templates");
  }

  return (
    <section className="space-y-4 rounded border bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Create Spec Template</h1>
          <p className="text-sm text-slate-500">Create a category-linked template and define dynamic specification fields.</p>
        </div>
        <Link href="/admin/spec-templates" className="rounded border px-3 py-2 text-sm hover:bg-slate-50">Back to spec templates</Link>
      </div>

      {categoriesResult.error ? <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{categoriesResult.error.message}</div> : null}
      {params?.error ? <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{params.error}</div> : null}

      {!categoriesResult.error && categories.length === 0 ? (
        <div className="rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">No categories available. Create a category before adding a spec template.</div>
      ) : (
        <SpecTemplateForm categories={categories} action={createSpecTemplate} backHref="/admin/spec-templates" submitLabel="Create spec template" submitLoadingLabel="Creating..." defaultValues={{ name: "", categoryId: "", fields: [] }} />
      )}
    </section>
  );
}

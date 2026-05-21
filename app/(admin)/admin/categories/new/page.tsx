import Link from "next/link";
import { redirect } from "next/navigation";
import { z } from "zod";
import { CategoryForm } from "@/components/admin/category-form";
import { requireAdmin } from "@/lib/auth/guards";

const createCategorySchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters."),
  slug: z
    .string()
    .trim()
    .min(2, "Slug must be at least 2 characters.")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase and use hyphens only."),
  status: z.enum(["draft", "active", "archived"]),
  imageUrl: z.string().trim().optional()
});

export default async function NewCategoryPage({
  searchParams
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;

  async function createCategory(formData: FormData) {
    "use server";
    const { supabase } = await requireAdmin();

    const parsed = createCategorySchema.safeParse({
      name: formData.get("name"),
      slug: formData.get("slug"),
      status: formData.get("status"),
      imageUrl: formData.get("imageUrl")
    });

    if (!parsed.success) {
      redirect(
        `/admin/categories/new?error=${encodeURIComponent(
          parsed.error.issues[0]?.message ?? "Please review the form and try again."
        )}`
      );
    }

    const { error } = await supabase.from("categories").insert({
      name: parsed.data.name,
      slug: parsed.data.slug,
      status: parsed.data.status,
      image_url: parsed.data.imageUrl || null
    });

    if (error) {
      redirect(`/admin/categories/new?error=${encodeURIComponent(error.message)}`);
    }

    redirect("/admin/categories");
  }

  return (
    <section className="space-y-4 rounded border bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Create Category</h1>
          <p className="text-sm text-slate-500">Add a new category used to organize products.</p>
        </div>
        <Link href="/admin/categories" className="rounded border px-3 py-2 text-sm hover:bg-slate-50">
          Back to categories
        </Link>
      </div>

      {params?.error ? (
        <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{params.error}</div>
      ) : null}

      <CategoryForm action={createCategory} backHref="/admin/categories" submitLabel="Create category" submitLoadingLabel="Creating..." defaultValues={{ name: "", slug: "", status: "draft", imageUrl: "" }} />
    </section>
  );
}

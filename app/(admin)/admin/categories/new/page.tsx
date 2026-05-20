import Link from "next/link";
import { redirect } from "next/navigation";
import { z } from "zod";
import { SubmitButton } from "@/components/admin/submit-button";
import { requireAdmin } from "@/lib/auth/guards";

const createCategorySchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters."),
  slug: z
    .string()
    .trim()
    .min(2, "Slug must be at least 2 characters.")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase and use hyphens only."),
  status: z.enum(["draft", "active", "archived"])
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
      status: formData.get("status")
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
      status: parsed.data.status
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

      <form action={createCategory} className="grid gap-4 md:grid-cols-2">
        <label className="space-y-1">
          <span className="text-sm font-medium">Name *</span>
          <input name="name" required className="w-full rounded border px-3 py-2 text-sm" placeholder="Smartphones" />
        </label>
        <label className="space-y-1">
          <span className="text-sm font-medium">Slug *</span>
          <input name="slug" required className="w-full rounded border px-3 py-2 text-sm" placeholder="smartphones" />
        </label>
        <label className="space-y-1 md:col-span-2">
          <span className="text-sm font-medium">Status *</span>
          <select name="status" required className="w-full rounded border px-3 py-2 text-sm" defaultValue="draft">
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
        </label>
        <div className="flex items-center justify-end gap-2 md:col-span-2">
          <Link href="/admin/categories" className="rounded border px-3 py-2 text-sm hover:bg-slate-50">
            Cancel
          </Link>
          <SubmitButton label="Create category" loadingLabel="Creating..." />
        </div>
      </form>
    </section>
  );
}

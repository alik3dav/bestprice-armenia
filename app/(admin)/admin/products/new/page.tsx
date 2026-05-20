import Link from "next/link";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/guards";
import { SubmitButton } from "@/components/admin/submit-button";

const createProductSchema = z.object({
  title: z.string().trim().min(2, "Title must be at least 2 characters."),
  slug: z.string().trim().min(2, "Slug must be at least 2 characters.").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase and use hyphens only."),
  categoryId: z.string().uuid("Please choose a valid category."),
  brandId: z.string().uuid().optional().or(z.literal("")),
  model: z.string().trim().max(120, "Model must be 120 characters or fewer.").optional(),
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

  const [categoriesResult, brandsResult] = await Promise.all([
    supabase.from("categories").select("id,name,status").order("name", { ascending: true }),
    supabase.from("brands").select("id,name").order("name", { ascending: true })
  ]);

  const categories = categoriesResult.data ?? [];
  const brands = brandsResult.data ?? [];
  const loadError = categoriesResult.error?.message || brandsResult.error?.message;

  async function createProduct(formData: FormData) {
    "use server";
    const { supabase: actionClient } = await requireAdmin();

    const parsed = createProductSchema.safeParse({
      title: formData.get("title"),
      slug: formData.get("slug"),
      categoryId: formData.get("categoryId"),
      brandId: formData.get("brandId"),
      model: formData.get("model"),
      description: formData.get("description"),
      status: formData.get("status"),
      images: formData.get("images")
    });

    if (!parsed.success) {
      redirect(`/admin/products/new?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Please review the form and try again.")}`);
    }

    const data = parsed.data;
    const { error } = await actionClient.from("products").insert({
      title: data.title,
      slug: data.slug,
      category_id: data.categoryId,
      brand_id: data.brandId || null,
      model: data.model || null,
      description: data.description || null,
      status: data.status,
      images: parseImages(data.images)
    });

    if (error) {
      redirect(`/admin/products/new?error=${encodeURIComponent(error.message)}`);
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
        <form action={createProduct} className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1"><span className="text-sm font-medium">Title *</span><input name="title" required className="w-full rounded border px-3 py-2 text-sm" placeholder="iPhone 16 Pro" /></label>
          <label className="space-y-1"><span className="text-sm font-medium">Slug *</span><input name="slug" required className="w-full rounded border px-3 py-2 text-sm" placeholder="iphone-16-pro" /></label>
          <label className="space-y-1"><span className="text-sm font-medium">Category *</span><select name="categoryId" required className="w-full rounded border px-3 py-2 text-sm" defaultValue=""><option value="" disabled>Select category</option>{categories.map((category) => (<option key={category.id} value={category.id}>{category.name} ({category.status})</option>))}</select></label>
          <label className="space-y-1"><span className="text-sm font-medium">Brand</span><select name="brandId" className="w-full rounded border px-3 py-2 text-sm" defaultValue=""><option value="">No brand</option>{brands.map((brand) => (<option key={brand.id} value={brand.id}>{brand.name}</option>))}</select></label>
          <label className="space-y-1"><span className="text-sm font-medium">Model</span><input name="model" className="w-full rounded border px-3 py-2 text-sm" placeholder="A3102" /></label>
          <label className="space-y-1"><span className="text-sm font-medium">Status *</span><select name="status" required className="w-full rounded border px-3 py-2 text-sm" defaultValue="draft"><option value="draft">Draft</option><option value="active">Active</option><option value="archived">Archived</option></select></label>
          <label className="space-y-1 md:col-span-2"><span className="text-sm font-medium">Images</span><textarea name="images" rows={3} className="w-full rounded border px-3 py-2 text-sm" placeholder="Paste image URLs, one per line or comma-separated" /></label>
          <label className="space-y-1 md:col-span-2"><span className="text-sm font-medium">Description</span><textarea name="description" rows={5} className="w-full rounded border px-3 py-2 text-sm" /></label>
          <div className="flex items-center justify-end gap-2 md:col-span-2"><Link href="/admin/products" className="rounded border px-3 py-2 text-sm hover:bg-slate-50">Cancel</Link><SubmitButton label="Create product" loadingLabel="Creating..." disabled={categories.length === 0} /></div>
        </form>
      )}
    </section>
  );
}

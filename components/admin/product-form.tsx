import Link from "next/link";
import type { Route } from "next";
import { SubmitButton } from "@/components/admin/submit-button";

type Category = { id: string; name: string; status: string };
type Brand = { id: string; name: string };

type ProductFormValues = {
  title: string;
  slug: string;
  categoryId: string;
  brandId: string;
  model: string;
  description: string;
  status: "draft" | "active" | "archived";
  images: string;
};

export function ProductForm({
  action,
  categories,
  brands,
  backHref,
  submitLabel,
  submitLoadingLabel,
  defaultValues,
  disableSubmit
}: {
  action: (formData: FormData) => void;
  categories: Category[];
  brands: Brand[];
  backHref: Route;
  submitLabel: string;
  submitLoadingLabel: string;
  defaultValues: ProductFormValues;
  disableSubmit?: boolean;
}) {
  return (
    <form action={action} className="grid gap-4 md:grid-cols-2">
      <label className="space-y-1"><span className="text-sm font-medium">Title *</span><input name="title" required defaultValue={defaultValues.title} className="w-full rounded border px-3 py-2 text-sm" placeholder="iPhone 16 Pro" /></label>
      <label className="space-y-1"><span className="text-sm font-medium">Slug *</span><input name="slug" required defaultValue={defaultValues.slug} className="w-full rounded border px-3 py-2 text-sm" placeholder="iphone-16-pro" /></label>
      <label className="space-y-1"><span className="text-sm font-medium">Category *</span><select name="categoryId" required className="w-full rounded border px-3 py-2 text-sm" defaultValue={defaultValues.categoryId}><option value="" disabled>Select category</option>{categories.map((category) => (<option key={category.id} value={category.id}>{category.name} ({category.status})</option>))}</select></label>
      <label className="space-y-1"><span className="text-sm font-medium">Brand</span><select name="brandId" className="w-full rounded border px-3 py-2 text-sm" defaultValue={defaultValues.brandId}><option value="">No brand</option>{brands.map((brand) => (<option key={brand.id} value={brand.id}>{brand.name}</option>))}</select></label>
      <label className="space-y-1"><span className="text-sm font-medium">Model</span><input name="model" defaultValue={defaultValues.model} className="w-full rounded border px-3 py-2 text-sm" placeholder="A3102" /></label>
      <label className="space-y-1"><span className="text-sm font-medium">Status *</span><select name="status" required className="w-full rounded border px-3 py-2 text-sm" defaultValue={defaultValues.status}><option value="draft">Draft</option><option value="active">Active</option><option value="archived">Archived</option></select></label>
      <label className="space-y-1 md:col-span-2"><span className="text-sm font-medium">Images</span><textarea name="images" defaultValue={defaultValues.images} rows={3} className="w-full rounded border px-3 py-2 text-sm" placeholder="Paste image URLs, one per line or comma-separated" /></label>
      <label className="space-y-1 md:col-span-2"><span className="text-sm font-medium">Description</span><textarea name="description" defaultValue={defaultValues.description} rows={5} className="w-full rounded border px-3 py-2 text-sm" /></label>
      <div className="flex items-center justify-end gap-2 md:col-span-2"><Link href={backHref} className="rounded border px-3 py-2 text-sm hover:bg-slate-50">Cancel</Link><SubmitButton label={submitLabel} loadingLabel={submitLoadingLabel} disabled={disableSubmit} /></div>
    </form>
  );
}

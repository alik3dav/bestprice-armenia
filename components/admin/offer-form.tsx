"use client";

import { useMemo, useState } from "react";
import type { FormHTMLAttributes } from "react";
import Link from "next/link";
import type { Route } from "next";
import { SubmitButton } from "@/components/admin/submit-button";

type ProductOption = { id: string; title: string };

type OfferFormValues = {
  productId: string;
  price: string;

  stockStatus: "in_stock" | "limited" | "out_of_stock" | "preorder";
  status: "draft" | "active" | "archived";
  merchantSku: string;
  productUrl: string;
  notes: string;
};

type OfferFormProps = {
  action: FormHTMLAttributes<HTMLFormElement>["action"];
  products: ProductOption[];
  defaultValues: OfferFormValues;
  backHref: Route;
  submitLabel: string;
  submitLoadingLabel: string;
  disableSubmit?: boolean;
};

export function OfferForm({ action, products, defaultValues, backHref, submitLabel, submitLoadingLabel, disableSubmit }: OfferFormProps) {
  const [query, setQuery] = useState("");
  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter((product) => product.title.toLowerCase().includes(q));
  }, [products, query]);

  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2">
        <label className="space-y-1 md:col-span-2">
          <span className="text-sm font-medium">Search product</span>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Type product name..." className="w-full rounded border px-3 py-2 text-sm" />
        </label>
        <label className="space-y-1 md:col-span-2">
          <span className="text-sm font-medium">Product</span>
          <select name="productId" required defaultValue={defaultValues.productId} className="w-full rounded border px-3 py-2 text-sm">
            <option value="">Select a product</option>
            {filteredProducts.map((product) => <option key={product.id} value={product.id}>{product.title}</option>)}
          </select>
        </label>
        <label className="space-y-1"><span className="text-sm font-medium">Price (AMD ֏)</span><input name="price" type="number" min="0" step="1" required defaultValue={defaultValues.price} className="w-full rounded border px-3 py-2 text-sm" /></label>
        <label className="space-y-1"><span className="text-sm font-medium">Currency</span><input name="currency" readOnly value="AMD" className="w-full rounded border bg-slate-50 px-3 py-2 text-sm" /></label>
        <label className="space-y-1"><span className="text-sm font-medium">Stock status</span><select name="stockStatus" defaultValue={defaultValues.stockStatus} className="w-full rounded border px-3 py-2 text-sm"><option value="in_stock">In stock</option><option value="limited">Limited</option><option value="out_of_stock">Out of stock</option><option value="preorder">Preorder</option></select></label>
        <label className="space-y-1"><span className="text-sm font-medium">Offer status</span><select name="status" defaultValue={defaultValues.status} className="w-full rounded border px-3 py-2 text-sm"><option value="draft">Draft</option><option value="active">Active</option><option value="archived">Inactive</option></select></label>
        <label className="space-y-1"><span className="text-sm font-medium">Merchant SKU (optional)</span><input name="merchantSku" defaultValue={defaultValues.merchantSku} className="w-full rounded border px-3 py-2 text-sm" /></label>
        <label className="space-y-1"><span className="text-sm font-medium">Product URL (optional)</span><input name="productUrl" type="url" defaultValue={defaultValues.productUrl} className="w-full rounded border px-3 py-2 text-sm" /></label>
        <label className="space-y-1 md:col-span-2"><span className="text-sm font-medium">Notes (optional)</span><textarea name="notes" rows={4} defaultValue={defaultValues.notes} className="w-full rounded border px-3 py-2 text-sm" /></label>
      </div>
      <div className="flex items-center gap-2"><SubmitButton label={submitLabel} loadingLabel={submitLoadingLabel} disabled={disableSubmit} /><Link href={backHref} className="rounded border px-3 py-2 text-sm hover:bg-slate-50">Cancel</Link></div>
    </form>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: product } = await supabase
    .from("products")
    .select("id,title,description,short_description,long_description,images,status")
    .eq("slug", slug)
    .eq("status", "active")
    .single();

  if (!product) notFound();

  const image = Array.isArray(product.images) ? product.images[0] : null;

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <Link href="/" className="mb-5 inline-block text-sm text-slate-600 hover:underline">← Back</Link>
      <article className="space-y-5 rounded-2xl bg-white p-2">
        <div className="relative aspect-video rounded-xl bg-[#f6f6f6] p-3">
          {image ? <img src={image} alt={product.title} className="h-full w-full object-contain" /> : <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">No image available.</div>}
        </div>
        <h1 className="text-3xl font-bold">{product.title}</h1>
        <p className="text-sm text-slate-500">{product.short_description || "No short description available."}</p>
        <div className="prose max-w-none text-slate-700 whitespace-pre-wrap">{product.long_description || product.description || "No detailed description available yet."}</div>
      </article>
    </main>
  );
}

import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guards";

export default async function MerchantDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("merchants").select("id,name,slug,email,phone,website,status,notes,profile_id").eq("id", id).single();
  if (!data) notFound();
  const { data: owner } = data.profile_id ? await supabase.from("profiles").select("full_name").eq("id", data.profile_id).single() : { data: null };
  return <section className="rounded border bg-white p-4 space-y-2"><h1 className="text-xl font-semibold">{data.name}</h1><p className="text-sm text-slate-500">Slug: {data.slug}</p><p>Status: {data.status}</p><p>Owner: {owner?.full_name ?? "Unassigned"}</p></section>;
}

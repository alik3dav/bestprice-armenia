import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guards";

export default async function UserDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("profiles").select("id,full_name,role,merchants!profile_id(name,slug)").eq("id", id).single();
  if (!data) notFound();
  return <section className="rounded border bg-white p-4 space-y-2"><h1 className="text-xl font-semibold">{data.full_name ?? "User"}</h1><p className="text-sm text-slate-500">Role: {data.role}</p><p>Merchant: {Array.isArray(data.merchants) && data.merchants[0]?.name ? `${data.merchants[0].name} (${data.merchants[0].slug})` : "—"}</p></section>;
}

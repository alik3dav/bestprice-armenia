import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type AppRole = "admin" | "merchant" | "user";

async function requireRole(role: AppRole) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();

  if (!profile || profile.role !== role) redirect("/login");

  return { supabase, user, profile };
}

export async function requireAdmin() {
  return requireRole("admin");
}

export async function requireMerchant() {
  return requireRole("merchant");
}

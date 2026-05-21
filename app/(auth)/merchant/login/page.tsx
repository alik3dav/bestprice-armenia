"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function MerchantLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return setError(error.message);

    const userId = data.user?.id;
    if (!userId) return setError("Չհաջողվեց ստանալ մուտք գործած օգտատիրոջ տվյալը։ Կրկին փորձեք։");

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (profileError || !profile || profile.role !== "merchant") {
      await supabase.auth.signOut();
      return setError("Ձեր հաշիվը վաճառողի հասանելիություն չունի։");
    }

    router.replace("/merchant/dashboard");
    router.refresh();
  }

  return (
    <main className="mx-auto mt-20 max-w-md rounded-lg bg-white p-6 shadow">
      <h1 className="mb-4 text-xl font-semibold">Վաճառողի մուտք</h1>
      <form className="space-y-3" onSubmit={onSubmit}>
        <input className="w-full rounded border p-2" placeholder="Էլ․ փոստ" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="w-full rounded border p-2" placeholder="Գաղտնաբառ" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="w-full rounded bg-slate-900 p-2 text-white">Մուտք գործել</button>
      </form>
    </main>
  );
}

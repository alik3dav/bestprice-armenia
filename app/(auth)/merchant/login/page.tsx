"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Eye, EyeOff, Lock, Store } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function MerchantLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setIsLoading(false);
      return setError(error.message);
    }

    const userId = data.user?.id;
    if (!userId) {
      setIsLoading(false);
      return setError("Չհաջողվեց ստանալ մուտք գործած օգտատիրոջ տվյալը։ Կրկին փորձեք։");
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (profileError || !profile || profile.role !== "merchant") {
      await supabase.auth.signOut();
      setIsLoading(false);
      return setError("Ձեր հաշիվը վաճառողի հասանելիություն չունի։");
    }

    setSuccess("Մուտքը հաջողվեց։ Վերահղվում եք վաճառողի վահանակ։");
    router.replace("/merchant/dashboard");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto grid min-h-screen w-full max-w-7xl grid-cols-1 px-4 py-6 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-8">
        <section className="relative order-1 overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 lg:order-none lg:m-4 lg:flex lg:flex-col lg:justify-between lg:p-10">
          <div className="absolute inset-0 -z-0 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.12),transparent_55%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.1),transparent_55%)]" />
          <div className="relative z-10 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
              <Store className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">BestPrice Armenia</p>
              <p className="text-base font-semibold text-slate-900">Merchant Portal</p>
            </div>
          </div>

          <div className="relative z-10 mt-10 space-y-4 lg:mt-0">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Վաճառողի հաշվի արագ և անվտանգ մուտք</h1>
            <p className="max-w-md text-sm leading-6 text-slate-600 sm:text-base">Մուտք գործեք վաճառողի պորտալ՝ առաջարկները, գներն ու ապրանքային ներկայությունը հարթակում վստահությամբ կառավարելու համար։</p>
          </div>
        </section>

        <section className="order-2 flex items-center justify-center py-6 lg:py-0">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-2xl font-semibold text-slate-900">Merchant Portal</h2>
            <p className="mt-2 text-sm text-slate-600">Վաճառողի հաշվի պրոֆեսիոնալ հասանելիություն</p>

            <form className="mt-6 space-y-4" onSubmit={onSubmit}>
              <div className="space-y-2">
                <label htmlFor="merchant-email" className="text-sm font-medium text-slate-700">Էլ. փոստ</label>
                <input id="merchant-email" type="email" autoComplete="email" required className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.am" />
              </div>

              <div className="space-y-2">
                <label htmlFor="merchant-password" className="text-sm font-medium text-slate-700">Գաղտնաբառ</label>
                <div className="relative">
                  <input id="merchant-password" type={showPassword ? "text" : "password"} autoComplete="current-password" required className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 pr-11 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
                  <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-500 transition hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300" aria-label={showPassword ? "Թաքցնել գաղտնաբառը" : "Ցույց տալ գաղտնաբառը"}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
              {success && (
                <p className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  {success}
                </p>
              )}

              <button disabled={isLoading} className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400">
                <Lock className="h-4 w-4" aria-hidden="true" />
                {isLoading ? "Մուտք..." : "Մուտք գործել"}
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}

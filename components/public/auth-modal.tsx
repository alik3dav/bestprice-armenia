"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function AuthModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const supabase = createClient();
      if (!supabase) throw new Error("Նույնականացումը այս պահին անհասանելի է։ Խնդրում ենք փորձել ավելի ուշ։");

      if (mode === "login") {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        onClose();
      } else {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              role: "user",
              full_name: fullName || null,
            },
          },
        });
        if (signUpError) throw signUpError;
        setMessage("Հաշիվը ստեղծված է։ Եթե պահանջվում է հաստատում, ստուգեք ձեր էլ․ փոստը։");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Նույնականացումը ձախողվեց");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">{mode === "login" ? "Բարի վերադարձ" : "Ստեղծել հաշիվ"}</h2>
          <button onClick={onClose} className="rounded p-1 text-slate-500 hover:bg-slate-100">✕</button>
        </div>
        <p className="mb-4 text-sm text-slate-600">Միայն գնորդների համար։ Վաճառողի և ադմինի մուտքը առանձին պորտալներով է։</p>
        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === "signup" && (
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              placeholder="Ամբողջական անուն"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          )}
          <input
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            type="email"
            required
            placeholder="Էլ․ փոստ"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            type="password"
            required
            placeholder="Գաղտնաբառ"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="text-sm text-rose-600">{error}</p>}
          {message && <p className="text-sm text-emerald-600">{message}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {loading ? "Խնդրում ենք սպասել..." : mode === "login" ? "Մուտք" : "Գրանցում"}
          </button>
        </form>
        <button
          className="mt-4 w-full text-center text-sm text-slate-600 hover:text-slate-900"
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
        >
          {mode === "login" ? "Հաշիվ չունե՞ք։ Գրանցվել" : "Արդեն ունե՞ք հաշիվ։ Մուտք գործել"}
        </button>
      </div>
    </div>
  );
}

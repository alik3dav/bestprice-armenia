"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function AuthModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isRendered, setIsRendered] = useState(open);

  useEffect(() => {
    if (open) setIsRendered(true);
    else {
      const timeout = setTimeout(() => setIsRendered(false), 220);
      return () => clearTimeout(timeout);
    }
  }, [open]);

  useEffect(() => {
    setError(null);
    setMessage(null);
  }, [mode]);

  if (!isRendered) return null;

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
    <div
      className={`fixed inset-0 z-50 flex items-end justify-center p-3 sm:items-center sm:p-4 transition-all duration-200 ${
        open ? "bg-slate-950/45" : "bg-slate-950/0"
      }`}
      onClick={onClose}
    >
      <div
        className={`w-full max-w-md rounded-3xl bg-white/95 p-5 shadow-[0_20px_50px_-20px_rgba(15,23,42,0.45)] backdrop-blur-sm transition-all duration-200 sm:p-6 ${
          open ? "translate-y-0 scale-100 opacity-100" : "translate-y-2 scale-[0.98] opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">BestPrice Armenia</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{mode === "login" ? "Մուտք" : "Գրանցում"}</h2>
            <p className="mt-1 text-sm text-slate-600">Միայն գնորդների համար։ Վաճառողի և ադմինի մուտքը՝ առանձին։</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
            aria-label="Փակել"
          >
            ✕
          </button>
        </div>

        <div className="mb-5 grid grid-cols-2 rounded-xl bg-slate-100 p-1 text-sm">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`rounded-lg px-3 py-2 font-medium transition-all ${
              mode === "login" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Մուտք
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`rounded-lg px-3 py-2 font-medium transition-all ${
              mode === "signup" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Գրանցում
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className={`grid transition-all duration-200 ${mode === "signup" ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
            <div className="overflow-hidden">
              <input
                className="mb-3 w-full rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none ring-1 ring-slate-200 transition focus:ring-2 focus:ring-slate-400"
                placeholder="Ամբողջական անուն (ոչ պարտադիր)"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
          </div>

          <input
            className="w-full rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none ring-1 ring-slate-200 transition focus:ring-2 focus:ring-slate-400"
            type="email"
            required
            placeholder="Էլ․ փոստ"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div className="relative">
            <input
              className="w-full rounded-xl bg-slate-50 px-4 py-3 pr-12 text-sm text-slate-900 outline-none ring-1 ring-slate-200 transition focus:ring-2 focus:ring-slate-400"
              type={showPassword ? "text" : "password"}
              required
              placeholder="Գաղտնաբառ"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute inset-y-0 right-2 my-auto h-9 rounded-lg px-3 text-xs font-medium text-slate-600 transition hover:bg-slate-200 hover:text-slate-900"
            >
              {showPassword ? "Թաքցնել" : "Ցույց տալ"}
            </button>
          </div>

          {error && <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
          {message && <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Խնդրում ենք սպասել..." : mode === "login" ? "Մուտք" : "Գրանցում"}
          </button>
        </form>

        <button
          className="mt-4 w-full text-center text-sm text-slate-600 transition hover:text-slate-900"
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
        >
          {mode === "login" ? "Չունե՞ք հաշիվ։ Գրանցվել" : "Արդեն ունե՞ք հաշիվ։ Մուտք գործել"}
        </button>
      </div>
    </div>
  );
}

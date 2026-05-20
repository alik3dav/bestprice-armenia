"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, User } from "lucide-react";
import { AuthModal } from "@/components/public/auth-modal";
import { createClient } from "@/lib/supabase/client";

export function PublicHeader({ userEmail }: { userEmail: string | null }) {
  const [openAuth, setOpenAuth] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);

  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.reload();
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-lg font-semibold tracking-tight text-slate-900">BestPrice</Link>
          {!userEmail ? (
            <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white" onClick={() => setOpenAuth(true)}>
              Login
            </button>
          ) : (
            <div className="relative flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                <User size={16} />
              </div>
              <button className="rounded-lg border border-slate-200 p-2" onClick={() => setOpenMenu((v) => !v)}>
                <Menu size={16} />
              </button>
              {openMenu && (
                <div className="absolute right-0 top-12 w-44 rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
                  <a className="block rounded-lg px-3 py-2 text-sm hover:bg-slate-100" href="#">Profile / Account</a>
                  <button className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-100" onClick={handleLogout}>Logout</button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>
      <AuthModal open={openAuth} onClose={() => setOpenAuth(false)} />
    </>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton({ className }: { className?: string }) {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [confirming, setConfirming] = useState(false);

  async function signOut() {
    setIsSigningOut(true);
    await createClient().auth.signOut({ scope: "local" });
    router.replace("/login");
    router.refresh();
  }

  if (confirming) {
    return <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4" role="dialog" aria-modal="true" aria-labelledby="logout-title"><section className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900"><h2 id="logout-title" className="text-lg font-bold">Log out?</h2><p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">Are you sure you want to log out of Swachh Connect?</p><div className="mt-6 flex justify-end gap-3"><button className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold dark:border-slate-700" disabled={isSigningOut} onClick={() => setConfirming(false)} type="button">Cancel</button><button className="rounded-xl bg-red-700 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60" disabled={isSigningOut} onClick={signOut} type="button">{isSigningOut ? "Logging out…" : "Log out"}</button></div></section></div>;
  }

  return <button className={className || "rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-100 disabled:opacity-60 dark:border-slate-700 dark:hover:bg-slate-800"} disabled={isSigningOut} onClick={() => setConfirming(true)} type="button">Log out</button>;
}

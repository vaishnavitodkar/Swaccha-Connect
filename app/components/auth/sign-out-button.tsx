"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function signOut() {
    setIsSigningOut(true);
    await createClient().auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return <button className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-100 disabled:opacity-60 dark:border-slate-700 dark:hover:bg-slate-800" disabled={isSigningOut} onClick={signOut} type="button">{isSigningOut ? "Signing out…" : "Sign out"}</button>;
}

import { redirect } from "next/navigation";
import { SignOutButton } from "@/app/components/auth/sign-out-button";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-20">
      <section className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
        <p className="text-sm font-bold tracking-[0.14em] text-emerald-700 uppercase dark:text-emerald-400">Swachh Connect</p>
        <h1 className="mt-5 text-3xl font-bold tracking-tight">You are signed in</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">Signed in as {user.email}. The citizen dashboard will be built next.</p>
        <div className="mt-7"><SignOutButton /></div>
      </section>
    </main>
  );
}

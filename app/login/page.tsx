import Link from "next/link";
import { ArrowUpRight, CheckCircle2, MapPin } from "lucide-react";
import { AuthForm } from "@/app/components/auth/auth-form";

export const metadata = { title: "Sign in | Swachh Connect" };

export default function LoginPage() {
  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <section className="auth-hero hidden p-12 text-emerald-50 lg:flex lg:flex-col lg:justify-between">
        <div className="relative z-10">
          <p className="inline-flex items-center gap-2 text-sm font-semibold tracking-[0.18em] text-emerald-100 uppercase"><MapPin className="size-4" /> Swachh Connect</p>
          <h1 className="mt-8 max-w-lg text-5xl font-semibold tracking-tight">Cleaner neighbourhoods, together.</h1>
          <p className="mt-6 max-w-md text-lg leading-8 text-emerald-100">
            Report sanitation issues, follow progress, and help your community prioritise what matters.
          </p>
          <div className="mt-10 grid max-w-md gap-3 text-sm">
            <p className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur"><CheckCircle2 className="size-5 text-emerald-200" /> Clear progress updates on every report</p>
            <p className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur"><ArrowUpRight className="size-5 text-emerald-200" /> Help your community prioritise local issues</p>
          </div>
        </div>
        <p className="relative z-10 max-w-sm text-sm leading-6 text-emerald-200">A citizen-focused community portal. Not an official government service.</p>
      </section>

      <section className="flex items-center justify-center px-5 py-20 sm:px-8">
        <div className="w-full max-w-md rounded-3xl bg-white/70 p-1 sm:p-5 dark:bg-slate-900/40">
          <Link className="text-sm font-bold tracking-[0.14em] text-emerald-700 uppercase dark:text-emerald-400" href="/login">Swachh Connect</Link>
          <h2 className="mt-8 text-3xl font-bold tracking-tight">Welcome back</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">Sign in to report, track, and support local sanitation issues.</p>

          <AuthForm mode="login" />
        </div>
      </section>
    </main>
  );
}

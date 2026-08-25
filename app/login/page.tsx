import Link from "next/link";
import { AuthForm } from "@/app/components/auth/auth-form";

export const metadata = { title: "Sign in | Swachh Connect" };

export default function LoginPage() {
  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <section className="hidden bg-emerald-800 p-12 text-emerald-50 lg:flex lg:flex-col lg:justify-between">
        <div>
          <p className="text-sm font-semibold tracking-[0.18em] text-emerald-200 uppercase">Swachh Connect</p>
          <h1 className="mt-8 max-w-lg text-5xl font-semibold tracking-tight">Cleaner neighbourhoods, together.</h1>
          <p className="mt-6 max-w-md text-lg leading-8 text-emerald-100">
            Report sanitation issues, follow progress, and help your community prioritise what matters.
          </p>
        </div>
        <p className="max-w-sm text-sm leading-6 text-emerald-200">A citizen-focused community portal. Not an official government service.</p>
      </section>

      <section className="flex items-center justify-center px-5 py-20 sm:px-8">
        <div className="w-full max-w-md">
          <Link className="text-sm font-bold tracking-[0.14em] text-emerald-700 uppercase dark:text-emerald-400" href="/login">Swachh Connect</Link>
          <h2 className="mt-8 text-3xl font-bold tracking-tight">Welcome back</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">Sign in to report, track, and support local sanitation issues.</p>

          <AuthForm mode="login" />
        </div>
      </section>
    </main>
  );
}

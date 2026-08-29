import Link from "next/link";
import { AuthForm } from "@/app/components/auth/auth-form";

export const metadata = { title: "Create account | Swachh Connect" };

export default function SignupPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-20 sm:px-8">
      <section className="surface-card w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 sm:p-9 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
        <Link className="text-sm font-bold tracking-[0.14em] text-emerald-700 uppercase dark:text-emerald-400" href="/login">Swachh Connect</Link>
        <h1 className="mt-7 text-3xl font-bold tracking-tight">Create your account</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">Join your community in reporting and resolving local sanitation issues.</p>
        <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-100">Use an email address you can access to receive updates about your reports.</div>

        <AuthForm mode="signup" />
        <p className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400">Already have an account? <Link className="font-semibold text-emerald-700 hover:underline dark:text-emerald-400" href="/login">Sign in</Link></p>
      </section>
    </main>
  );
}

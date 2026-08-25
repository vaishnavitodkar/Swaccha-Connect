import Link from "next/link";

export const metadata = { title: "Create account | Swachh Connect" };

export default function SignupPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-20 sm:px-8">
      <section className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-9 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
        <Link className="text-sm font-bold tracking-[0.14em] text-emerald-700 uppercase dark:text-emerald-400" href="/login">Swachh Connect</Link>
        <h1 className="mt-7 text-3xl font-bold tracking-tight">Create your account</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">Join your community in reporting and resolving local sanitation issues.</p>
        <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-100">Use an email address you can access to receive updates about your reports.</div>

        <form className="mt-7 grid gap-5 sm:grid-cols-2" noValidate>
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-medium" htmlFor="full-name">Full name</label>
            <input autoComplete="name" className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-950 dark:focus:border-emerald-400 dark:focus:ring-emerald-950" id="full-name" name="fullName" placeholder="Enter your full name" required type="text" />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-medium" htmlFor="signup-email">Email address</label>
            <input autoComplete="email" className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-950 dark:focus:border-emerald-400 dark:focus:ring-emerald-950" id="signup-email" name="email" placeholder="name@example.com" required type="email" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium" htmlFor="new-password">Create password</label>
            <input autoComplete="new-password" className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-950 dark:focus:border-emerald-400 dark:focus:ring-emerald-950" id="new-password" minLength={8} name="password" placeholder="At least 8 characters" required type="password" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium" htmlFor="confirm-password">Confirm password</label>
            <input autoComplete="new-password" className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-950 dark:focus:border-emerald-400 dark:focus:ring-emerald-950" id="confirm-password" minLength={8} name="confirmPassword" placeholder="Re-enter password" required type="password" />
          </div>
          <label className="flex cursor-pointer items-start gap-3 text-sm leading-6 text-slate-600 sm:col-span-2 dark:text-slate-400">
            <input className="mt-1 size-4 rounded border-slate-300 text-emerald-700 focus:ring-emerald-600 dark:border-slate-700 dark:bg-slate-950" name="terms" required type="checkbox" />
            I agree to use this community portal responsibly and respectfully.
          </label>
          <button className="rounded-xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 sm:col-span-2 dark:bg-emerald-600 dark:hover:bg-emerald-500" type="button">Create account</button>
        </form>
        <p className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400">Already have an account? <Link className="font-semibold text-emerald-700 hover:underline dark:text-emerald-400" href="/login">Sign in</Link></p>
      </section>
    </main>
  );
}

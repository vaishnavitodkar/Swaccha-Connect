import Link from "next/link";

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

          <form className="mt-8 space-y-5" noValidate>
            <div>
              <label className="mb-2 block text-sm font-medium" htmlFor="email">Email address</label>
              <input autoComplete="email" className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-900 dark:focus:border-emerald-400 dark:focus:ring-emerald-950" id="email" name="email" placeholder="name@example.com" required type="email" />
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between gap-4">
                <label className="block text-sm font-medium" htmlFor="password">Password</label>
                <button className="text-sm font-medium text-emerald-700 hover:text-emerald-800 hover:underline dark:text-emerald-400" type="button">Forgot password?</button>
              </div>
              <input autoComplete="current-password" className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-900 dark:focus:border-emerald-400 dark:focus:ring-emerald-950" id="password" name="password" placeholder="Enter your password" required type="password" />
            </div>
            <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
              <input className="size-4 rounded border-slate-300 text-emerald-700 focus:ring-emerald-600 dark:border-slate-700 dark:bg-slate-900" name="remember" type="checkbox" />
              Keep me signed in on this device
            </label>
            <button className="w-full rounded-xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500" type="button">Sign in</button>
          </form>
          <p className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400">New to Swachh Connect? <Link className="font-semibold text-emerald-700 hover:underline dark:text-emerald-400" href="/signup">Create an account</Link></p>
        </div>
      </section>
    </main>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type AuthMode = "login" | "signup";

type Feedback = {
  kind: "error" | "success";
  message: string;
};

export function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const isSignup = mode === "signup";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (isSignup && password !== String(formData.get("confirmPassword") ?? "")) {
      setFeedback({ kind: "error", message: "The passwords do not match." });
      return;
    }

    setIsSubmitting(true);

    if (isSignup) {
      const fullName = String(formData.get("fullName") ?? "").trim();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
        },
      });

      setIsSubmitting(false);

      if (error) {
        setFeedback({ kind: "error", message: error.message });
        return;
      }

      if (data.session) {
        router.replace("/dashboard");
        router.refresh();
        return;
      }

      setFeedback({
        kind: "success",
        message: "Check your email to confirm your account, then return here to sign in.",
      });
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setIsSubmitting(false);

    if (error) {
      setFeedback({ kind: "error", message: error.message });
      return;
    }

    router.replace("/dashboard");
    router.refresh();
  }

  const fieldClassName = "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:focus:border-emerald-400 dark:focus:ring-emerald-950";

  return (
    <form className={isSignup ? "mt-7 grid gap-5 sm:grid-cols-2" : "mt-8 space-y-5"} onSubmit={handleSubmit}>
      {feedback ? (
        <div className={`rounded-xl border px-4 py-3 text-sm leading-6 ${feedback.kind === "error" ? "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-100" : "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-100"}`} role={feedback.kind === "error" ? "alert" : "status"}>
          {feedback.message}
        </div>
      ) : null}

      {isSignup ? (
        <div className="sm:col-span-2">
          <label className="mb-2 block text-sm font-medium" htmlFor="full-name">Full name</label>
          <input autoComplete="name" className={fieldClassName} id="full-name" name="fullName" placeholder="Enter your full name" required type="text" />
        </div>
      ) : null}

      <div className={isSignup ? "sm:col-span-2" : ""}>
        <label className="mb-2 block text-sm font-medium" htmlFor={`${mode}-email`}>Email address</label>
        <input autoComplete="email" className={fieldClassName} id={`${mode}-email`} name="email" placeholder="name@example.com" required type="email" />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium" htmlFor={`${mode}-password`}>{isSignup ? "Create password" : "Password"}</label>
        <input autoComplete={isSignup ? "new-password" : "current-password"} className={fieldClassName} id={`${mode}-password`} minLength={isSignup ? 8 : undefined} name="password" placeholder={isSignup ? "At least 8 characters" : "Enter your password"} required type="password" />
      </div>

      {isSignup ? (
        <div>
          <label className="mb-2 block text-sm font-medium" htmlFor="confirm-password">Confirm password</label>
          <input autoComplete="new-password" className={fieldClassName} id="confirm-password" minLength={8} name="confirmPassword" placeholder="Re-enter password" required type="password" />
        </div>
      ) : null}

      {isSignup ? (
        <label className="flex cursor-pointer items-start gap-3 text-sm leading-6 text-slate-600 sm:col-span-2 dark:text-slate-400">
          <input className="mt-1 size-4 rounded border-slate-300 text-emerald-700 focus:ring-emerald-600 dark:border-slate-700 dark:bg-slate-950" name="terms" required type="checkbox" />
          I agree to use this community portal responsibly and respectfully.
        </label>
      ) : (
        <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
          <input className="size-4 rounded border-slate-300 text-emerald-700 focus:ring-emerald-600 dark:border-slate-700 dark:bg-slate-900" name="remember" type="checkbox" />
          Keep me signed in on this device
        </label>
      )}

      <button className={`rounded-xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-emerald-600 dark:hover:bg-emerald-500 ${isSignup ? "sm:col-span-2" : "w-full"}`} disabled={isSubmitting} type="submit">
        {isSubmitting ? (isSignup ? "Creating account…" : "Signing in…") : (isSignup ? "Create account" : "Sign in")}
      </button>

      {!isSignup ? (
        <p className="text-center text-sm text-slate-600 dark:text-slate-400">New to Swachh Connect? <Link className="font-semibold text-emerald-700 hover:underline dark:text-emerald-400" href="/signup">Create an account</Link></p>
      ) : null}
    </form>
  );
}

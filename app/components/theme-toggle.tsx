"use client";

import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  function toggleTheme() {
    const nextTheme = !isDark;
    document.documentElement.classList.toggle("dark", nextTheme);
    setIsDark(nextTheme);
  }

  return (
    <button
      aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
      className="inline-flex h-10 items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 text-sm font-medium text-emerald-900 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
      onClick={toggleTheme}
      type="button"
    >
      <span aria-hidden="true" className="text-base">{isDark ? "☀" : "☾"}</span>
      <span>{isDark ? "Light" : "Dark"}</span>
    </button>
  );
}

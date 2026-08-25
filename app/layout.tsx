import type { Metadata } from "next";
import "./globals.css";
import { ThemeToggle } from "./components/theme-toggle";

export const metadata: Metadata = {
  title: "Swachh Connect",
  description: "A community sanitation reporting portal.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-stone-50 text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-100">
        <div className="fixed right-4 top-4 z-10 sm:right-6 sm:top-6">
          <ThemeToggle />
        </div>
        {children}
      </body>
    </html>
  );
}

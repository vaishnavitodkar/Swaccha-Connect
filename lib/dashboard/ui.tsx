import { CircleAlert } from "lucide-react";
import { ComplaintStatus, statusLabels } from "@/lib/dashboard/types";

export const statusStyles: Record<ComplaintStatus, string> = {
  reported: "bg-slate-100 text-slate-700",
  acknowledged: "bg-sky-100 text-sky-800",
  assigned: "bg-violet-100 text-violet-800",
  scheduled: "bg-indigo-100 text-indigo-800",
  in_progress: "bg-amber-100 text-amber-900",
  completed: "bg-emerald-100 text-emerald-900",
  citizen_verification: "bg-cyan-100 text-cyan-900",
  closed: "bg-emerald-100 text-emerald-900",
  reopened: "bg-orange-100 text-orange-900",
  rejected: "bg-red-100 text-red-900",
};

export function StatusBadge({ status }: { status: ComplaintStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[status]}`}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {statusLabels[status]}
    </span>
  );
}

export function DuplicateBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-800 dark:bg-orange-950/40 dark:text-orange-200">
      <span className="size-1.5 rounded-full bg-current" />
      Duplicate
    </span>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800 ${className}`}
    />
  );
}

export function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-900 dark:bg-red-950/30">
      <CircleAlert className="mx-auto size-7 text-red-700" />
      <p className="mt-2 font-bold">We couldn’t load this view</p>
      <button
        onClick={onRetry}
        className="mt-4 rounded-xl bg-red-700 px-4 py-2 text-sm font-bold text-white"
      >
        Try again
      </button>
    </div>
  );
}

export function Field({
  label,
  help,
  children,
}: {
  label: string;
  help?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm font-semibold">
      {label}
      <span className="mt-2 block">{children}</span>
      {help && (
        <span className="mt-1 block text-xs font-normal text-slate-500">
          {help}
        </span>
      )}
    </label>
  );
}

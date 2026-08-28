"use client";
/* Signed Supabase Storage URLs cannot be allow-listed as static Next image domains. */
/* eslint-disable @next/next/no-img-element */

import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import {
  Camera,
  CheckCircle2,
  FilePlus2,
  ListFilter,
  LoaderCircle,
  MapPin,
  Menu,
  Search,
  Send,
  ShieldCheck,
  X,
} from "lucide-react";
import { SignOutButton } from "@/app/components/auth/sign-out-button";
import { createClient } from "@/lib/supabase/client";
import {
  Complaint,
  ComplaintImage,
  ComplaintStatus,
  Municipality,
  StatusHistory,
  Ward,
  categoryLabels,
  formatDate,
  pendingStatuses,
  resolvedStatuses,
  shortComplaintId,
  statusLabels,
} from "@/lib/dashboard/types";
import {
  fetchMunicipalityComplaints,
  notifyMunicipalityCitizens,
  officerCanSet,
  officerStatusAction,
  updateComplaintStatus,
  uploadEvidence,
} from "@/lib/dashboard/officer";
import { ErrorState, Skeleton, StatusBadge } from "@/lib/dashboard/ui";

type OfficerProfile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  municipality_id: string | null;
  ward_id: string | null;
};
type Filter = "all" | "pending" | "in_progress" | "resolved";

export function OfficerDashboard({ profile }: { profile: OfficerProfile }) {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [images, setImages] = useState<ComplaintImage[]>([]);
  const [history, setHistory] = useState<StatusHistory[]>([]);
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [selected, setSelected] = useState<Complaint | null>(null);
  const supabase = useMemo(() => createClient(), []);

  const municipalityId = profile.municipality_id;

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    if (!municipalityId) {
      setComplaints([]);
      setLoading(false);
      return;
    }
    const complaintRows = await fetchMunicipalityComplaints(
      supabase,
      municipalityId,
    );
    const ids = complaintRows.map((item) => item.id);
    const [
      imageResult,
      historyResult,
      municipalityResult,
      wardResult,
    ] = await Promise.all([
      ids.length
        ? supabase
            .from("complaint_images")
            .select("id,complaint_id,storage_path,image_type,created_at")
            .in("complaint_id", ids)
            .order("created_at", { ascending: true })
        : Promise.resolve({ data: [], error: null }),
      ids.length
        ? supabase
            .from("complaint_status_history")
            .select("id,complaint_id,status,note,created_at")
            .in("complaint_id", ids)
            .order("created_at", { ascending: true })
        : Promise.resolve({ data: [], error: null }),
      supabase
        .from("municipalities")
        .select("id,name,state,district")
        .order("name"),
      supabase
        .from("wards")
        .select("id,municipality_id,name,ward_number")
        .order("ward_number"),
    ]);
    setComplaints(complaintRows);
    setImages((imageResult.data ?? []) as ComplaintImage[]);
    setHistory((historyResult.data ?? []) as StatusHistory[]);
    setMunicipalities((municipalityResult.data ?? []) as Municipality[]);
    setWards((wardResult.data ?? []) as Ward[]);
    setLoading(false);
  }, [municipalityId, supabase]);

  useEffect(() => {
    if (!municipalityId) return;
    const initialLoad = window.setTimeout(loadData, 0);
    const channel = supabase
      .channel(`officer-dashboard-${profile.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "complaints",
          filter: `municipality_id=eq.${municipalityId}`,
        },
        loadData,
      )
      .subscribe();
    return () => {
      window.clearTimeout(initialLoad);
      supabase.removeChannel(channel);
    };
  }, [loadData, municipalityId, profile.id, supabase]);

  const stats = {
    all: complaints.length,
    pending: complaints.filter((item) => pendingStatuses.includes(item.status))
      .length,
    in_progress: complaints.filter((item) => item.status === "in_progress")
      .length,
    resolved: complaints.filter((item) =>
      resolvedStatuses.includes(item.status),
    ).length,
  };
  const visibleComplaints = complaints.filter((item) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "pending"
        ? pendingStatuses.includes(item.status)
        : filter === "resolved"
          ? resolvedStatuses.includes(item.status)
          : item.status === filter);
    const query = search.trim().toLowerCase();
    return (
      matchesFilter &&
      (!query ||
        item.title.toLowerCase().includes(query) ||
        item.address?.toLowerCase().includes(query) ||
        categoryLabels[item.category].toLowerCase().includes(query))
    );
  });
  const initial = profile.full_name?.trim().slice(0, 1).toUpperCase() || "O";
  const municipality = municipalities.find(
    (item) => item.id === municipalityId,
  );

  async function handleChange(
    target: "acknowledged" | "scheduled" | "in_progress" | "closed",
    evidence?: File,
  ) {
    if (!selected) return { error: undefined as string | undefined };
    if (evidence) {
      const upload = await uploadEvidence(supabase, {
        complaintId: selected.id,
        officerId: profile.id,
        imageType: target === "closed" ? "after" : "before",
        file: evidence,
      });
      if (upload.error) return upload;
    }
    const action = officerStatusAction[target];
    const { error } = await updateComplaintStatus(supabase, {
      complaintId: selected.id,
      status: target,
      officerId: profile.id,
      timestamp: action.timestamp,
    });
    if (error) return { error };
    if (target === "closed" && municipalityId) {
      await notifyMunicipalityCitizens(supabase, {
        municipalityId,
        complaintId: selected.id,
        title: "Complaint resolved",
        message: `${shortComplaintId(selected.id)} — ${selected.title} has been marked resolved.`,
      });
    }
    setSuccessMessage(
      target === "closed"
        ? `${shortComplaintId(selected.id)} has been marked resolved. Citizens have been notified.`
        : `${shortComplaintId(selected.id)} marked ${statusLabels[target].toLowerCase()}.`,
    );
    setSelected(null);
    loadData();
    return { error: undefined };
  }

  return (
    <div className="min-h-screen bg-stone-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 border-r border-slate-200 bg-white p-5 transition-transform dark:border-slate-800 dark:bg-slate-900 lg:translate-x-0 ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}
        aria-label="Dashboard navigation"
      >
        <div className="flex items-center justify-between">
          <a
            className="text-sm font-extrabold tracking-[.14em] text-emerald-700 uppercase"
            href="#overview"
          >
            Swachh Connect
          </a>
          <button
            className="rounded-lg p-2 lg:hidden"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          >
            <X />
          </button>
        </div>
        <nav className="mt-10 space-y-1 text-sm font-semibold">
          <OfficerNavLink href="#overview" label="Dashboard" />
          <OfficerNavLink href="#complaints" label="Complaints" />
          <Link
            href="/profile"
            className="flex min-h-11 items-center rounded-xl px-3 text-slate-600 hover:bg-emerald-50 hover:text-emerald-800 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Profile
          </Link>
          <SignOutButton className="flex min-h-11 w-full items-center rounded-xl px-3 text-left text-sm font-semibold text-slate-600 hover:bg-red-50 hover:text-red-800 dark:text-slate-300 dark:hover:bg-red-950/30" />
        </nav>
        <p className="absolute inset-x-5 bottom-5 text-xs leading-5 text-slate-500">
          A community sanitation portal. Not an official government service.
        </p>
      </aside>
      {menuOpen && (
        <button
          className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden"
          onClick={() => setMenuOpen(false)}
          aria-label="Close navigation"
        />
      )}
      <main className="lg:pl-72">
        <header className="sticky top-0 z-20 flex h-18 items-center justify-between border-b border-slate-200 bg-stone-50/95 px-4 backdrop-blur sm:px-7 dark:border-slate-800 dark:bg-slate-950/95">
          <div className="flex items-center gap-3">
            <button
              className="rounded-lg p-2 lg:hidden"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu />
            </button>
            <div>
              <p className="text-xs font-bold tracking-[.12em] text-emerald-700 uppercase">
                Officer workspace
              </p>
              <h1 className="font-bold">Municipal dashboard</h1>
            </div>
          </div>
          <Link
            href="/profile"
            className="hidden items-center gap-2 rounded-xl p-1 transition hover:bg-emerald-50 sm:flex dark:hover:bg-slate-800"
          >
            <div className="grid size-9 place-items-center overflow-hidden rounded-full bg-emerald-700 text-sm font-bold text-white">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt=""
                  className="size-full object-cover"
                />
              ) : (
                initial
              )}
            </div>
            <span className="max-w-32 truncate text-sm font-semibold">
              {profile.full_name || "Officer"}
            </span>
          </Link>
        </header>
        <div className="mx-auto max-w-7xl p-4 sm:p-7">
          <section
            id="overview"
            className="rounded-2xl bg-emerald-800 px-6 py-7 text-white sm:px-8"
          >
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
              <div>
                <p className="text-sm text-emerald-100">
                  {profile.full_name?.split(" ")[0] || "Officer"}
                </p>
                <h2 className="mt-1 text-2xl font-bold tracking-tight">
                  Manage sanitation work here.
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-emerald-100">
                  Track and update complaints across{" "}
                  {municipality?.name || "your municipality"}.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-3 text-sm font-bold">
                <ShieldCheck className="size-5" />
                {municipality?.name || "Municipal officer"}
              </div>
            </div>
          </section>
          {successMessage && (
            <div
              role="status"
              className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100"
            >
              <span>{successMessage}</span>
              <button
                onClick={() => setSuccessMessage(null)}
                aria-label="Dismiss success message"
              >
                <X className="size-4" />
              </button>
            </div>
          )}
          <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {loading ? (
              Array.from({ length: 4 }, (_, index) => (
                <Skeleton key={index} className="h-28" />
              ))
            ) : (
              <>
                <Stat
                  label="Total complaints"
                  value={stats.all}
                  active={filter === "all"}
                  onClick={() => setFilter("all")}
                />
                <Stat
                  label="Pending"
                  value={stats.pending}
                  active={filter === "pending"}
                  onClick={() => setFilter("pending")}
                />
                <Stat
                  label="In progress"
                  value={stats.in_progress}
                  active={filter === "in_progress"}
                  onClick={() => setFilter("in_progress")}
                />
                <Stat
                  label="Resolved"
                  value={stats.resolved}
                  active={filter === "resolved"}
                  onClick={() => setFilter("resolved")}
                />
              </>
            )}
          </section>
          <section id="complaints" className="mt-8 scroll-mt-24">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold tracking-tight">Complaints</h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  Complaints reported in your municipality.
                </p>
              </div>
              <div className="flex w-full gap-2 sm:w-auto">
                <label className="relative flex-1 sm:w-72">
                  <Search className="pointer-events-none absolute left-3 top-3 size-4 text-slate-400" />
                  <span className="sr-only">Search complaints</span>
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search complaints"
                    className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-900"
                  />
                </label>
                <button
                  className="rounded-xl border border-slate-300 px-3 dark:border-slate-700"
                  onClick={() => {
                    setSearch("");
                    setFilter("all");
                  }}
                  aria-label="Clear filters"
                >
                  <ListFilter className="size-5" />
                </button>
              </div>
            </div>
            {error ? (
              <ErrorState onRetry={loadData} />
            ) : loading ? (
              <div className="mt-4 grid gap-3">
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
              </div>
            ) : visibleComplaints.length ? (
              <div className="mt-4 grid gap-3">
                {visibleComplaints.map((complaint) => (
                  <OfficerComplaintRow
                    key={complaint.id}
                    complaint={complaint}
                    image={reportImageFor(images, complaint.id)}
                    municipality={municipalities.find(
                      (item) => item.id === complaint.municipality_id,
                    )}
                    ward={wards.find((item) => item.id === complaint.ward_id)}
                    onClick={() => setSelected(complaint)}
                  />
                ))}
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
                <CheckCircle2 className="mx-auto size-9 text-emerald-700" />
                <h3 className="mt-3 font-bold">
                  {complaints.length
                    ? "No matching complaints"
                    : "No complaints yet"}
                </h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  {complaints.length
                    ? "Try changing your search or filter."
                    : "New reports in your municipality will appear here."}
                </p>
              </div>
            )}
          </section>
        </div>
      </main>
      {selected && (
        <OfficerComplaintDetails
          complaint={selected}
          municipality={municipalities.find(
            (item) => item.id === selected.municipality_id,
          )}
          ward={wards.find((item) => item.id === selected.ward_id)}
          images={images.filter((item) => item.complaint_id === selected.id)}
          history={history.filter((item) => item.complaint_id === selected.id)}
          onChange={handleChange}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}

function reportImageFor(images: ComplaintImage[], complaintId: string) {
  return images.find(
    (item) => item.complaint_id === complaintId && item.image_type === "report",
  );
}

function OfficerNavLink({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <a
      href={href}
      className="flex min-h-11 items-center justify-between rounded-xl px-3 text-slate-600 hover:bg-emerald-50 hover:text-emerald-800 dark:text-slate-300 dark:hover:bg-slate-800"
    >
      <span>{label}</span>
    </a>
  );
}

function Stat({
  label,
  value,
  active,
  onClick,
}: {
  label: string;
  value: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl border p-4 text-left transition ${active ? "border-emerald-600 bg-emerald-50 ring-2 ring-emerald-100 dark:bg-emerald-950/30" : "border-slate-200 bg-white hover:border-emerald-300 dark:border-slate-800 dark:bg-slate-900"}`}
    >
      <p className="text-sm text-slate-600 dark:text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </button>
  );
}

function OfficerComplaintRow({
  complaint,
  image,
  municipality,
  ward,
  onClick,
}: {
  complaint: Complaint;
  image?: ComplaintImage;
  municipality?: Municipality;
  ward?: Ward;
  onClick: () => void;
}) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!image) return;
    createClient()
      .storage.from("complaint-images")
      .createSignedUrl(image.storage_path, 3600)
      .then(({ data }) => setImageUrl(data?.signedUrl ?? null));
  }, [image]);
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick();
        }
      }}
      className="flex w-full cursor-pointer gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:border-emerald-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-xl bg-emerald-50 text-emerald-700">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Reported issue"
            className="size-full object-cover"
          />
        ) : (
          <MapPin className="size-6" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-bold">{complaint.title}</p>
          <StatusBadge status={complaint.status} />
        </div>
        <p className="mt-1 text-sm text-slate-600 line-clamp-1 dark:text-slate-400">
          {categoryLabels[complaint.category]} ·{" "}
          {complaint.address || "Location provided"}
        </p>
        {municipality && (
          <p className="mt-1 text-xs text-slate-500">
            {municipality.name}
            {ward
              ? ` · ${ward.ward_number ? `Ward ${ward.ward_number} — ` : ""}${ward.name}`
              : ""}
          </p>
        )}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs font-medium text-slate-500">
          <div className="flex gap-4">
            <span>{shortComplaintId(complaint.id)}</span>
            <span>{formatDate(complaint.reported_at)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function OfficerComplaintDetails({
  complaint,
  municipality,
  ward,
  images,
  history,
  onChange,
  onClose,
}: {
  complaint: Complaint;
  municipality?: Municipality;
  ward?: Ward;
  images: ComplaintImage[];
  history: StatusHistory[];
  onChange: (
    target: "acknowledged" | "scheduled" | "in_progress" | "closed",
    evidence?: File,
  ) => Promise<{ error?: string }>;
  onClose: () => void;
}) {
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<string | null>(null);
  const [evidence, setEvidence] = useState<
    "in_progress" | "closed" | null
  >(null);
  const [working, setWorking] = useState<ComplaintStatus | null>(null);
  useEffect(() => {
    Promise.all(
      images.map(async (image) => {
        const { data } = await createClient()
          .storage.from("complaint-images")
          .createSignedUrl(image.storage_path, 3600);
        return [image.id, data?.signedUrl] as const;
      }),
    ).then((results) =>
      setUrls(
        Object.fromEntries(
          results.filter((item): item is [string, string] => Boolean(item[1])),
        ),
      ),
    );
  }, [images]);
  const orderedStatuses: ComplaintStatus[] = [
    "reported",
    "acknowledged",
    "scheduled",
    "in_progress",
    "closed",
  ];
  const reached = new Set<ComplaintStatus>([
    "reported",
    complaint.status,
    ...history.map((item) => item.status),
  ]);
  const path =
    complaint.status === "rejected"
      ? (["reported", "rejected"] as ComplaintStatus[])
      : orderedStatuses.slice(
          0,
          Math.max(1, orderedStatuses.indexOf(complaint.status) + 1),
        );

  async function runChange(
    target: "acknowledged" | "scheduled" | "in_progress" | "closed",
  ) {
    if (target === "in_progress" || target === "closed") {
      setEvidence(target);
      return;
    }
    setWorking(target);
    setFeedback(null);
    const result = await onChange(target);
    setWorking(null);
    if (result.error) setFeedback(result.error);
  }
  async function submitEvidence(file: File) {
    if (!evidence) return { error: undefined as string | undefined };
    setWorking(evidence);
    setFeedback(null);
    const result = await onChange(evidence, file);
    setWorking(null);
    return result;
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="officer-details-title"
    >
      <section className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-7 dark:bg-slate-900">
        <div className="flex justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-emerald-700">
              {shortComplaintId(complaint.id)}
            </p>
            <h2 id="officer-details-title" className="mt-1 text-xl font-bold">
              {complaint.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Close complaint details"
          >
            <X />
          </button>
        </div>
        <div className="mt-4">
          <StatusBadge status={complaint.status} />
        </div>
        <dl className="mt-6 grid gap-4 rounded-xl bg-slate-50 p-4 text-sm sm:grid-cols-2 dark:bg-slate-800/60">
          <div>
            <dt className="text-slate-500">Category</dt>
            <dd className="mt-1 font-semibold">
              {categoryLabels[complaint.category]}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Submitted</dt>
            <dd className="mt-1 font-semibold">
              {formatDate(complaint.reported_at)}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Municipality</dt>
            <dd className="mt-1 font-semibold">
              {municipality?.name || "Not specified"}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Ward</dt>
            <dd className="mt-1 font-semibold">
              {ward
                ? `${ward.ward_number ? `Ward ${ward.ward_number} — ` : ""}${ward.name}`
                : "Not specified"}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-slate-500">Location</dt>
            <dd className="mt-1 font-semibold">
              {complaint.address || "Coordinates provided with report"}
            </dd>
          </div>
        </dl>
        <div className="mt-6">
          <h3 className="font-bold">Description</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
            {complaint.description || "No additional details were provided."}
          </p>
        </div>
        <div className="mt-6">
          <h3 className="font-bold">Progress</h3>
          <ol className="mt-4 space-y-3">
            {path.map((status, index) => (
              <li key={status} className="flex gap-3">
                <span
                  className={`grid size-6 shrink-0 place-items-center rounded-full text-xs font-bold ${reached.has(status) ? "bg-emerald-700 text-white" : "bg-slate-200 text-slate-600 dark:bg-slate-700"}`}
                >
                  {index + 1}
                </span>
                <div>
                  <p className="text-sm font-semibold">
                    {statusLabels[status]}
                  </p>
                  {history.find((item) => item.status === status)?.note && (
                    <p className="text-xs text-slate-500">
                      {history.find((item) => item.status === status)?.note}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
        {images.length ? (
          <div className="mt-6">
            <h3 className="font-bold">Photos</h3>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {images.map((image) => (
                <div key={image.id}>
                  <img
                    src={urls[image.id]}
                    alt={`${image.image_type} evidence`}
                    className="aspect-square w-full rounded-xl bg-slate-100 object-cover dark:bg-slate-800"
                  />
                  <p className="mt-1 text-xs capitalize text-slate-500">
                    {image.image_type}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : null}
        <div className="mt-7">
          <h3 className="font-bold">Update status</h3>
          {feedback && (
            <p
              role="alert"
              className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-100"
            >
              {feedback}
            </p>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            {(Object.keys(officerStatusAction) as Array<
              keyof typeof officerStatusAction
            >).map((target) => {
              const action = officerStatusAction[target];
              const needsEvidence =
                target === "in_progress" || target === "closed";
              const disabled =
                !officerCanSet(complaint.status, target) || working !== null;
              return (
                <button
                  key={target}
                  disabled={disabled}
                  onClick={() => runChange(target)}
                  className={`inline-flex min-h-10 items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-40 ${
                    disabled
                      ? "border border-slate-200 text-slate-400 dark:border-slate-800"
                      : "bg-emerald-700 text-white hover:bg-emerald-800"
                  }`}
                >
                  {working === target ? (
                    <LoaderCircle className="size-4 animate-spin" />
                  ) : needsEvidence ? (
                    <Camera className="size-4" />
                  ) : null}
                  {action.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>
      {evidence && (
        <EvidenceDialog
          complaint={complaint}
          target={evidence}
          submitting={working === evidence}
          onCancel={() => setEvidence(null)}
          onSubmit={submitEvidence}
        />
      )}
    </div>
  );
}

function EvidenceDialog({
  complaint,
  target,
  submitting,
  onCancel,
  onSubmit,
}: {
  complaint: Complaint;
  target: "in_progress" | "closed";
  submitting: boolean;
  onCancel: () => void;
  onSubmit: (
    file: File,
  ) => Promise<{ error?: string }>;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  function chooseFile(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] || null;
    const supported = ["image/jpeg", "image/png", "image/webp"];
    if (selected && !supported.includes(selected.type)) {
      setFeedback("Please upload a JPG, PNG, or WebP image.");
      event.target.value = "";
      return;
    }
    if (selected && selected.size > 5 * 1024 * 1024) {
      setFeedback("Image size must be less than 5 MB.");
      event.target.value = "";
      return;
    }
    if (preview) URL.revokeObjectURL(preview);
    setFeedback(null);
    setFile(selected);
    setPreview(selected ? URL.createObjectURL(selected) : null);
  }
  function removeFile() {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
    if (fileInput.current) fileInput.current.value = "";
  }
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) {
      setFeedback("Please attach a cleanup photo before continuing.");
      return;
    }
    setFeedback(null);
    const result = await onSubmit(file);
    if (result.error) {
      setFeedback(result.error);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] grid place-items-center bg-slate-950/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="evidence-title"
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl sm:p-7 dark:bg-slate-900"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-emerald-700">
              {shortComplaintId(complaint.id)}
            </p>
            <h2 id="evidence-title" className="mt-1 text-xl font-bold">
              {target === "closed"
                ? "Add cleanup evidence"
                : "Add work-in-progress photo"}
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Attach a photo showing the state of the complaint to continue.
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Cancel"
          >
            <X />
          </button>
        </div>
        {feedback && (
          <p
            role="alert"
            className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100"
          >
            {feedback}
          </p>
        )}
        <div className="mt-5">
          <input
            ref={fileInput}
            id="officer-evidence"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={chooseFile}
            className="sr-only"
          />
          {preview ? (
            <div className="flex items-center gap-4 rounded-xl border border-slate-200 p-3 dark:border-slate-700">
              <img
                src={preview}
                alt="Selected evidence preview"
                className="size-20 rounded-lg object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{file?.name}</p>
                <p className="mt-1 text-xs text-slate-500">Ready to upload</p>
              </div>
              <button
                type="button"
                onClick={removeFile}
                className="rounded-lg p-2 text-red-700 hover:bg-red-50"
                aria-label="Remove selected photo"
              >
                <X className="size-5" />
              </button>
            </div>
          ) : (
            <label
              htmlFor="officer-evidence"
              className="flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-emerald-300 bg-emerald-50/60 px-4 text-center text-sm text-emerald-900 hover:bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-100"
            >
              <FilePlus2 className="size-6" />
              <span className="mt-2 font-bold">Choose a cleanup photo</span>
              <span className="mt-1 text-xs">
                JPG, PNG, or WebP · up to 5 MB
              </span>
            </label>
          )}
        </div>
        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-bold dark:border-slate-700"
          >
            Cancel
          </button>
          <button
            disabled={submitting}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white disabled:opacity-60"
          >
            {submitting ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
            {submitting
              ? "Uploading…"
              : target === "closed"
                ? "Resolve complaint"
                : "Mark in progress"}
          </button>
        </div>
      </form>
    </div>
  );
}

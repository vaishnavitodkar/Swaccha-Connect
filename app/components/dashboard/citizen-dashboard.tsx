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
  ArrowUp,
  Bell,
  CheckCircle2,
  CircleAlert,
  Clock3,
  FilePlus2,
  ListFilter,
  LoaderCircle,
  LocateFixed,
  MapPin,
  Menu,
  Search,
  Send,
  X,
} from "lucide-react";
import { SignOutButton } from "@/app/components/auth/sign-out-button";
import { createClient } from "@/lib/supabase/client";
import {
  Complaint,
  ComplaintCategory,
  ComplaintImage,
  ComplaintStatus,
  Municipality,
  Notification,
  StatusHistory,
  Ward,
  categoryLabels,
  complaintCategories,
  formatDate,
  formatRelativeDate,
  pendingStatuses,
  resolvedStatuses,
  shortComplaintId,
  statusLabels,
} from "@/lib/dashboard/types";
import {
  fetchMyVotes,
  fetchVoteCounts,
  toggleVote,
  upvoteForDuplicate,
} from "@/lib/dashboard/votes";

type Profile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
};
type Filter = "all" | "pending" | "in_progress" | "resolved" | "rejected";

const statusStyles: Record<ComplaintStatus, string> = {
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

function StatusBadge({ status }: { status: ComplaintStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[status]}`}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {statusLabels[status]}
    </span>
  );
}
function DuplicateBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-800 dark:bg-orange-950/40 dark:text-orange-200">
      <span className="size-1.5 rounded-full bg-current" />
      Duplicate
    </span>
  );
}
function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800 ${className}`}
    />
  );
}

export function CitizenDashboard({ profile }: { profile: Profile }) {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [nearby, setNearby] = useState<Complaint[]>([]);
  const [images, setImages] = useState<ComplaintImage[]>([]);
  const [history, setHistory] = useState<StatusHistory[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [myVotes, setMyVotes] = useState<Set<string>>(new Set());
  const [voteCounts, setVoteCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [selected, setSelected] = useState<Complaint | null>(null);
  const supabase = useMemo(() => createClient(), []);
  const complaintIdsRef = useRef<string[]>([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data: complaintRows, error: complaintError } = await supabase
      .from("complaints")
      .select(
        "id,citizen_id,municipality_id,ward_id,category,title,description,address,latitude,longitude,status,is_duplicate,duplicate_of,vote_count,reported_at,created_at,acknowledged_at,assigned_at,scheduled_at,started_at,completed_at,closed_at",
      )
      .eq("citizen_id", profile.id)
      .order("reported_at", { ascending: false });
    if (complaintError) {
      setError("We couldn’t load your complaints. Please try again.");
      setLoading(false);
      return;
    }
    const { data: nearbyRows } = await supabase
      .from("complaints")
      .select(
        "id,citizen_id,municipality_id,ward_id,category,title,description,address,latitude,longitude,status,is_duplicate,duplicate_of,vote_count,reported_at,created_at,acknowledged_at,assigned_at,scheduled_at,started_at,completed_at,closed_at",
      )
      .neq("citizen_id", profile.id)
      .neq("status", "rejected")
      .order("vote_count", { ascending: false })
      .order("reported_at", { ascending: false })
      .limit(10);
    const complaintIds = (complaintRows ?? []).map((item) => item.id);
    const allIds = [
      ...complaintIds,
      ...(nearbyRows ?? []).map((item) => item.id),
    ];
    complaintIdsRef.current = allIds;
    const [
      imageResult,
      historyResult,
      notificationResult,
      municipalityResult,
      wardResult,
      votesResult,
      myVotesResult,
    ] = await Promise.all([
      complaintIds.length
        ? supabase
            .from("complaint_images")
            .select("id,complaint_id,storage_path,image_type,created_at")
            .in("complaint_id", complaintIds)
            .order("created_at", { ascending: true })
        : Promise.resolve({ data: [], error: null }),
      complaintIds.length
        ? supabase
            .from("complaint_status_history")
            .select("id,complaint_id,status,note,created_at")
            .in("complaint_id", complaintIds)
            .order("created_at", { ascending: true })
        : Promise.resolve({ data: [], error: null }),
      supabase
        .from("notifications")
        .select("id,title,message,complaint_id,is_read,created_at")
        .order("created_at", { ascending: false })
        .limit(12),
      supabase
        .from("municipalities")
        .select("id,name,state,district")
        .order("name"),
      supabase
        .from("wards")
        .select("id,municipality_id,name,ward_number")
        .order("ward_number"),
      fetchVoteCounts(supabase, allIds),
      fetchMyVotes(supabase, profile.id, allIds),
    ]);
    setComplaints((complaintRows ?? []) as Complaint[]);
    setNearby((nearbyRows ?? []) as Complaint[]);
    setImages((imageResult.data ?? []) as ComplaintImage[]);
    setHistory((historyResult.data ?? []) as StatusHistory[]);
    setNotifications((notificationResult.data ?? []) as Notification[]);
    setMunicipalities((municipalityResult.data ?? []) as Municipality[]);
    setWards((wardResult.data ?? []) as Ward[]);
    setVoteCounts(votesResult);
    setMyVotes(myVotesResult);
    setLoading(false);
  }, [profile.id, supabase]);

  const refreshVotes = useCallback(async () => {
    const allIds = complaintIdsRef.current;
    const [counts, mine] = await Promise.all([
      fetchVoteCounts(supabase, allIds),
      fetchMyVotes(supabase, profile.id, allIds),
    ]);
    setVoteCounts(counts);
    setMyVotes(mine);
  }, [supabase, profile.id]);

  useEffect(() => {
    const initialLoad = window.setTimeout(loadData, 0);
    const channel = supabase
      .channel(`citizen-dashboard-${profile.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "complaints",
          filter: `citizen_id=eq.${profile.id}`,
        },
        loadData,
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${profile.id}`,
        },
        loadData,
      )
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "complaint_votes",
      }, refreshVotes)
      .subscribe();
    return () => {
      window.clearTimeout(initialLoad);
      supabase.removeChannel(channel);
    };
  }, [loadData, refreshVotes, profile.id, supabase]);

  const stats = {
    all: complaints.length,
    pending: complaints.filter((item) => pendingStatuses.includes(item.status))
      .length,
    in_progress: complaints.filter((item) => item.status === "in_progress")
      .length,
    resolved: complaints.filter((item) =>
      resolvedStatuses.includes(item.status),
    ).length,
    rejected: complaints.filter((item) => item.status === "rejected").length,
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
  const unread = notifications.filter((item) => !item.is_read).length;
  const initial = profile.full_name?.trim().slice(0, 1).toUpperCase() || "C";

  async function openNotification(notification: Notification) {
    if (!notification.is_read) {
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notification.id);
      setNotifications((current) =>
        current.map((item) =>
          item.id === notification.id ? { ...item, is_read: true } : item,
        ),
      );
    }
    if (notification.complaint_id)
      setSelected(
        complaints.find((item) => item.id === notification.complaint_id) ??
          null,
      );
    setNoticeOpen(false);
  }
  const imageFor = (complaintId: string) =>
    images.find(
      (item) =>
        item.complaint_id === complaintId && item.image_type === "report",
    );
  const voteCountFor = (complaintId: string) => voteCounts[complaintId] ?? 0;
  async function handleToggleVote(complaintId: string) {
    const voted = myVotes.has(complaintId);
    const prevCount = voteCountFor(complaintId);
    setMyVotes((current) => {
      const next = new Set(current);
      if (voted) next.delete(complaintId);
      else next.add(complaintId);
      return next;
    });
    setVoteCounts((current) => ({
      ...current,
      [complaintId]: prevCount + (voted ? -1 : 1),
    }));
    try {
      await toggleVote(supabase, {
        complaintId,
        userId: profile.id,
      });
    } catch {
      setMyVotes((current) => {
        const next = new Set(current);
        if (voted) next.add(complaintId);
        else next.delete(complaintId);
        return next;
      });
      setVoteCounts((current) => ({
        ...current,
        [complaintId]: prevCount,
      }));
    }
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
          <NavLink href="#overview" label="Dashboard" />
          <NavLink
            href="#report"
            label="Report a problem"
            onClick={() => setReportOpen(true)}
          />
          <NavLink href="#complaints" label="My complaints" />
          <NavLink href="#nearby" label="Nearby complaints" />
          <NavLink
            href="#notifications"
            label="Notifications"
            onClick={() => setNoticeOpen(true)}
            badge={unread}
          />
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
                Citizen workspace
              </p>
              <h1 className="font-bold">Your dashboard</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                className="relative rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-900"
                onClick={() => setNoticeOpen((value) => !value)}
                aria-label={`Notifications, ${unread} unread`}
                aria-expanded={noticeOpen}
              >
                <Bell className="size-5" />
                {unread > 0 && (
                  <span className="absolute right-1 top-1 size-2 rounded-full bg-rose-600 ring-2 ring-white dark:ring-slate-900" />
                )}
              </button>
              {noticeOpen && (
                <NotificationMenu
                  notifications={notifications}
                  onSelect={openNotification}
                />
              )}
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
                {profile.full_name || "Citizen"}
              </span>
            </Link>
          </div>
        </header>
        <div className="mx-auto max-w-7xl p-4 sm:p-7">
          <section
            id="overview"
            className="rounded-2xl bg-emerald-800 px-6 py-7 text-white sm:px-8"
          >
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
              <div>
                <p className="text-sm text-emerald-100">
                  Hello, {profile.full_name?.split(" ")[0] || "neighbour"}
                </p>
                <h2 className="mt-1 text-2xl font-bold tracking-tight">
                  Help keep your neighbourhood clean.
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-emerald-100">
                  Report a sanitation issue or check on the progress of your
                  existing reports.
                </p>
              </div>
              <button
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-emerald-900 hover:bg-emerald-50"
                onClick={() => setReportOpen(true)}
              >
                <FilePlus2 className="size-5" />
                Report a problem
              </button>
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
          <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {loading ? (
              Array.from({ length: 5 }, (_, index) => (
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
                <Stat
                  label="Rejected"
                  value={stats.rejected}
                  active={filter === "rejected"}
                  onClick={() => setFilter("rejected")}
                />
              </>
            )}
          </section>
          <section id="complaints" className="mt-8 scroll-mt-24">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold tracking-tight">
                  My complaints
                </h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  Track every issue you have reported.
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
                  <ComplaintCard
                    key={complaint.id}
                    complaint={complaint}
                    image={imageFor(complaint.id)}
                    municipality={municipalities.find(
                      (item) => item.id === complaint.municipality_id,
                    )}
                    ward={wards.find((item) => item.id === complaint.ward_id)}
                    voteCount={voteCountFor(complaint.id)}
                    hasVoted={myVotes.has(complaint.id)}
                    onToggleVote={() => handleToggleVote(complaint.id)}
                    onClick={() => setSelected(complaint)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                filtered={complaints.length > 0}
                onReport={() => setReportOpen(true)}
              />
            )}
          </section>
          <section className="mt-8 grid gap-6 xl:grid-cols-[1.45fr_1fr]">
            <RecentActivity
              complaints={complaints}
              history={history}
              loading={loading}
            />
            <NearbyComplaints
              complaints={nearby}
              municipalities={municipalities}
              wards={wards}
              images={images}
              voteCounts={voteCounts}
              myVotes={myVotes}
              onToggleVote={(complaintId) => handleToggleVote(complaintId)}
              onSelect={(complaint) => setSelected(complaint)}
            />
          </section>
        </div>
      </main>
      {selected && (
        <ComplaintDetails
          complaint={selected}
          municipality={municipalities.find(
            (item) => item.id === selected.municipality_id,
          )}
          ward={wards.find((item) => item.id === selected.ward_id)}
          images={images.filter((item) => item.complaint_id === selected.id)}
          history={history.filter((item) => item.complaint_id === selected.id)}
          voteCount={voteCountFor(selected.id)}
          hasVoted={myVotes.has(selected.id)}
          onToggleVote={() => handleToggleVote(selected.id)}
          onClose={() => setSelected(null)}
        />
      )}
      {reportOpen && (
        <ReportDialog
          profileId={profile.id}
          municipalities={municipalities}
          wards={wards}
          onClose={() => setReportOpen(false)}
          onComplete={() => {
            setReportOpen(false);
            setSuccessMessage(
              "Your report has been submitted. We’ll update you as it progresses.",
            );
            loadData();
          }}
        />
      )}
    </div>
  );
}

function NavLink({
  href,
  label,
  onClick,
  badge,
}: {
  href: string;
  label: string;
  onClick?: () => void;
  badge?: number;
}) {
  return (
    <a
      href={href}
      onClick={onClick}
      className="flex min-h-11 items-center justify-between rounded-xl px-3 text-slate-600 hover:bg-emerald-50 hover:text-emerald-800 dark:text-slate-300 dark:hover:bg-slate-800"
    >
      <span>{label}</span>
      {badge ? (
        <span className="rounded-full bg-emerald-700 px-2 py-0.5 text-xs text-white">
          {badge}
        </span>
      ) : null}
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
function VoteButton({
  count,
  hasVoted,
  onToggle,
  size = "md",
}: {
  count: number;
  hasVoted: boolean;
  onToggle: () => void;
  size?: "sm" | "md";
}) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onToggle();
      }}
      aria-pressed={hasVoted}
      className={`inline-flex items-center gap-1.5 rounded-full border font-semibold transition ${
        size === "sm" ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-sm"
      } ${
        hasVoted
          ? "border-emerald-600 bg-emerald-600 text-white"
          : "border-slate-300 bg-white text-slate-600 hover:border-emerald-400 hover:text-emerald-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-emerald-400"
      }`}
    >
      <ArrowUp className={size === "sm" ? "size-3.5" : "size-4"} />
      {count}
    </button>
  );
}
function ComplaintCard({
  complaint,
  image,
  municipality,
  ward,
  voteCount,
  hasVoted,
  onToggleVote,
  onClick,
}: {
  complaint: Complaint;
  image?: ComplaintImage;
  municipality?: Municipality;
  ward?: Ward;
  voteCount: number;
  hasVoted: boolean;
  onToggleVote: () => void;
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
          <div className="flex items-center gap-2">
            {complaint.is_duplicate && <DuplicateBadge />}
            <StatusBadge status={complaint.status} />
          </div>
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
          <VoteButton
            count={voteCount}
            hasVoted={hasVoted}
            onToggle={onToggleVote}
          />
        </div>
      </div>
    </div>
  );
}
function NearbyComplaints({
  complaints,
  municipalities,
  wards,
  images,
  voteCounts,
  myVotes,
  onToggleVote,
  onSelect,
}: {
  complaints: Complaint[];
  municipalities: Municipality[];
  wards: Ward[];
  images: ComplaintImage[];
  voteCounts: Record<string, number>;
  myVotes: Set<string>;
  onToggleVote: (complaintId: string) => void;
  onSelect: (complaint: Complaint) => void;
}) {
  const reportImageFor = (complaintId: string) =>
    images.find(
      (item) =>
        item.complaint_id === complaintId && item.image_type === "report",
    );
  return (
    <section
      id="nearby"
      className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <MapPin className="size-7 text-emerald-700" />
          <h2 className="mt-4 text-lg font-bold">Nearby complaints</h2>
        </div>
        <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
          Community support
        </span>
      </div>
      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
        Approximate public issue locations shared by your neighbours. Support
        the ones that affect you too.
      </p>
      <div className="mt-5 space-y-3">
        {complaints.length ? (
          complaints.map((complaint) => (
            <NearbyComplaintRow
              key={complaint.id}
              complaint={complaint}
              image={reportImageFor(complaint.id)}
              municipality={municipalities.find(
                (item) => item.id === complaint.municipality_id,
              )}
              ward={wards.find((item) => item.id === complaint.ward_id)}
              voteCount={voteCounts[complaint.id] ?? 0}
              hasVoted={myVotes.has(complaint.id)}
              onToggleVote={() => onToggleVote(complaint.id)}
              onSelect={() => onSelect(complaint)}
            />
          ))
        ) : (
          <p className="rounded-xl border border-dashed border-slate-300 p-5 text-center text-sm text-slate-500 dark:border-slate-700">
            No nearby complaints to show yet. Check back soon.
          </p>
        )}
      </div>
    </section>
  );
}
function NearbyComplaintRow({
  complaint,
  image,
  municipality,
  ward,
  voteCount,
  hasVoted,
  onToggleVote,
  onSelect,
}: {
  complaint: Complaint;
  image?: ComplaintImage;
  municipality?: Municipality;
  ward?: Ward;
  voteCount: number;
  hasVoted: boolean;
  onToggleVote: () => void;
  onSelect: () => void;
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
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
      className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-3 text-left transition hover:border-emerald-300 dark:border-slate-800"
    >
      <div className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-lg bg-emerald-50 text-emerald-700">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Reported issue"
            className="size-full object-cover"
          />
        ) : (
          <MapPin className="size-5" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold">{complaint.title}</p>
        <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">
          {categoryLabels[complaint.category]}
          {municipality ? ` · ${municipality.name}` : ""}
          {ward ? ` · ${ward.name}` : ""}
        </p>
      </div>
      <VoteButton
        count={voteCount}
        hasVoted={hasVoted}
        onToggle={onToggleVote}
        size="sm"
      />
    </div>
  );
}
function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-900 dark:bg-red-950/30">
      <CircleAlert className="mx-auto size-7 text-red-700" />
      <p className="mt-2 font-bold">We couldn’t load your dashboard</p>
      <button
        onClick={onRetry}
        className="mt-4 rounded-xl bg-red-700 px-4 py-2 text-sm font-bold text-white"
      >
        Try again
      </button>
    </div>
  );
}
function EmptyState({
  filtered,
  onReport,
}: {
  filtered: boolean;
  onReport: () => void;
}) {
  return (
    <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
      <CheckCircle2 className="mx-auto size-9 text-emerald-700" />
      <h3 className="mt-3 font-bold">
        {filtered ? "No matching complaints" : "No complaints yet"}
      </h3>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
        {filtered
          ? "Try changing your search or filter."
          : "Report your first sanitation issue to start tracking it here."}
      </p>
      {!filtered && (
        <button
          onClick={onReport}
          className="mt-5 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white"
        >
          Report your first problem
        </button>
      )}
    </div>
  );
}
function NotificationMenu({
  notifications,
  onSelect,
}: {
  notifications: Notification[];
  onSelect: (notification: Notification) => void;
}) {
  return (
    <div
      id="notifications"
      className="absolute right-0 top-12 w-80 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-slate-900"
    >
      <p className="px-3 py-2 text-sm font-bold">Notifications</p>
      {notifications.length ? (
        notifications.slice(0, 6).map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item)}
            className={`w-full rounded-xl p-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800 ${item.is_read ? "" : "bg-emerald-50 dark:bg-emerald-950/30"}`}
          >
            <p className="text-sm font-semibold">{item.title}</p>
            <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-400">
              {item.message}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {formatRelativeDate(item.created_at)}
            </p>
          </button>
        ))
      ) : (
        <p className="px-3 py-6 text-center text-sm text-slate-500">
          You’re all caught up!
        </p>
      )}
    </div>
  );
}

function RecentActivity({
  complaints,
  history,
  loading,
}: {
  complaints: Complaint[];
  history: StatusHistory[];
  loading: boolean;
}) {
  const activities = [
    ...complaints.map((item) => ({
      id: `report-${item.id}`,
      label: `You reported ${shortComplaintId(item.id)}`,
      detail: item.title,
      date: item.reported_at,
    })),
    ...history.map((item) => ({
      id: item.id,
      label: `Complaint status changed to ${statusLabels[item.status]}`,
      detail: item.note || shortComplaintId(item.complaint_id),
      date: item.created_at,
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-lg font-bold">Recent activity</h2>
      {loading ? (
        <div className="mt-5 space-y-3">
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
        </div>
      ) : activities.length ? (
        <ol className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
          {activities.map((activity) => (
            <li key={activity.id} className="flex gap-3 py-3">
              <Clock3 className="mt-0.5 size-4 shrink-0 text-emerald-700" />
              <div>
                <p className="text-sm font-semibold">{activity.label}</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {activity.detail} · {formatRelativeDate(activity.date)}
                </p>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
          Your updates will appear here once you report a problem.
        </p>
      )}
    </section>
  );
}

function ComplaintDetails({
  complaint,
  municipality,
  ward,
  images,
  history,
  voteCount,
  hasVoted,
  onToggleVote,
  onClose,
}: {
  complaint: Complaint;
  municipality?: Municipality;
  ward?: Ward;
  images: ComplaintImage[];
  history: StatusHistory[];
  voteCount: number;
  hasVoted: boolean;
  onToggleVote: () => void;
  onClose: () => void;
}) {
  const [urls, setUrls] = useState<Record<string, string>>({});
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
    "assigned",
    "scheduled",
    "in_progress",
    "completed",
    "citizen_verification",
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
      : complaint.status === "reopened"
        ? ([
            "reported",
            "acknowledged",
            "assigned",
            "reopened",
          ] as ComplaintStatus[])
        : orderedStatuses.slice(
            0,
            Math.max(1, orderedStatuses.indexOf(complaint.status) + 1),
          );
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="complaint-details-title"
    >
      <section className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-7 dark:bg-slate-900">
        <div className="flex justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-emerald-700">
              {shortComplaintId(complaint.id)}
            </p>
            <h2 id="complaint-details-title" className="mt-1 text-xl font-bold">
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
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {complaint.is_duplicate && <DuplicateBadge />}
          <StatusBadge status={complaint.status} />
          <VoteButton
            count={voteCount}
            hasVoted={hasVoted}
            onToggle={onToggleVote}
          />
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
      </section>
    </div>
  );
}

function ReportDialog({
  profileId,
  municipalities,
  wards,
  onClose,
  onComplete,
}: {
  profileId: string;
  municipalities: Municipality[];
  wards: Ward[];
  onClose: () => void;
  onComplete: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [locating, setLocating] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [coordinates, setCoordinates] = useState({
    latitude: "",
    longitude: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [complaintId, setComplaintId] = useState<string | null>(null);
  const [uploadedPath, setUploadedPath] = useState<string | null>(null);
  const [municipalityQuery, setMunicipalityQuery] = useState("");
  const [municipalityId, setMunicipalityId] = useState("");
  const [wardQuery, setWardQuery] = useState("");
  const [wardId, setWardId] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  const relevantWards = wards.filter(
    (ward) => ward.municipality_id === municipalityId,
  );
  function locate() {
    if (!navigator.geolocation) {
      setFeedback(
        "Location is not supported in this browser. Enter coordinates manually.",
      );
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates({
          latitude: String(position.coords.latitude),
          longitude: String(position.coords.longitude),
        });
        setLocating(false);
      },
      () => {
        setFeedback(
          "We couldn’t access your location. You can enter coordinates manually.",
        );
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  }
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
    setUploadedPath(null);
    setFile(selected);
    setPreview(selected ? URL.createObjectURL(selected) : null);
  }
  function removeFile() {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
    setUploadedPath(null);
    if (fileInput.current) fileInput.current.value = "";
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);
    const form = new FormData(event.currentTarget);
    const latitude = Number(coordinates.latitude);
    const longitude = Number(coordinates.longitude);
    const category = form.get("category") as ComplaintCategory;
    const selectedWard = relevantWards.find((ward) => ward.id === wardId);
    if (!municipalityId || !selectedWard) {
      setFeedback("Select a municipality and ward from the suggestions.");
      return;
    }
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      setFeedback(
        "Add your current location or enter valid latitude and longitude.",
      );
      return;
    }
    setSubmitting(true);
    const supabase = createClient();
    let id = complaintId;
    if (!id) {
      const { data: duplicateId, error: duplicateError } = await supabase.rpc(
        "find_duplicate_complaint",
        { p_latitude: latitude, p_longitude: longitude },
      );
      if (duplicateError) {
        setFeedback("We couldn’t check for nearby reports. Please try again.");
        setSubmitting(false);
        return;
      }
      const { data: complaint, error } = await supabase
        .from("complaints")
        .insert({
          citizen_id: profileId,
          municipality_id: municipalityId,
          ward_id: wardId,
          category,
          title: String(form.get("title")).trim(),
          description: String(form.get("description")).trim() || null,
          address: String(form.get("address")).trim(),
          latitude,
          longitude,
          is_duplicate: Boolean(duplicateId),
          duplicate_of: duplicateId || null,
        })
        .select("id")
        .single();
      if (error || !complaint) {
        setFeedback(
          error?.message || "We couldn’t submit your report. Please try again.",
        );
        setSubmitting(false);
        return;
      }
      id = complaint.id;
      setComplaintId(id);
      if (duplicateId) {
        await upvoteForDuplicate(supabase, {
          parentId: duplicateId,
          userId: profileId,
        });
      }
    }
    if (file) {
      let path = uploadedPath;
      if (!path) {
        const extension =
          file.name
            .split(".")
            .pop()
            ?.replace(/[^a-zA-Z0-9]/g, "") || "jpg";
        path = `${id}/report/${crypto.randomUUID()}.${extension}`;
        const upload = await supabase.storage
          .from("complaint-images")
          .upload(path, file, { contentType: file.type, upsert: false });
        if (upload.error) {
          setFeedback(
            `Your report was recorded, but the photo upload failed: ${upload.error.message} Choose a photo and retry.`,
          );
          setSubmitting(false);
          return;
        }
        setUploadedPath(path);
      }
      const metadata = await supabase
        .from("complaint_images")
        .insert({
          complaint_id: id,
          uploaded_by: profileId,
          image_type: "report",
          storage_path: path,
        });
      if (metadata.error) {
        setFeedback(
          `Your report was recorded, but we could not save the photo details: ${metadata.error.message} Retry to finish attaching it.`,
        );
        setSubmitting(false);
        return;
      }
    }
    setSubmitting(false);
    onComplete();
  }
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-title"
    >
      <form
        onSubmit={submit}
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-7 dark:bg-slate-900"
      >
        <div className="flex justify-between gap-4">
          <div>
            <h2 id="report-title" className="text-xl font-bold">
              Report a problem
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Tell us what needs attention. Fields marked required are needed to
              submit.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Close report form"
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
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <Field label="Municipality">
            <input
              list="municipality-options"
              value={municipalityQuery}
              onChange={(event) => {
                const value = event.target.value;
                const match = municipalities.find(
                  (item) => municipalityLabel(item) === value,
                );
                setMunicipalityQuery(value);
                setMunicipalityId(match?.id || "");
                setWardQuery("");
                setWardId("");
              }}
              placeholder="Search municipality"
              className="field"
              required
            />
            <datalist id="municipality-options">
              {municipalities.map((item) => (
                <option key={item.id} value={municipalityLabel(item)} />
              ))}
            </datalist>
          </Field>
          <Field label="Ward">
            <input
              list="ward-options"
              value={wardQuery}
              disabled={!municipalityId}
              onChange={(event) => {
                const value = event.target.value;
                const match = relevantWards.find(
                  (item) => wardLabel(item) === value,
                );
                setWardQuery(value);
                setWardId(match?.id || "");
              }}
              placeholder={
                municipalityId ? "Search ward" : "Select a municipality first"
              }
              className="field disabled:cursor-not-allowed disabled:opacity-60"
              required
            />
            <datalist id="ward-options">
              {relevantWards.map((item) => (
                <option key={item.id} value={wardLabel(item)} />
              ))}
            </datalist>
          </Field>
          <Field label="Problem category">
            <select name="category" required className="field">
              <option value="">Choose a category</option>
              {complaintCategories.map((category) => (
                <option key={category} value={category}>
                  {categoryLabels[category]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Short title">
            <input
              name="title"
              required
              maxLength={120}
              placeholder="e.g. Overflowing bin near market"
              className="field"
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Describe the issue">
              <textarea
                name="description"
                rows={4}
                placeholder="Add useful details, such as how long the problem has been there."
                className="field resize-y"
              />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Address or landmark">
              <input
                name="address"
                required
                placeholder="e.g. Opposite Community Hall, Ward 4"
                className="field"
              />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold">
                Location <span className="text-red-700">*</span>
              </p>
              <button
                type="button"
                onClick={locate}
                disabled={locating}
                className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700 disabled:opacity-60"
              >
                <LocateFixed className="size-4" />
                {locating ? "Finding location…" : "Use current location"}
              </button>
            </div>
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              <input
                value={coordinates.latitude}
                onChange={(event) =>
                  setCoordinates({
                    ...coordinates,
                    latitude: event.target.value,
                  })
                }
                inputMode="decimal"
                placeholder="Latitude"
                aria-label="Latitude"
                className="field"
                required
              />
              <input
                value={coordinates.longitude}
                onChange={(event) =>
                  setCoordinates({
                    ...coordinates,
                    longitude: event.target.value,
                  })
                }
                inputMode="decimal"
                placeholder="Longitude"
                aria-label="Longitude"
                className="field"
                required
              />
            </div>
          </div>
          <div className="sm:col-span-2">
            <p className="text-sm font-semibold">
              Upload complaint photo{" "}
              <span className="font-normal text-slate-500">(optional)</span>
            </p>
            <input
              ref={fileInput}
              id="complaint-photo"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={chooseFile}
              className="sr-only"
            />
            {preview ? (
              <div className="mt-2 flex items-center gap-4 rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                <img
                  src={preview}
                  alt="Selected complaint preview"
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
                htmlFor="complaint-photo"
                className="mt-2 flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-emerald-300 bg-emerald-50/60 px-4 text-center text-sm text-emerald-900 hover:bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-100"
              >
                <FilePlus2 className="size-6" />
                <span className="mt-2 font-bold">
                  Take a photo or choose an image
                </span>
                <span className="mt-1 text-xs">
                  JPG, PNG, or WebP · up to 5 MB
                </span>
              </label>
            )}
          </div>
        </div>
        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
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
              ? file
                ? "Uploading photo…"
                : "Submitting…"
              : complaintId
                ? "Retry photo upload"
                : "Submit report"}
          </button>
        </div>
      </form>
    </div>
  );
}
function Field({
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

function municipalityLabel(municipality: Municipality) {
  return `${municipality.name}${municipality.district ? `, ${municipality.district}` : ""}, ${municipality.state}`;
}
function wardLabel(ward: Ward) {
  return `${ward.ward_number ? `Ward ${ward.ward_number} — ` : ""}${ward.name}`;
}

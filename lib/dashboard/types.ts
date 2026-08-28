export const complaintCategories = [
  "garbage_dump",
  "overflowing_bin",
  "illegal_dumping",
  "plastic_waste",
  "construction_waste",
  "dead_animal",
  "sewage",
  "public_toilet",
  "other",
] as const;

export const complaintStatuses = [
  "reported",
  "acknowledged",
  "assigned",
  "scheduled",
  "in_progress",
  "completed",
  "citizen_verification",
  "closed",
  "reopened",
  "rejected",
] as const;

export type ComplaintCategory = (typeof complaintCategories)[number];
export type ComplaintStatus = (typeof complaintStatuses)[number];

export type Complaint = {
  id: string;
  citizen_id: string;
  municipality_id: string | null;
  ward_id: string | null;
  category: ComplaintCategory;
  title: string;
  description: string | null;
  address: string | null;
  latitude: number;
  longitude: number;
  status: ComplaintStatus;
  reported_at: string;
  created_at: string;
  acknowledged_at: string | null;
  assigned_at: string | null;
  scheduled_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  closed_at: string | null;
  is_duplicate: boolean;
  duplicate_of: string | null;
  vote_count: number;
};

export type Municipality = { id: string; name: string; state: string; district: string | null };
export type Ward = { id: string; municipality_id: string; name: string; ward_number: string | null };

export type ComplaintImage = { id: string; complaint_id: string; storage_path: string; image_type: "report" | "before" | "after"; created_at: string };
export type StatusHistory = { id: string; complaint_id: string; status: ComplaintStatus; note: string | null; created_at: string };
export type Notification = { id: string; title: string; message: string; complaint_id: string | null; is_read: boolean; created_at: string };

export const categoryLabels: Record<ComplaintCategory, string> = {
  garbage_dump: "Garbage dump", overflowing_bin: "Overflowing bin", illegal_dumping: "Illegal dumping",
  plastic_waste: "Plastic waste", construction_waste: "Construction waste", dead_animal: "Dead animal",
  sewage: "Sewage issue", public_toilet: "Public toilet", other: "Other sanitation issue",
};

export const statusLabels: Record<ComplaintStatus, string> = {
  reported: "Reported", acknowledged: "Acknowledged", assigned: "Assigned", scheduled: "Scheduled",
  in_progress: "In progress", completed: "Completed", citizen_verification: "Awaiting your verification",
  closed: "Closed", reopened: "Reopened", rejected: "Rejected",
};

export const pendingStatuses: ComplaintStatus[] = ["reported", "acknowledged", "assigned", "scheduled", "reopened"];
export const resolvedStatuses: ComplaintStatus[] = ["completed", "citizen_verification", "closed"];

export function shortComplaintId(id: string) { return `#${id.slice(0, 8).toUpperCase()}`; }
export function formatDate(value: string) { return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value)); }
export function formatRelativeDate(value: string) {
  const difference = Date.now() - new Date(value).getTime();
  const hours = Math.floor(difference / 3_600_000);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return days === 1 ? "Yesterday" : `${days}d ago`;
}

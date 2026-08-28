import type { SupabaseClient } from "@supabase/supabase-js";
import type { Complaint, ComplaintStatus } from "@/lib/dashboard/types";

type OfficerStatusActionTimestamp =
  | "acknowledged_at"
  | "scheduled_at"
  | "started_at"
  | "closed_at";

export type OfficerStatus =
  | "acknowledged"
  | "scheduled"
  | "in_progress"
  | "closed";

export const officerStatusAction: Record<
  OfficerStatus,
  { label: string; timestamp: OfficerStatusActionTimestamp }
> = {
  acknowledged: { label: "Acknowledge", timestamp: "acknowledged_at" },
  scheduled: { label: "Schedule", timestamp: "scheduled_at" },
  in_progress: { label: "Mark in progress", timestamp: "started_at" },
  closed: { label: "Mark closed", timestamp: "closed_at" },
};

export function officerCanSet(
  current: ComplaintStatus,
  target: OfficerStatus,
): boolean {
  if (current === "closed" || current === "rejected") return false;
  if (current === target) return false;
  return true;
}

export const complaintSelect = [
  "id",
  "citizen_id",
  "municipality_id",
  "ward_id",
  "category",
  "title",
  "description",
  "address",
  "latitude",
  "longitude",
  "status",
  "is_duplicate",
  "duplicate_of",
  "vote_count",
  "reported_at",
  "created_at",
  "acknowledged_at",
  "assigned_at",
  "scheduled_at",
  "started_at",
  "completed_at",
  "closed_at",
].join(",");

export async function fetchMunicipalityComplaints(
  supabase: SupabaseClient,
  municipalityId: string,
): Promise<Complaint[]> {
  const { data } = await supabase
    .from("complaints")
    .select(complaintSelect)
    .eq("municipality_id", municipalityId)
    .order("reported_at", { ascending: false });
  return ((data ?? []) as unknown) as Complaint[];
}

export async function updateComplaintStatus(
  supabase: SupabaseClient,
  {
    complaintId,
    status,
    officerId,
    timestamp,
    note,
  }: {
    complaintId: string;
    status: OfficerStatus;
    officerId: string;
    timestamp: OfficerStatusActionTimestamp;
    note?: string;
  },
): Promise<{ error?: string }> {
  const now = new Date().toISOString();
  const { error: updateError } = await supabase
    .from("complaints")
    .update({ status, [timestamp]: now })
    .eq("id", complaintId);
  if (updateError) return { error: updateError.message };
  const { error: historyError } = await supabase
    .from("complaint_status_history")
    .insert({
      complaint_id: complaintId,
      status,
      changed_by: officerId,
      note: note?.trim() || null,
    });
  if (historyError) return { error: historyError.message };
  return {};
}

export async function uploadEvidence(
  supabase: SupabaseClient,
  {
    complaintId,
    officerId,
    imageType,
    file,
  }: {
    complaintId: string;
    officerId: string;
    imageType: "before" | "after";
    file: File;
  },
): Promise<{ error?: string }> {
  const extension =
    file.name.split(".").pop()?.replace(/[^a-zA-Z0-9]/g, "") || "jpg";
  const path = `${complaintId}/${imageType}/${crypto.randomUUID()}.${extension}`;
  const { error: uploadError } = await supabase.storage
    .from("complaint-images")
    .upload(path, file, { contentType: file.type, upsert: false });
  if (uploadError) return { error: uploadError.message };
  const { error: metadataError } = await supabase.from("complaint_images").insert({
    complaint_id: complaintId,
    uploaded_by: officerId,
    image_type: imageType,
    storage_path: path,
  });
  if (metadataError) return { error: metadataError.message };
  return {};
}

export async function notifyMunicipalityCitizens(
  supabase: SupabaseClient,
  {
    municipalityId,
    complaintId,
    title,
    message,
  }: {
    municipalityId: string;
    complaintId: string;
    title: string;
    message: string;
  },
): Promise<{ error?: string }> {
  const { data: citizens, error: fetchError } = await supabase
    .from("profiles")
    .select("id")
    .eq("municipality_id", municipalityId)
    .eq("role", "citizen");
  if (fetchError) return { error: fetchError.message };
  const rows = (citizens ?? []).map((citizen) => ({
    user_id: citizen.id,
    title,
    message,
    complaint_id: complaintId,
  }));
  if (rows.length) {
    const { error } = await supabase.from("notifications").insert(rows);
    if (error) return { error: error.message };
  }
  return {};
}

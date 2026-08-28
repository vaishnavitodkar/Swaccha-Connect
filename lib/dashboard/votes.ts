import type { SupabaseClient } from "@supabase/supabase-js";

export type ComplaintVote = {
  id: string;
  complaint_id: string;
  user_id: string;
  created_at: string;
};

export async function fetchVoteCounts(
  supabase: SupabaseClient,
  complaintIds: string[],
): Promise<Record<string, number>> {
  const counts: Record<string, number> = {};
  if (!complaintIds.length) return counts;
  const { data } = await supabase
    .from("complaint_votes")
    .select("complaint_id")
    .in("complaint_id", complaintIds);
  for (const row of data ?? []) {
    counts[row.complaint_id] = (counts[row.complaint_id] ?? 0) + 1;
  }
  return counts;
}

export async function fetchMyVotes(
  supabase: SupabaseClient,
  userId: string,
  complaintIds: string[],
): Promise<Set<string>> {
  const voted = new Set<string>();
  if (!complaintIds.length) return voted;
  const { data } = await supabase
    .from("complaint_votes")
    .select("complaint_id")
    .in("complaint_id", complaintIds)
    .eq("user_id", userId);
  for (const row of data ?? []) voted.add(row.complaint_id);
  return voted;
}

export async function toggleVote(
  supabase: SupabaseClient,
  { complaintId, userId }: { complaintId: string; userId: string },
): Promise<boolean> {
  const { data: existing } = await supabase
    .from("complaint_votes")
    .select("id")
    .eq("complaint_id", complaintId)
    .eq("user_id", userId)
    .maybeSingle();
  if (existing) {
    const { error } = await supabase
      .from("complaint_votes")
      .delete()
      .eq("id", existing.id);
    if (error) throw error;
    return false;
  }
  const { error } = await supabase
    .from("complaint_votes")
    .insert({ complaint_id: complaintId, user_id: userId });
  if (error) throw error;
  return true;
}

export async function upvoteForDuplicate(
  supabase: SupabaseClient,
  { parentId, userId }: { parentId: string; userId: string },
): Promise<boolean> {
  const { data: existing } = await supabase
    .from("complaint_votes")
    .select("id")
    .eq("complaint_id", parentId)
    .eq("user_id", userId)
    .maybeSingle();
  if (existing) return false;
  const { error } = await supabase
    .from("complaint_votes")
    .insert({ complaint_id: parentId, user_id: userId });
  if (error) return false;
  return true;
}

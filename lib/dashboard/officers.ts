import type { SupabaseClient } from "@supabase/supabase-js";

export type OfficerInfo = {
  full_name: string | null;
  phone: string | null;
};

export async function fetchOfficers(
  supabase: SupabaseClient,
  officerIds: string[],
): Promise<Map<string, OfficerInfo>> {
  const officers = new Map<string, OfficerInfo>();
  const uniqueIds = [...new Set(officerIds.filter(Boolean))];
  if (!uniqueIds.length) return officers;
  const { data } = await supabase
    .from("profiles")
    .select("id,full_name,phone")
    .in("id", uniqueIds);
  for (const row of data ?? []) {
    officers.set(row.id, {
      full_name: row.full_name ?? null,
      phone: row.phone ?? null,
    });
  }
  return officers;
}

import { redirect } from "next/navigation";
import { CommunityActivities } from "@/app/components/community/community-activities";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Community Activities | Swachh Connect" };

export default async function ActivitiesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id,full_name,municipality_id,role")
    .eq("id", user.id)
    .single();
  if (!profile || profile.role !== "citizen") redirect("/dashboard");

  const [{ data: drives }, { data: volunteers }, { data: municipalities }, { data: wards }] = await Promise.all([
    supabase
      .from("cleanup_drives")
      .select("id,municipality_id,ward_id,title,description,location,start_time,end_time,max_volunteers,created_by,created_at")
      .order("start_time", { ascending: true }),
    supabase.from("cleanup_volunteers").select("id,cleanup_drive_id,user_id,joined_at"),
    supabase.from("municipalities").select("id,name,state,district").order("name"),
    supabase.from("wards").select("id,municipality_id,name,ward_number").order("ward_number"),
  ]);

  return (
    <CommunityActivities
      userId={profile.id}
      userName={profile.full_name}
      drives={drives ?? []}
      volunteers={volunteers ?? []}
      municipalities={municipalities ?? []}
      wards={wards ?? []}
    />
  );
}

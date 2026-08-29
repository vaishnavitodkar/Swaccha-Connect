import { redirect } from "next/navigation";
import { ProfileEditor } from "@/app/components/profile/profile-editor";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "My Profile | Swachh Connect" };

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("id,full_name,phone,municipality_id,ward_id,avatar_url,created_at,role").eq("id", user.id).single();
  if (!profile || profile.role !== "citizen") redirect("/dashboard");
  const [{ data: municipalities }, { data: wards }] = await Promise.all([
    supabase.from("municipalities").select("id,name,state,district").order("name"),
    supabase.from("wards").select("id,municipality_id,name,ward_number").order("ward_number"),
  ]);
  return <ProfileEditor profile={profile} email={user.email || ""} joinedAt={user.created_at} municipalities={municipalities || []} wards={wards || []} />;
}

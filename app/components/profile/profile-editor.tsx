"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowLeft, Pencil } from "lucide-react";
import { SignOutButton } from "@/app/components/auth/sign-out-button";
import { createClient } from "@/lib/supabase/client";

type Role = "citizen" | "officer";
type Profile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  municipality_id: string | null;
  ward_id: string | null;
  avatar_url: string | null;
  created_at: string;
  role: Role;
};
type Municipality = {
  id: string;
  name: string;
  state: string;
  district: string | null;
};
type Ward = {
  id: string;
  municipality_id: string;
  name: string;
  ward_number: string | null;
};

export function ProfileEditor({
  profile: initialProfile,
  email,
  joinedAt,
  municipalities,
  wards,
}: {
  profile: Profile;
  email: string;
  joinedAt: string;
  municipalities: Municipality[];
  wards?: Ward[];
}) {
  const [profile, setProfile] = useState(initialProfile);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const isCitizen = profile.role === "citizen";
  const joined = new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(joinedAt));
  const municipality = municipalities.find(
    (item) => item.id === profile.municipality_id,
  );
  const ward = wards?.find((item) => item.id === profile.ward_id);
  const relevantWards = isCitizen
    ? (wards ?? []).filter(
        (item) => item.municipality_id === profile.municipality_id,
      )
    : [];

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);
    const data = new FormData(event.currentTarget);
    const fullName = String(data.get("fullName") || "").trim();
    const phone = String(data.get("phone") || "").trim();
    const municipalityId = String(data.get("municipalityId") || "");
    const wardId = String(data.get("wardId") || "") || null;
    const avatarUrl = String(data.get("avatarUrl") || "").trim() || null;
    if (!fullName) {
      setFeedback("Please enter your name.");
      return;
    }
    if (phone && !/^[0-9+() -]{7,20}$/.test(phone)) {
      setFeedback("Enter a valid phone number or leave it blank.");
      return;
    }
    if (!municipalityId) {
      setFeedback("Please select your municipality.");
      return;
    }
    if (
      isCitizen &&
      wardId &&
      !(wards ?? []).some(
        (item) => item.id === wardId && item.municipality_id === municipalityId,
      )
    ) {
      setFeedback(
        "The selected ward does not belong to the selected municipality.",
      );
      return;
    }
    setSaving(true);
    const { data: updated, error } = await createClient()
      .from("profiles")
      .update({
        full_name: fullName,
        phone: phone || null,
        municipality_id: municipalityId,
        ward_id: isCitizen ? wardId : null,
        avatar_url: avatarUrl,
      })
      .eq("id", profile.id)
      .select(
        "id,full_name,phone,municipality_id,ward_id,avatar_url,created_at,role",
      )
      .single();
    setSaving(false);
    if (error || !updated) {
      setFeedback(
        error?.message || "We couldn’t save your profile. Please try again.",
      );
      return;
    }
    setProfile(updated as Profile);
    setEditing(false);
    setFeedback("Your profile has been saved.");
  }

  return (
    <main className="min-h-screen bg-stone-50 px-4 py-8 sm:px-7 dark:bg-slate-950">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700"
          >
            <ArrowLeft className="size-4" />
            Back to dashboard
          </Link>
          <SignOutButton />
        </div>
        <section className="surface-card mt-7 rounded-3xl border border-slate-200 bg-white p-5 sm:p-8 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold tracking-[.12em] text-emerald-700 uppercase">
                Swachh Connect
              </p>
              <h1 className="mt-2 text-2xl font-bold tracking-tight">
                My profile
              </h1>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Keep your contact and location details up to date.
              </p>
            </div>
            {!editing && (
              <button
                onClick={() => {
                  setFeedback(null);
                  setEditing(true);
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white"
              >
                <Pencil className="size-4" />
                Edit profile
              </button>
            )}
          </div>
          {feedback && (
            <p
              role="status"
              className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100"
            >
              {feedback}
            </p>
          )}
          {editing ? (
            <form onSubmit={save} className="mt-7 grid gap-5 sm:grid-cols-2">
              <Field label="Name">
                <input
                  name="fullName"
                  defaultValue={profile.full_name || ""}
                  className="field"
                  required
                />
              </Field>
              <Field label="Email">
                <input value={email} className="field opacity-70" readOnly />
              </Field>
              <Field label="Phone number">
                <input
                  name="phone"
                  defaultValue={profile.phone || ""}
                  inputMode="tel"
                  placeholder="Add your phone number"
                  className="field"
                />
              </Field>
              <Field
                label="Municipality"
                help={
                  isCitizen
                    ? undefined
                    : "Your assigned municipality. Update only with approval."
                }
              >
                <select
                  name="municipalityId"
                  defaultValue={profile.municipality_id || ""}
                  onChange={(event) => {
                    setProfile((current) => ({
                      ...current,
                      municipality_id: event.target.value || null,
                      ward_id: null,
                    }));
                  }}
                  className="field"
                >
                  <option value="">Select your municipality</option>
                  {municipalities.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                      {item.district ? `, ${item.district}` : ""}, {item.state}
                    </option>
                  ))}
                </select>
              </Field>
              {isCitizen && (
                <Field
                  label="Ward"
                  help={
                    profile.municipality_id
                      ? undefined
                      : "Select a municipality first."
                  }
                >
                  <select
                    name="wardId"
                    key={profile.municipality_id || "none"}
                    defaultValue={profile.ward_id || ""}
                    className="field"
                    disabled={!profile.municipality_id}
                  >
                    <option value="">Select your ward</option>
                    {relevantWards.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.ward_number ? `Ward ${item.ward_number} — ` : ""}
                        {item.name}
                      </option>
                    ))}
                  </select>
                </Field>
              )}
              <div className="sm:col-span-2">
                <Field label="Avatar URL">
                  <input
                    name="avatarUrl"
                    defaultValue={profile.avatar_url || ""}
                    placeholder="https://…"
                    className="field"
                  />
                </Field>
              </div>
              <div className="flex flex-col-reverse gap-3 sm:col-span-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    setFeedback(null);
                    setProfile(initialProfile);
                  }}
                  className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-bold dark:border-slate-700"
                >
                  Cancel
                </button>
                <button
                  disabled={saving}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white disabled:opacity-60"
                >
                  {saving ? "Saving…" : "Save changes"}
                </button>
              </div>
            </form>
          ) : (
            <dl className="mt-7 grid gap-4 rounded-xl bg-slate-50 p-4 text-sm sm:grid-cols-2 dark:bg-slate-800/60">
              <Information label="Name" value={profile.full_name || "—"} />
              <Information label="Email" value={email} />
              <Information label="Phone" value={profile.phone || "—"} />
              <Information
                label="Municipality"
                value={
                  municipality
                    ? `${municipality.name}${municipality.district ? `, ${municipality.district}` : ""}, ${municipality.state}`
                    : "—"
                }
              />
              {isCitizen ? (
                <Information
                  label="Ward"
                  value={
                    ward
                      ? `${ward.ward_number ? `Ward ${ward.ward_number} — ` : ""}${ward.name}`
                      : "—"
                  }
                />
              ) : (
                <Information
                  label="Role"
                  value={
                    profile.role === "officer" ? "Municipal officer" : "—"
                  }
                />
              )}
              <Information label="Member since" value={joined} />
            </dl>
          )}
        </section>
      </div>
    </main>
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
function Information({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-slate-500">{label}</dt>
      <dd className="mt-1 font-semibold">{value}</dd>
    </div>
  );
}

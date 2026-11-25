import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/dashboard-shell";
import { Card } from "@/components/ui";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { ProfileForm } from "./profile-form";
import { TimezoneDisplay, TimezoneForm } from "./timezone-form";

export const metadata: Metadata = {
  title: "Profil | PERINTIS",
};

export default async function ProfilePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const [{ data: profile, error: profileError }, { data: preferences, error: preferencesError }] =
    await Promise.all([
      supabase.from("profiles").select("full_name").eq("user_id", user.id).maybeSingle(),
      supabase.from("user_preferences").select("theme, timezone").eq("user_id", user.id).maybeSingle(),
    ]);

  if (profileError || preferencesError || !profile || !preferences) {
    throw new Error("Data profil belum dapat dimuat.");
  }

  return (
    <DashboardShell activePath="/profile" initialTheme={preferences.theme}>
      <div className="dashboard-content">
        <p className="eyebrow">Akun</p>
        <h1 className="page-title">Profil dan pengaturan</h1>
        <Card className="dashboard-card">
          <h2 className="section-title">Informasi profil</h2>
          <p className="section-description">
            Perbarui nama yang digunakan PERINTIS untuk menyapamu.
          </p>
          <ProfileForm fullName={profile.full_name} />
        </Card>
        <Card className="dashboard-card profile-account-card">
          <h2 className="section-title">Akun masuk</h2>
          <p className="section-description">Email akun tidak dapat diubah dari demo MVP.</p>
          <p className="profile-email">{user.email ?? "Email tidak tersedia"}</p>
        </Card>
        <Card className="dashboard-card">
          <h2 className="section-title">Zona waktu</h2>
          <p className="section-description">
            Digunakan untuk perhitungan tanggal aktivitas, habit, dan review mingguan.
          </p>
          <TimezoneDisplay timezone={preferences?.timezone ?? null} />
          <TimezoneForm />
        </Card>
      </div>
    </DashboardShell>
  );
}

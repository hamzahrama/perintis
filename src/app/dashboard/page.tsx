import Link from "next/link";
import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/dashboard-shell";
import { Card } from "@/components/ui";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getOnboardingStatus } from "@/lib/onboarding";

export default async function ProtectedPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const { completed: onboardingCompleted } = await getOnboardingStatus();
  if (!onboardingCompleted) {
    redirect("/onboarding");
  }

  const { data: preferences, error: preferencesError } = await supabase
    .from("user_preferences")
    .select("theme")
    .eq("user_id", user.id)
    .maybeSingle();

  if (preferencesError) {
    throw new Error("Preferensi pengguna belum dapat dimuat.");
  }

  if (!preferences) {
    throw new Error("Preferensi pengguna tidak ditemukan.");
  }

  return (
    <DashboardShell initialTheme={preferences.theme}>
      <div className="dashboard-content">
        <h1 className="page-title">Sesi aktif</h1>
        <Card className="dashboard-card">
          <h2>Autentikasi berhasil</h2>
          <p>
            Ini adalah halaman konfirmasi sesi. Ringkasan Dashboard MVP belum
            tersedia dan akan dikerjakan pada task backlog terkait.
          </p>
          <Link className="button button--secondary" href="/">
            Kembali ke beranda
          </Link>
        </Card>
      </div>
    </DashboardShell>
  );
}

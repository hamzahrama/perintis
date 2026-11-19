import { redirect } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui";
import { DashboardShell } from "@/components/dashboard-shell";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getOnboardingStatus } from "@/lib/onboarding";

export default async function AnalyticsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) redirect("/login");
  const { completed } = await getOnboardingStatus();
  if (!completed) redirect("/onboarding");
  const { data: preferences } = await supabase.from("user_preferences").select("theme").eq("user_id", user.id).maybeSingle();
  if (!preferences) throw new Error("Preferensi pengguna tidak ditemukan.");

  const [
    { count: goalsCount },
    { count: activitiesCount },
    { count: completedActivitiesCount },
    { count: habitsCount },
    { count: logsCount }
  ] = await Promise.all([
    supabase.from("goals").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("activities").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("activities").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "completed"),
    supabase.from("habits").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("is_active", true),
    supabase.from("habit_logs").select("id", { count: "exact", head: true }).eq("user_id", user.id)
  ]);

  return (
    <DashboardShell initialTheme={preferences.theme} activePath="/analytics">
      <div className="dashboard-content analytics-page">
        <header className="dashboard-welcome">
          <div>
            <p className="eyebrow">Progress Analytics</p>
            <h1 className="page-title">Statistik &amp; Pertumbuhan</h1>
            <p className="dashboard-intro">
              Ringkasan angka nyata dari aktivitas dan kebiasaan yang telah kamu simpan.
            </p>
          </div>
        </header>

        <section className="dashboard-grid">
          <Card className="dashboard-panel">
            <h2 className="section-title">Total Goal</h2>
            <p style={{ fontSize: "2.5rem", fontWeight: "bold", margin: "1rem 0" }}>{goalsCount ?? 0}</p>
            <p>Arah pengembangan diri yang terdaftar.</p>
          </Card>
          <Card className="dashboard-panel">
            <h2 className="section-title">Aktivitas Selesai</h2>
            <p style={{ fontSize: "2.5rem", fontWeight: "bold", margin: "1rem 0", color: "var(--success)" }}>{completedActivitiesCount ?? 0} / {activitiesCount ?? 0}</p>
            <p>Rasio penyelesaian langkah kecil.</p>
          </Card>
          <Card className="dashboard-panel">
            <h2 className="section-title">Log Habit Keseluruhan</h2>
            <p style={{ fontSize: "2.5rem", fontWeight: "bold", margin: "1rem 0" }}>{logsCount ?? 0}</p>
            <p>Total pencatatan habit aktif ({habitsCount ?? 0} habit).</p>
          </Card>
        </section>

        <div style={{ marginTop: "2rem" }}>
          <Link href="/dashboard" className="button button--secondary">Kembali ke Ringkasan</Link>
        </div>
      </div>
    </DashboardShell>
  );
}

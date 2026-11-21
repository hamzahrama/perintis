import { redirect } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui";
import { DashboardShell } from "@/components/dashboard-shell";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getOnboardingStatus } from "@/lib/onboarding";
import { getUserTimezone, getWeekRange } from "@/lib/timezone";

export default async function AnalyticsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) redirect("/login");
  const { completed } = await getOnboardingStatus();
  if (!completed) redirect("/onboarding");
  const timezone = await getUserTimezone(user.id);
  const { start, end, mondayKey, sundayKey } = getWeekRange(new Date(), timezone);
  const { data: preferences } = await supabase.from("user_preferences").select("theme").eq("user_id", user.id).maybeSingle();
  if (!preferences) throw new Error("Preferensi pengguna tidak ditemukan.");

  const [
    { count: goalsCount },
    { count: activitiesCount },
    { count: completedActivitiesCount },
    { count: habitsCount },
    { count: logsCount },
  ] = await Promise.all([
    supabase.from("goals").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("activities").select("id", { count: "exact", head: true }).eq("user_id", user.id).gte("scheduled_at", start).lt("scheduled_at", end),
    supabase.from("activities").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "completed").gte("completed_at", start).lt("completed_at", end),
    supabase.from("habits").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("is_active", true),
    supabase.from("habit_logs").select("id", { count: "exact", head: true }).eq("user_id", user.id).gte("log_date", mondayKey).lte("log_date", sundayKey),
  ]);

  return (
    <DashboardShell initialTheme={preferences.theme} activePath="/analytics">
      <div className="dashboard-content analytics-page">
        <header className="dashboard-welcome">
          <div>
            <p className="eyebrow">Progress Analytics</p>
            <h1 className="page-title">Statistik &amp; Pertumbuhan</h1>
            <p className="dashboard-intro">Ringkasan minggu {mondayKey}–{sundayKey} berdasarkan zona waktu {timezone}.</p>
          </div>
        </header>

        <section className="dashboard-grid">
          <Card className="dashboard-panel"><h2 className="section-title">Total Goal</h2><p style={{ fontSize: "2.5rem", fontWeight: "bold", margin: "1rem 0" }}>{goalsCount ?? 0}</p><p>Arah pengembangan diri yang terdaftar.</p></Card>
          <Card className="dashboard-panel"><h2 className="section-title">Aktivitas Minggu Ini</h2><p style={{ fontSize: "2.5rem", fontWeight: "bold", margin: "1rem 0", color: "var(--success)" }}>{completedActivitiesCount ?? 0} / {activitiesCount ?? 0}</p><p>Aktivitas terjadwal dan selesai dalam periode lokal.</p></Card>
          <Card className="dashboard-panel"><h2 className="section-title">Log Habit Minggu Ini</h2><p style={{ fontSize: "2.5rem", fontWeight: "bold", margin: "1rem 0" }}>{logsCount ?? 0}</p><p>Total log dari {habitsCount ?? 0} habit aktif.</p></Card>
        </section>

        <div style={{ marginTop: "2rem" }}><Link href="/dashboard" className="button button--secondary">Kembali ke Ringkasan</Link></div>
      </div>
    </DashboardShell>
  );
}
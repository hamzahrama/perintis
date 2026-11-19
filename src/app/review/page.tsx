import { redirect } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui";
import { DashboardShell } from "@/components/dashboard-shell";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getOnboardingStatus } from "@/lib/onboarding";
import { getUserTimezone, utcToZonedDate, zonedDateToUtc } from "@/lib/timezone";

export default async function WeeklyReviewPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) redirect("/login");
  const { completed } = await getOnboardingStatus();
  if (!completed) redirect("/onboarding");

  const timezone = await getUserTimezone(user.id);
  const { data: preferences } = await supabase.from("user_preferences").select("theme").eq("user_id", user.id).maybeSingle();
  if (!preferences) throw new Error("Preferensi pengguna tidak ditemukan.");

  // Hitung Senin-Minggu di timezone user
  const todayLocal = utcToZonedDate(new Date(), timezone);
  const today = new Date(`${todayLocal}T00:00:00Z`);
  const day = today.getUTCDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(today);
  monday.setUTCDate(today.getUTCDate() + diffToMonday);
  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);

  const mondayKey = `${monday.getUTCFullYear()}-${String(monday.getUTCMonth() + 1).padStart(2, "0")}-${String(monday.getUTCDate()).padStart(2, "0")}`;
  const sundayKey = `${sunday.getUTCFullYear()}-${String(sunday.getUTCMonth() + 1).padStart(2, "0")}-${String(sunday.getUTCDate()).padStart(2, "0")}`;
  const start = zonedDateToUtc(mondayKey, timezone);
  const end = zonedDateToUtc(`${sundayKey}T23:59:59`, timezone);

  const [
    { count: scheduledCount },
    { count: completedCount },
    { count: skippedCount },
    { data: logs },
    { data: reflections }
  ] = await Promise.all([
    supabase.from("activities").select("id", { count: "exact", head: true }).eq("user_id", user.id).gte("scheduled_at", start).lte("scheduled_at", end),
    supabase.from("activities").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "completed").gte("completed_at", start).lte("completed_at", end),
    supabase.from("activity_status_events").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("to_status", "skipped").gte("created_at", start).lte("created_at", end),
    supabase.from("habit_logs").select("id, habit_id, log_date").eq("user_id", user.id).gte("log_date", mondayKey).lte("log_date", sundayKey),
    supabase.from("daily_reflections").select("reflection_date, answers").eq("user_id", user.id).gte("reflection_date", mondayKey).lte("reflection_date", sundayKey),
  ]);

  return (
    <DashboardShell initialTheme={preferences.theme} activePath="/review">
      <div className="dashboard-content review-page">
        <header className="dashboard-welcome">
          <div>
            <p className="eyebrow">Weekly Growth Review</p>
            <h1 className="page-title">Review Mingguan</h1>
            <p className="dashboard-intro">
              Periode {mondayKey} s/d {sundayKey} (zona {timezone}). Hitungan murni dari data aktualmu, tanpa skor palsu.
            </p>
          </div>
        </header>

        <section className="dashboard-grid">
          <Card className="dashboard-panel">
            <h2 className="section-title">Aktivitas Terjadwal</h2>
            <p style={{ fontSize: "2rem", fontWeight: "bold", margin: "1rem 0" }}>{scheduledCount ?? 0}</p>
            <p>Total aktivitas dalam rentang minggu ini.</p>
          </Card>
          <Card className="dashboard-panel">
            <h2 className="section-title">Aktivitas Selesai</h2>
            <p style={{ fontSize: "2rem", fontWeight: "bold", margin: "1rem 0", color: "var(--success)" }}>{completedCount ?? 0}</p>
            <p>Langkah kecil yang berhasil kamu selesaikan.</p>
          </Card>
          <Card className="dashboard-panel">
            <h2 className="section-title">Aktivitas Dilewati</h2>
            <p style={{ fontSize: "2rem", fontWeight: "bold", margin: "1rem 0", color: "var(--muted)" }}>{skippedCount ?? 0}</p>
            <p>Pelaksanaan yang kamu lewati tanpa hukuman.</p>
          </Card>
          <Card className="dashboard-panel">
            <h2 className="section-title">Log Habit</h2>
            <p style={{ fontSize: "2rem", fontWeight: "bold", margin: "1rem 0" }}>{logs?.length ?? 0}</p>
            <p>Catatan kebiasaan konsisten minggu ini.</p>
          </Card>
        </section>

        <Card className="goals-create-card" style={{ marginTop: "1.5rem" }}>
          <h2 className="section-title">Refleksi Minggu Ini</h2>
          {reflections && reflections.length > 0 ? (
            <ul className="activity-list">
              {reflections.map((r) => (
                <li className="activity-card" key={r.reflection_date}>
                  <div className="activity-content">
                    <h3>{r.reflection_date}</h3>
                    <p>Berjalan baik: {String(r.answers?.wins ?? "-")}</p>
                    <p>Hambatan: {String(r.answers?.blockers ?? "-")}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="dashboard-empty">
              <h3>Belum ada refleksi minggu ini</h3>
              <p>Luangkan waktu sejenak untuk menulis refleksi harianmu.</p>
              <Link className="button button--secondary" href="/reflection">Buat refleksi</Link>
            </div>
          )}
        </Card>
      </div>
    </DashboardShell>
  );
}

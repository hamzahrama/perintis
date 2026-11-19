import { redirect } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui";
import { DashboardShell } from "@/components/dashboard-shell";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getOnboardingStatus } from "@/lib/onboarding";

export default async function WeeklyReviewPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) redirect("/login");
  const { completed } = await getOnboardingStatus();
  if (!completed) redirect("/onboarding");
  const { data: preferences } = await supabase.from("user_preferences").select("theme").eq("user_id", user.id).maybeSingle();
  if (!preferences) throw new Error("Preferensi pengguna tidak ditemukan.");

  const now = new Date();
  const day = now.getUTCDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setUTCDate(now.getUTCDate() + diffToMonday);
  monday.setUTCHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);
  sunday.setUTCHours(23, 59, 59, 999);

  const [
    { count: scheduledCount },
    { count: completedCount },
    { count: skippedCount },
    { data: logs },
    { data: reflections }
  ] = await Promise.all([
    supabase.from("activities").select("id", { count: "exact", head: true }).eq("user_id", user.id).gte("scheduled_at", monday.toISOString()).lte("scheduled_at", sunday.toISOString()),
    supabase.from("activities").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "completed").gte("completed_at", monday.toISOString()).lte("completed_at", sunday.toISOString()),
    supabase.from("activity_status_events").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("to_status", "skipped").gte("created_at", monday.toISOString()).lte("created_at", sunday.toISOString()),
    supabase.from("habit_logs").select("id, habit_id, log_date").eq("user_id", user.id).gte("log_date", monday.toISOString().slice(0, 10)).lte("log_date", sunday.toISOString().slice(0, 10)),
    supabase.from("daily_reflections").select("reflection_date, answers").eq("user_id", user.id).gte("reflection_date", monday.toISOString().slice(0, 10)).lte("reflection_date", sunday.toISOString().slice(0, 10)),
  ]);

  return (
    <DashboardShell initialTheme={preferences.theme} activePath="/review">
      <div className="dashboard-content review-page">
        <header className="dashboard-welcome">
          <div>
            <p className="eyebrow">Weekly Growth Review</p>
            <h1 className="page-title">Review Mingguan</h1>
            <p className="dashboard-intro">
              Periode Senin sampai Minggu. Hitungan di bawah murni dari data aktualmu, tanpa skor palsu.
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

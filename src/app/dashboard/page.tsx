import Link from "next/link";
import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/dashboard-shell";
import { Card } from "@/components/ui";
import { getOnboardingStatus } from "@/lib/onboarding";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatForDisplay, validateTimezone } from "@/lib/timezone";

function formatActivityDate(value: string | null, timezone: string) {
  if (!value) return "Belum dijadwalkan";
  return formatForDisplay(value, timezone);
}

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

  const [
    { data: preferences, error: preferencesError },
    { data: profile, error: profileError },
    { data: goals, error: goalsError },
    { data: activities, error: activitiesError },
  ] = await Promise.all([
    supabase.from("user_preferences").select("theme, timezone").eq("user_id", user.id).maybeSingle(),
    supabase.from("profiles").select("full_name").eq("user_id", user.id).maybeSingle(),
    supabase
      .from("goals")
      .select("id, title, description, category, target_date, status")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("created_at", { ascending: false }),
    supabase
      .from("activities")
      .select("id, title, description, scheduled_at, status")
      .eq("user_id", user.id)
      .in("status", ["not_started", "in_progress", "rescheduled"])
      .order("scheduled_at", { ascending: true, nullsFirst: false })
      .limit(5),
  ]);

  if (preferencesError || profileError || goalsError || activitiesError) {
    throw new Error("Ringkasan dashboard belum dapat dimuat.");
  }

  if (!preferences) {
    throw new Error("Preferensi pengguna tidak ditemukan.");
  }

  const firstName = profile?.full_name?.trim().split(/\s+/)[0] ?? "Teman";
  const timezone = validateTimezone(preferences.timezone);
  const activeGoals = goals ?? [];
  const plannedActivities = activities ?? [];

  return (
    <DashboardShell initialTheme={preferences.theme}>
      <div className="dashboard-content dashboard-overview">
        <header className="dashboard-welcome">
          <div>
            <p className="eyebrow">Ringkasan hari ini</p>
            <h1 className="page-title">Halo, {firstName}</h1>
            <p className="dashboard-intro">
              Lihat hal yang sudah kamu pilih untuk dibangun, tanpa tekanan untuk menyelesaikan semuanya sekaligus.
            </p>
          </div>
          <Link className="button button--primary dashboard-action" href="/profile">
            Buka pengaturan
          </Link>
        </header>

        <section aria-labelledby="today-title" className="dashboard-grid">
          <Card className="dashboard-panel dashboard-panel--wide">
            <div className="panel-heading">
              <div>
                <p className="panel-kicker">Fokus berikutnya</p>
                <h2 className="section-title" id="today-title">Aktivitas yang sudah kamu jadwalkan</h2>
              </div>
              <span className="panel-count">{plannedActivities.length} tersimpan</span>
            </div>
            {plannedActivities.length > 0 ? (
              <ul className="dashboard-list">
                {plannedActivities.map((activity) => (
                  <li className="dashboard-list-item" key={activity.id}>
                    <div>
                      <h3>{activity.title}</h3>
                      <p>{activity.description || "Tidak ada catatan tambahan."}</p>
                    </div>
                    <span className="item-meta">{formatActivityDate(activity.scheduled_at, timezone)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="dashboard-empty">
                <h3>Belum ada aktivitas terjadwal</h3>
                <p>Setelah punya goal dan roadmap, aktivitas pilihanmu akan muncul di sini.</p>
                <Link className="text-link" href="/dashboard">Tetap di ringkasan</Link>
              </div>
            )}
          </Card>

          <Card className="dashboard-panel">
            <div className="panel-heading">
              <div>
                <p className="panel-kicker">Arahmu</p>
                <h2 className="section-title">Goal aktif</h2>
              </div>
              <span className="panel-count">{activeGoals.length}</span>
            </div>
            {activeGoals.length > 0 ? (
              <ul className="dashboard-list dashboard-list--compact">
                {activeGoals.map((goal) => (
                  <li className="dashboard-list-item" key={goal.id}>
                    <div>
                      <h3>{goal.title}</h3>
                      <p>{goal.description || goal.category || "Goal aktif"}</p>
                    </div>
                    {goal.target_date && <span className="item-meta">Target {goal.target_date}</span>}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="dashboard-empty">
                <h3>Belum ada goal</h3>
                <p>Mulai dari satu arah yang terasa penting bagimu.</p>
                <Link className="button button--secondary" href="/goals">Buat goal pertama</Link>
              </div>
            )}
          </Card>
        </section>

        <Card className="dashboard-panel dashboard-guidance">
          <p className="panel-kicker">Langkah berikutnya</p>
          <h2 className="section-title">Tidak perlu mengejar semuanya hari ini.</h2>
          <p className="section-description">
            Periksa data yang sudah kamu pilih, lalu lanjutkan ketika kamu siap. PERINTIS tidak membuat goal atau aktivitas secara otomatis.
          </p>
        </Card>
      </div>
    </DashboardShell>
  );
}

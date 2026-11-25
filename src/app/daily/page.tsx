import { redirect } from "next/navigation";
import { Card } from "@/components/ui";
import { DashboardShell } from "@/components/dashboard-shell";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getOnboardingStatus } from "@/lib/onboarding";
import { formatForDisplay, getTodayLocalString, getUserTimezone, localDateToUtcEnd, localDateToUtcStart } from "@/lib/timezone";
import { ActivityForm } from "./activity-form";
import { ActivityStatusForm } from "./activity-status-form";

export default async function DailyPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) redirect("/login");

  const { completed } = await getOnboardingStatus();
  if (!completed) redirect("/onboarding");

  const timezone = await getUserTimezone(user.id);
  const { data: preferences } = await supabase.from("user_preferences").select("theme").eq("user_id", user.id).maybeSingle();
  if (!preferences) throw new Error("Preferensi pengguna tidak ditemukan.");

  // Tentukan hari ini (tanggal lokal user) menggunakan timezone user
  const todayLocal = getTodayLocalString(timezone);
  const todayStart = localDateToUtcStart(todayLocal, timezone);
  const todayEnd = localDateToUtcEnd(todayLocal, timezone);

  const { data: activities, error } = await supabase
    .from("activities")
    .select("id, title, description, scheduled_at, status")
    .eq("user_id", user.id)
    .gte("scheduled_at", todayStart)
    .lte("scheduled_at", todayEnd)
    .order("scheduled_at", { ascending: true, nullsFirst: false });

  if (error) throw new Error("Aktivitas belum dapat dimuat.");

  return (
    <DashboardShell initialTheme={preferences.theme} activePath="/daily">
      <div className="dashboard-content daily-page">
        <header className="dashboard-welcome">
          <div>
            <p className="eyebrow">Daily Guidance</p>
            <h1 className="page-title">Langkah untuk hari ini</h1>
            <p className="dashboard-intro">Pilih satu langkah kecil. Tidak perlu menyelesaikan semuanya sekaligus.</p>
          </div>
        </header>

        <Card className="goals-create-card">
          <h2 className="section-title">Tambah aktivitas</h2>
          <ActivityForm />
        </Card>

        <section className="goals-section" aria-labelledby="activity-title">
          <h2 className="section-title" id="activity-title">
            Aktivitas terjadwal <span className="panel-count">{activities?.length ?? 0}</span>
          </h2>
          {activities && activities.length > 0 ? (
            <ul className="activity-list">
              {activities.map((activity) => (
                <li className="activity-card" key={activity.id}>
                  <div className="activity-content">
                    <h3>{activity.title}</h3>
                    <p>{activity.description || "Tidak ada catatan tambahan."}</p>
                    <span className="item-meta">{formatForDisplay(activity.scheduled_at, timezone)}</span>
                  </div>
                  <ActivityStatusForm
                    activityId={activity.id}
                    status={activity.status as "not_started" | "in_progress" | "completed" | "rescheduled" | "skipped"}
                    scheduledAt={activity.scheduled_at}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <div className="dashboard-empty">
              <h3>Belum ada aktivitas hari ini</h3>
              <p>Tambahkan langkah kecil atau ambil dari roadmap goal kamu.</p>
            </div>
          )}
        </section>
      </div>
    </DashboardShell>
  );
}
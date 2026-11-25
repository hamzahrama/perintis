import { redirect } from "next/navigation";
import { Card } from "@/components/ui";
import { DashboardShell } from "@/components/dashboard-shell";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getOnboardingStatus } from "@/lib/onboarding";
import { getUserTimezone } from "@/lib/timezone";
import { RemindersNotification } from "@/components/reminders-notification";
import { ReminderForm } from "./reminder-form";
import { ReminderDisableForm } from "./reminder-disable-form";

export default async function RemindersPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) redirect("/login");
  const { completed } = await getOnboardingStatus();
  if (!completed) redirect("/onboarding");

  const timezone = await getUserTimezone(user.id);
  const [{ data: preferences }, { data: reminders }, { data: activities }] = await Promise.all([
    supabase.from("user_preferences").select("theme").eq("user_id", user.id).maybeSingle(),
    supabase.from("reminders").select("id, activity_id, remind_at, is_enabled").eq("user_id", user.id).order("remind_at", { ascending: true }),
    supabase.from("activities").select("id, title").eq("user_id", user.id).neq("status", "completed").neq("status", "skipped").order("scheduled_at", { ascending: true }),
  ]);
  if (!preferences) throw new Error("Preferensi pengguna tidak ditemukan.");

  const activityMap = new Map((activities ?? []).map((activity) => [activity.id, activity.title]));
  const now = new Date();
  const dueReminders = (reminders ?? []).filter((r) => r.is_enabled && new Date(r.remind_at) <= now);

  // Satu notification per reminder + due timestamp. Conflict duplicate diabaikan.
  if (dueReminders.length > 0) {
    await supabase.from("notifications").upsert(
      dueReminders.map((reminder) => ({
        user_id: user.id,
        reminder_id: reminder.id,
        scheduled_for: reminder.remind_at,
        title: activityMap.get(reminder.activity_id) ?? "Aktivitas",
        body: "Waktunya menjalankan langkah kecilmu.",
      })),
      { onConflict: "reminder_id,scheduled_for", ignoreDuplicates: true },
    );
  }

  const { data: notifications } = await supabase
    .from("notifications")
    .select("id, title, body, scheduled_for")
    .eq("user_id", user.id)
    .is("read_at", null)
    .order("scheduled_for", { ascending: false });

  return (
    <DashboardShell initialTheme={preferences.theme} activePath="/reminders">
      <div className="dashboard-content daily-page">
        <header className="dashboard-welcome">
          <div>
            <p className="eyebrow">Reminder</p>
            <h1 className="page-title">Reminder in-app</h1>
            <p className="dashboard-intro">Reminder hanya diperiksa saat aplikasi dibuka. Tidak ada push atau email.</p>
          </div>
        </header>

        <RemindersNotification notifications={notifications ?? []} />

        <Card className="goals-create-card">
          <h2 className="section-title">Tambah reminder</h2>
          <ReminderForm activities={activities ?? []} />
        </Card>

        <section className="goals-section">
          <h2 className="section-title">Reminder aktif</h2>
          {reminders && reminders.length > 0 ? (
            <ul className="activity-list">
              {reminders.map((reminder) => (
                <li className="activity-card" key={reminder.id}>
                  <div className="activity-content">
                    <h3>{activityMap.get(reminder.activity_id) ?? "Aktivitas"}</h3>
                    <p>{new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short", timeZone: timezone }).format(new Date(reminder.remind_at))}</p>
                    <span className="item-meta">{reminder.is_enabled ? "Aktif" : "Tidak aktif"}</span>
                  </div>
                  {reminder.is_enabled && <ReminderDisableForm reminderId={reminder.id} />}
                </li>
              ))}
            </ul>
          ) : (
            <div className="dashboard-empty"><h3>Belum ada reminder</h3><p>Tambahkan reminder opsional untuk aktivitasmu.</p></div>
          )}
        </section>
      </div>
    </DashboardShell>
  );
}

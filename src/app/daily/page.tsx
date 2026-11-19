import { redirect } from "next/navigation";
import { Card } from "@/components/ui";
import { DashboardShell } from "@/components/dashboard-shell";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getOnboardingStatus } from "@/lib/onboarding";
import { ActivityForm } from "./activity-form";
import { ActivityStatusForm } from "./activity-status-form";

function formatDate(value: string | null) {
  if (!value) return "Belum dijadwalkan";
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export default async function DailyPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) redirect("/login");
  const { completed } = await getOnboardingStatus();
  if (!completed) redirect("/onboarding");
  const { data: preferences } = await supabase.from("user_preferences").select("theme").eq("user_id", user.id).maybeSingle();
  if (!preferences) throw new Error("Preferensi pengguna tidak ditemukan.");
  const { data: activities, error } = await supabase.from("activities").select("id, title, description, scheduled_at, status").eq("user_id", user.id).order("scheduled_at", { ascending: true, nullsFirst: false });
  if (error) throw new Error("Aktivitas belum dapat dimuat.");

  return <DashboardShell initialTheme={preferences.theme} activePath="/daily"><div className="dashboard-content daily-page"><header className="dashboard-welcome"><div><p className="eyebrow">Daily Guidance</p><h1 className="page-title">Langkah untuk hari ini</h1><p className="dashboard-intro">Pilih satu langkah kecil. Tidak perlu menyelesaikan semuanya sekaligus.</p></div></header><Card className="goals-create-card"><h2 className="section-title">Tambah aktivitas</h2><ActivityForm /></Card><section className="goals-section" aria-labelledby="activity-title"><h2 className="section-title" id="activity-title">Aktivitas terjadwal <span className="panel-count">{activities?.length ?? 0}</span></h2>{activities && activities.length > 0 ? <ul className="activity-list">{activities.map((activity) => <li className="activity-card" key={activity.id}><div className="activity-content"><h3>{activity.title}</h3><p>{activity.description || "Tidak ada catatan tambahan."}</p><span className="item-meta">{formatDate(activity.scheduled_at)}</span></div><ActivityStatusForm activityId={activity.id} status={activity.status as "not_started" | "in_progress" | "completed" | "rescheduled" | "skipped"} scheduledAt={activity.scheduled_at} /></li>)}</ul> : <div className="dashboard-empty"><h3>Belum ada aktivitas</h3><p>Tambahkan langkah kecil yang ingin kamu lakukan hari ini.</p></div>}</section></div></DashboardShell>;
}

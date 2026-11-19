import { redirect } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui";
import { DashboardShell } from "@/components/dashboard-shell";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getOnboardingStatus } from "@/lib/onboarding";
import { ReflectionForm } from "./form";

export default async function ReflectionPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) redirect("/login");
  const { completed } = await getOnboardingStatus();
  if (!completed) redirect("/onboarding");
  const [{ data: preferences }, { data: reflections }] = await Promise.all([
    supabase.from("user_preferences").select("theme").eq("user_id", user.id).maybeSingle(),
    supabase.from("daily_reflections").select("reflection_date, answers").eq("user_id", user.id).order("reflection_date", { ascending: false }),
  ]);
  if (!preferences) throw new Error("Preferensi pengguna tidak ditemukan.");

  return <DashboardShell initialTheme={preferences.theme} activePath="/reflection"><div className="dashboard-content"><header className="dashboard-welcome"><div><p className="eyebrow">Daily Reflection</p><h1 className="page-title">Refleksi harian</h1><p className="dashboard-intro">Tulis satu atau dua kalimat. Refleksi singkat tetap berguna.</p></div></header><Card className="goals-create-card"><h2 className="section-title">Buat refleksi</h2><ReflectionForm /></Card><section className="goals-section"><h2 className="section-title">Riwayat refleksi</h2>{reflections && reflections.length ? <ul className="activity-list">{reflections.map((r) => <li className="activity-card" key={r.reflection_date}><div className="activity-content"><h3>{r.reflection_date}</h3><p>Berjalan baik: {String(r.answers?.wins ?? "-")}</p><p>Hambatan: {String(r.answers?.blockers ?? "-")}</p></div></li>)}</ul> : <div className="dashboard-empty"><h3>Belum ada refleksi</h3><p>Tulis refleksi pertamamu hari ini.</p></div>}</section><Link href="/dashboard" className="text-link">Kembali ke ringkasan</Link></div></DashboardShell>;
}
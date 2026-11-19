import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, Notice } from "@/components/ui";
import { DashboardShell } from "@/components/dashboard-shell";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getOnboardingStatus } from "@/lib/onboarding";

export default async function CoachPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) redirect("/login");
  const { completed } = await getOnboardingStatus();
  if (!completed) redirect("/onboarding");
  const { data: preferences } = await supabase.from("user_preferences").select("theme").eq("user_id", user.id).maybeSingle();
  if (!preferences) throw new Error("Preferensi pengguna tidak ditemukan.");

  const scenarios = [
    { id: "stuck", title: "Merasa jalan di tempat?", intro: "Mari tinjau langkah terkecilmu.", suggestions: ["Buka Daily Guidance", "Pecah langkah roadmap", "Ingat alasan 'Why'"] },
    { id: "overwhelmed", title: "Terlalu banyak tugas?", intro: "Tidak perlu melakukan semuanya hari ini.", suggestions: ["Reschedule ke hari esok", "Skip tanpa hukuman", "Fokus hanya pada satu hal"] },
    { id: "starting", title: "Bingung mulai dari mana?", intro: "Mulai dari apa yang terasa mudah.", suggestions: ["Gunakan Know Your Next Step", "Buat goal baru yang realistis"] },
  ];

  return <DashboardShell initialTheme={preferences.theme} activePath="/dashboard"><div className="dashboard-content coach-page"><header className="dashboard-welcome"><div><p className="eyebrow">Personal Coach</p><h1 className="page-title">Butuh panduan?</h1><p className="dashboard-intro">Pilih topik yang relevan bagimu saat ini. Coach memberikan panduan statis sesuai metodologi PERINTIS.</p></div></header><div className="goals-list" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1rem" }}>{scenarios.map((s) => <Card key={s.id} className="goal-card"><h2 className="section-title">{s.title}</h2><p>{s.intro}</p><ul className="dashboard-list--compact" style={{ margin: "0.5rem 0", padding: "0 1rem" }}>{s.suggestions.map((item) => <li key={item} style={{ marginBottom: "0.4rem" }}>{item}</li>)}</ul><div className="goal-actions"><Link className="button button--secondary" href="/dashboard">Coba sekarang</Link></div></Card>)}</div><Notice tone="info" style={{ marginTop: "1rem" }}>Catatan: Fitur ini menyediakan panduan terstruktur dan pilihan tindakan statis sesuai DEC-020/029, bukan AI live chat.</Notice></div></DashboardShell>;
}
import Link from "next/link";
import { redirect } from "next/navigation";

import { Card } from "@/components/ui";
import { DashboardShell } from "@/components/dashboard-shell";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getOnboardingStatus } from "@/lib/onboarding";

export default async function KnowYourNextStepPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: goalId } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) redirect("/login");
  const { completed } = await getOnboardingStatus();
  if (!completed) redirect("/onboarding");
  const { data: preferences } = await supabase.from("user_preferences").select("theme").eq("user_id", user.id).maybeSingle();
  if (!preferences) throw new Error("Preferensi pengguna tidak ditemukan.");
  const { data: goal } = await supabase.from("goals").select("id, title, description").eq("id", goalId).eq("user_id", user.id).maybeSingle();
  if (!goal) redirect("/goals");
  return (
    <DashboardShell initialTheme={preferences.theme} activePath="/goals">
      <div className="dashboard-content goals-page">
        <header className="dashboard-welcome">
          <div>
            <p className="eyebrow">Know Your Next Step</p>
            <h1 className="page-title">Pilih tindakan berikutnya</h1>
            <p className="dashboard-intro">Pilih opsi yang terasa tepat untukmu hari ini — atau buat sendiri, tunda, atau lewatkan tanpa tekanan.</p>
          </div>
          <Link className="button button--secondary" href={`/goals/${goalId}/roadmap`}>Kembali ke roadmap</Link>
        </header>
        <Card className="goals-create-card">
          <h2 className="section-title">Opsi yang tersedia</h2>
          <p className="section-description">Pilih satu atau gabungkan — keputusanmu disimpan saat kamu siap bertindak.</p>
          <div className="notice notice--info" style={{ marginBottom: "1rem" }}>
            Catatan: Fitur ini menggunakan data sampel demo. Integrasi akhir akan menghubungkan pilihan ke timeline aktivitas yang sebenarnya.
          </div>
          <form action="#">
            <label className="form-field">
              <input type="checkbox" name="choice" value="habit" /> Pelatih habit harian (3x seminggu)
            </label>
            <label className="form-field">
              <input type="checkbox" name="choice" value="learn" /> Pelajari konsep dasar (30 menit)
            </label>
            <label className="form-field">
              <input type="checkbox" name="choice" value="read" /> Baca satu bab buku
            </label>
            <label className="form-field">
              <textarea className="field" name="custom" placeholder="Tulis tindakan sendiri..." style={{ minHeight: "4rem", resize: "vertical" }} />
            </label>
            <div style={{ display: "grid", gap: "0.5rem", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", marginTop: "1rem" }}>
              <button type="submit" className="button button--primary">Simpan pilihan</button>
              <button type="button" className="button button--secondary">Tunda</button>
              <button type="button" className="button button--ghost">Lewati</button>
            </div>
          </form>
        </Card>
      </div>
    </DashboardShell>
  );
}
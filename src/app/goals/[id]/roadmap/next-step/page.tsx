import Link from "next/link";
import { redirect } from "next/navigation";

import { Card } from "@/components/ui";
import { DashboardShell } from "@/components/dashboard-shell";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getOnboardingStatus } from "@/lib/onboarding";
import { NextStepForm } from "./next-step-form";

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
          <p className="section-description">Pilih satu atau gabungkan — keputusanmu disimpan sebagai langkah kecil.</p>
          <NextStepForm goalId={goalId} />
        </Card>
      </div>
    </DashboardShell>
  );
}
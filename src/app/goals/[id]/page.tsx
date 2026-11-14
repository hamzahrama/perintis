import Link from "next/link";
import { redirect } from "next/navigation";

import { Card, Notice } from "@/components/ui";
import { DashboardShell } from "@/components/dashboard-shell";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getOnboardingStatus } from "@/lib/onboarding";
import { WhyForm } from "./why/why-form";
import { updateWhyAction } from "./why/actions";

export default async function GoalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: goalId } = await params;

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

  const { data: preferences, error: preferencesError } = await supabase
    .from("user_preferences")
    .select("theme")
    .eq("user_id", user.id)
    .maybeSingle();

  if (preferencesError) {
    throw new Error("Preferensi pengguna belum dapat dimuat.");
  }

  if (!preferences) {
    throw new Error("Preferensi pengguna tidak ditemukan.");
  }

  const { data: goal, error: goalError } = await supabase
    .from("goals")
    .select("id, title, description, category, target_date, status")
    .eq("id", goalId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (goalError) {
    throw new Error("Goal tidak dapat dimuat.");
  }

  if (!goal) {
    redirect("/goals");
  }

  const { data: why, error: whyError } = await supabase
    .from("goal_whys")
    .select("statement, updated_at")
    .eq("goal_id", goalId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (whyError) {
    throw new Error("Alasan goal belum dapat dimuat.");
  }

  return (
    <DashboardShell initialTheme={preferences.theme} activePath="/goals">
      <div className="dashboard-content goals-page goal-detail-page">
        <header className="dashboard-welcome">
          <div>
            <p className="eyebrow">My Direction</p>
            <h1 className="page-title">{goal.title}</h1>
            <p className="dashboard-intro">
              Simpan alasan pribadimu. Ingat mengapa goal ini penting, tanpa tekanan.
            </p>
          </div>
          <Link className="button button--secondary" href="/goals">
            Kembali ke goal
          </Link>
        </header>

        <Card className="goal-detail-summary">
          {goal.description && <p>{goal.description}</p>}
          <div className="goal-meta">
            {goal.category && <span className="goal-category">{goal.category}</span>}
            {goal.target_date && <span className="goal-target">Target: {goal.target_date}</span>}
            <span className="goal-status goal-status--active">{goal.status === "active" ? "Aktif" : "Diarsipkan"}</span>
          </div>
        </Card>

        <Card className="goals-create-card why-card">
          <h2 className="section-title">Remember your why</h2>
          <p className="section-description">
            Tulis alasan personalmu untuk goal ini. Ini bisa kamu lihat lagi kapan saja.
          </p>
          {why?.updated_at && (
            <Notice tone="info">Terakhir diperbarui: {new Date(why.updated_at).toLocaleString("id-ID")}</Notice>
          )}
          <WhyForm goalId={goalId} initialStatement={why?.statement ?? ""} />
        </Card>
      </div>
    </DashboardShell>
  );
}
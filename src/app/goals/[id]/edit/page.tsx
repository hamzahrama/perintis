import { redirect } from "next/navigation";

import { Card } from "@/components/ui";
import { DashboardShell } from "@/components/dashboard-shell";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getOnboardingStatus } from "@/lib/onboarding";
import { GoalEditForm } from "@/app/goals/goal-edit-form";

export default async function GoalEditPage({
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

  return (
    <DashboardShell initialTheme={preferences.theme} activePath="/goals">
      <div className="dashboard-content goals-page">
        <header className="dashboard-welcome">
          <div>
            <p className="eyebrow">My Direction</p>
            <h1 className="page-title">Edit goal</h1>
          </div>
        </header>

        <Card className="goals-create-card">
          <GoalEditForm initialData={{ goalId, ...goal }} />
        </Card>
      </div>
    </DashboardShell>
  );
}
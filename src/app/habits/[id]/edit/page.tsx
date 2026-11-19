import { redirect } from "next/navigation";

import { Card } from "@/components/ui";
import { DashboardShell } from "@/components/dashboard-shell";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getOnboardingStatus } from "@/lib/onboarding";
import { HabitDeleteForm, HabitEditForm } from "../../habit-edit-form";

export default async function EditHabitPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
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

  const [{ data: preferences, error: preferencesError }, { data: habit }] = await Promise.all([
    supabase.from("user_preferences").select("theme").eq("user_id", user.id).maybeSingle(),
    supabase
      .from("habits")
      .select("id, name, description, goal_id, is_active")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  if (preferencesError || !preferences) {
    throw new Error("Preferensi pengguna tidak ditemukan.");
  }

  if (!habit) {
    redirect("/habits");
  }

  return (
    <DashboardShell initialTheme={preferences.theme} activePath="/habits">
      <div className="dashboard-content habits-page">
        <header className="dashboard-welcome">
          <div>
            <p className="eyebrow">My Habits</p>
            <h1 className="page-title">Edit habit</h1>
            <p className="dashboard-intro">Perbarui detail habit atau nonaktifkan bila sudah tidak relevan.</p>
          </div>
          <a href="/habits" className="button button--secondary">Kembali ke habit</a>
        </header>

        <Card className="goals-create-card">
          <HabitEditForm
            habitId={habit.id}
            name={habit.name}
            description={habit.description}
            goalId={habit.goal_id}
            isActive={habit.is_active}
          />
          <HabitDeleteForm habitId={habit.id} />
        </Card>
      </div>
    </DashboardShell>
  );
}
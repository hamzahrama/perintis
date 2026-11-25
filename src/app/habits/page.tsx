import { redirect } from "next/navigation";

import { Card } from "@/components/ui";
import { DashboardShell } from "@/components/dashboard-shell";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getOnboardingStatus } from "@/lib/onboarding";
import { HabitForm } from "./habit-form";
import { HabitLogForm } from "./habit-log-form";
import { ToggleHabitActiveForm } from "./toggle-form";

export default async function HabitsPage() {
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
    throw new Error("Ringkasan dashboard belum dapat dimuat.");
  }

  if (!preferences) {
    throw new Error("Preferensi pengguna tidak ditemukan.");
  }

  const [{ data: activeHabits }, { data: inactiveHabits }] = await Promise.all([
    supabase
      .from("habits")
      .select("id, name, description, goal_id, is_active, created_at")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false }),
    supabase
      .from("habits")
      .select("id, name, description, goal_id, is_active, created_at")
      .eq("user_id", user.id)
      .eq("is_active", false)
      .order("created_at", { ascending: false }),
  ]);

  return (
    <DashboardShell initialTheme={preferences.theme} activePath="/habits">
      <div className="dashboard-content habits-page">
        <header className="dashboard-welcome">
          <div>
            <p className="eyebrow">My Habits</p>
            <h1 className="page-title">Habit kamu</h1>
            <p className="dashboard-intro">
              Bangun kebiasaan kecil yang berkelanjutan. Catat pelaksanaan harian tanpa tekanan streak.
            </p>
          </div>
        </header>

        <section aria-labelledby="create-habit-title">
          <Card className="goals-create-card">
            <h2 className="section-title" id="create-habit-title">Buat habit baru</h2>
            <HabitForm />
          </Card>
        </section>

        <section aria-labelledby="active-habits-title" className="goals-section">
          <h2 className="section-title" id="active-habits-title">
            Habit aktif <span className="panel-count">{(activeHabits?.length ?? 0)}</span>
          </h2>
          {activeHabits && activeHabits.length > 0 ? (
            <ul className="habits-list">
              {activeHabits.map((habit) => (
                <li key={habit.id} className="habit-card">
                  <article>
                    <header className="habit-header">
                      <h3>{habit.name}</h3>
                      <span className="habit-status habit-status--active">Aktif</span>
                    </header>
                    {habit.description && <p className="habit-description">{habit.description}</p>}
                    <div className="habit-meta">
                      {habit.goal_id && <span className="habit-goal">Kait ke goal</span>}
                    </div>
                  </article>
                  <div className="habit-actions">
                    <a href={`/habits/${habit.id}/edit`} className="button button--secondary">
                      Edit
                    </a>
                    <ToggleHabitActiveForm habitId={habit.id} isActive={true} />
                    <HabitLogForm habitId={habit.id} />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="dashboard-empty">
              <h3>Belum ada habit aktif</h3>
              <p>Mulai dari satu kebiasaan kecil yang bisa kamu lakukan hari ini.</p>
            </div>
          )}
        </section>

        {(inactiveHabits && inactiveHabits.length > 0) && (
          <section aria-labelledby="inactive-habits-title" className="goals-section">
            <h2 className="section-title" id="inactive-habits-title">
              Habit tidak aktif <span className="panel-count">{inactiveHabits.length}</span>
            </h2>
            <ul className="habits-list habits-list--inactive">
              {inactiveHabits.map((habit) => (
                <li key={habit.id} className="habit-card">
                  <article>
                    <header className="habit-header">
                      <h3>{habit.name}</h3>
                      <span className="habit-status habit-status--inactive">Tidak aktif</span>
                    </header>
                    {habit.description && <p className="habit-description">{habit.description}</p>}
                  </article>
                  <div className="habit-actions">
                    <a href={`/habits/${habit.id}/edit`} className="button button--secondary">
                      Edit
                    </a>
                    <ToggleHabitActiveForm habitId={habit.id} isActive={false} />
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </DashboardShell>
  );
}

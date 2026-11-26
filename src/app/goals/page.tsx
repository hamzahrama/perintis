import { redirect } from "next/navigation";

import { Card } from "@/components/ui";
import { DashboardShell } from "@/components/dashboard-shell";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getOnboardingStatus } from "@/lib/onboarding";
import { GoalForm } from "./goal-form";
import { ArchiveButton } from "./archive-button";

export default async function GoalsPage() {
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

  const [{ data: activeGoals }, { data: archivedGoals }] = await Promise.all([
    supabase
      .from("goals")
      .select("id, title, description, category, target_date, status, created_at")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("created_at", { ascending: false }),
    supabase
      .from("goals")
      .select("id, title, description, category, target_date, status, created_at, archived_at")
      .eq("user_id", user.id)
      .eq("status", "archived")
      .order("archived_at", { ascending: false }),
  ]);

  return (
    <DashboardShell initialTheme={preferences.theme} activePath="/goals">
      <div className="dashboard-content goals-page">
        <header className="dashboard-welcome">
          <div>
            <p className="eyebrow">My Direction</p>
            <h1 className="page-title">Goal kamu</h1>
            <p className="dashboard-intro">
              Daftar tujuan yang sedang kamu bangun. Buat baru, edit, atau arsipkan yang sudah selesai.
            </p>
          </div>
        </header>

        <section aria-labelledby="create-goal-title">
          <Card className="goals-create-card">
            <h2 className="section-title" id="create-goal-title">Buat goal baru</h2>
            <GoalForm />
          </Card>
        </section>

        <section aria-labelledby="active-goals-title" className="goals-section">
          <h2 className="section-title" id="active-goals-title">
            Goal aktif <span className="panel-count">{(activeGoals?.length ?? 0)}</span>
          </h2>
          {activeGoals && activeGoals.length > 0 ? (
            <ul className="goals-list">
              {activeGoals.map((goal) => (
                <li key={goal.id} className="goal-card">
                  <article>
                    <header className="goal-header">
                      <h3>{goal.title}</h3>
                      <span className="goal-status goal-status--active">Aktif</span>
                    </header>
                    {goal.description && <p className="goal-description">{goal.description}</p>}
                    <div className="goal-meta">
                      {goal.category && <span className="goal-category">{goal.category}</span>}
                      {goal.target_date && <span className="goal-target">Target: {goal.target_date}</span>}
                    </div>
                  </article>
                  <div className="goal-actions">
                    <a href={`/goals/${goal.id}`} className="button button--secondary">
                      Detail &amp; Why
                    </a>
                    <a href={`/goals/${goal.id}/edit`} className="button button--secondary">
                      Edit
                    </a>
                    <a href={`/goals/${goal.id}/roadmap`} className="button button--secondary">
                      Roadmap
                    </a>
                    <ArchiveButton goalId={goal.id} />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="dashboard-empty">
              <h3>Belum ada goal aktif</h3>
              <p>Mulai dari satu arah yang terasa penting bagimu.</p>
            </div>
          )}
        </section>

        {(archivedGoals && archivedGoals.length > 0) && (
          <section aria-labelledby="archived-goals-title" className="goals-section">
            <h2 className="section-title" id="archived-goals-title">
              Goal diarsipkan <span className="panel-count">{archivedGoals.length}</span>
            </h2>
            <ul className="goals-list goals-list--archived">
              {archivedGoals.map((goal) => (
                <li key={goal.id} className="goal-card">
                  <article>
                    <header className="goal-header">
                      <h3>{goal.title}</h3>
                      <span className="goal-status goal-status--archived">Diarsipkan</span>
                    </header>
                    {goal.description && <p className="goal-description">{goal.description}</p>}
                    <div className="goal-meta">
                      {goal.category && <span className="goal-category">{goal.category}</span>}
                      {goal.target_date && <span className="goal-target">Target: {goal.target_date}</span>}
                      {goal.archived_at && (
                        <span className="goal-archived-at">
                          Diarsipkan: {new Date(goal.archived_at).toLocaleDateString("id-ID")}
                        </span>
                      )}
                    </div>
                  </article>
                  <div className="goal-actions">
                    <a href={`/goals/${goal.id}`} className="button button--secondary">
                      Detail &amp; Why
                    </a>
                    <a href={`/goals/${goal.id}/edit`} className="button button--secondary">
                      Edit
                    </a>
                    <a href={`/goals/${goal.id}/roadmap`} className="button button--secondary">
                      Roadmap
                    </a>
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

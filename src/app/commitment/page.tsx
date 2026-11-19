import { redirect } from "next/navigation";
import { Card } from "@/components/ui";
import { DashboardShell } from "@/components/dashboard-shell";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getOnboardingStatus } from "@/lib/onboarding";
import { CommitmentForm } from "./form";
import { DisableCommitmentForm } from "./disable-form";
import { CommitmentEditForm } from "./commitment-edit-form";

export default async function CommitmentPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) redirect("/login");
  const { completed } = await getOnboardingStatus();
  if (!completed) redirect("/onboarding");
  const [{ data: preferences }, { data: commitments }] = await Promise.all([
    supabase.from("user_preferences").select("theme").eq("user_id", user.id).maybeSingle(),
    supabase.from("commitments").select("id, description, goal_id, activity_id, is_active, created_at").eq("user_id", user.id).order("created_at", { ascending: false }),
  ]);
  if (!preferences) throw new Error("Preferensi pengguna tidak ditemukan.");
  return (
    <DashboardShell initialTheme={preferences.theme} activePath="/commitment">
      <div className="dashboard-content daily-page">
        <header className="dashboard-welcome">
          <div>
            <p className="eyebrow">My Commitment</p>
            <h1 className="page-title">Komitmen yang kamu pilih</h1>
            <p className="dashboard-intro">Komitmen bersifat sukarela, aman, proporsional, dan dapat dihentikan kapan saja.</p>
          </div>
        </header>
        <Card className="goals-create-card">
          <h2 className="section-title">Buat komitmen</h2>
          <CommitmentForm />
        </Card>
        <section className="goals-section">
          <h2 className="section-title">Daftar komitmen</h2>
          {commitments && commitments.length > 0 ? (
            <ul className="activity-list">
              {commitments.map((item) => (
                <li className="activity-card" key={item.id}>
                  <div className="activity-content">
                    <h3>{item.description}</h3>
                    <span className="item-meta">{item.is_active ? "Aktif" : "Tidak aktif"}</span>
                  </div>
                  {item.is_active && (
                    <>
                      <CommitmentEditForm
                        commitmentId={item.id}
                        description={item.description}
                        goalId={item.goal_id}
                        activityId={item.activity_id}
                      />
                      <DisableCommitmentForm commitmentId={item.id} />
                    </>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <div className="dashboard-empty">
              <h3>Belum ada komitmen</h3>
              <p>Kamu boleh melanjutkan tanpa membuat komitmen.</p>
            </div>
          )}
        </section>
      </div>
    </DashboardShell>
  );
}
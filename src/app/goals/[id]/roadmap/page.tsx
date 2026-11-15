import Link from "next/link";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui";
import { DashboardShell } from "@/components/dashboard-shell";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getOnboardingStatus } from "@/lib/onboarding";
import { RoadmapClient } from "./roadmap-client";
import { CreateRoadmapForm } from "./create-roadmap-form";

export default async function RoadmapPage({ params }: { params: Promise<{ id: string }> }) {
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
  const { data: roadmap } = await supabase.from("roadmaps").select("id, status").eq("goal_id", goalId).eq("user_id", user.id).eq("status", "active").maybeSingle();
  const { data: steps } = roadmap ? await supabase.from("roadmap_steps").select("id, title, description, position, status").eq("roadmap_id", roadmap.id).eq("user_id", user.id).order("position", { ascending: true }) : { data: [] };
  return <DashboardShell initialTheme={preferences.theme} activePath="/goals"><div className="dashboard-content goals-page"><header className="dashboard-welcome"><div><p className="eyebrow">My Roadmap</p><h1 className="page-title">{goal.title}</h1><p className="dashboard-intro">Pecah goal menjadi langkah kecil yang bisa kamu kelola.</p></div><Link className="button button--secondary" href={`/goals/${goalId}`}>Kembali ke goal</Link></header>{roadmap ? <Card className="goals-create-card"><h2 className="section-title">Langkah roadmap</h2><RoadmapClient roadmapId={roadmap.id} steps={steps ?? []} /></Card> : <CreateRoadmap goalId={goalId} />}</div></DashboardShell>;
}

function CreateRoadmap({ goalId }: { goalId: string }) {
  return <Card className="goals-create-card"><h2 className="section-title">Buat roadmap</h2><p className="section-description">Susun langkah kecil untuk goal ini. Tidak ada tanggal otomatis.</p><CreateRoadmapForm goalId={goalId} /></Card>;
}
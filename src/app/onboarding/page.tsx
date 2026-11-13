import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/dashboard-shell";
import { Card } from "@/components/ui";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { OnboardingForm } from "./onboarding-form";

export const metadata: Metadata = {
  title: "Onboarding | PERINTIS",
};

export default async function OnboardingPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const { data: onboarding } = await supabase
    .from("onboarding_responses")
    .select("completed_at")
    .eq("user_id", user.id)
    .maybeSingle();

  if (onboarding?.completed_at) {
    redirect("/dashboard");
  }

  return (
    <DashboardShell initialTheme="dark">
      <div className="dashboard-content">
        <p className="eyebrow">Onboarding & Personal Assessment</p>
        <h1 className="page-title">Mengenal dirimu</h1>
        <Card className="dashboard-card">
          <h2 className="section-title">Assessment singkat</h2>
          <p className="section-description">
            Jawaban ini membantu PERINTIS menyesuaikan saran dan panduan untukmu. Bukan diagnosis — hanya
            ringkasan reflektif untuk memulai dengan arah yang lebih jelas.
          </p>
          <OnboardingForm />
        </Card>
      </div>
    </DashboardShell>
  );
}
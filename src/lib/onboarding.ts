import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getOnboardingStatus() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { user: null, completed: false, error: "Sesi pengguna belum dapat diverifikasi." };
  }

  const { data: onboarding, error: onboardingError } = await supabase
    .from("onboarding_responses")
    .select("completed_at")
    .eq("user_id", user.id)
    .maybeSingle();

  if (onboardingError) {
    return { user, completed: false, error: "Status onboarding belum dapat dimuat." };
  }

  return { user, completed: Boolean(onboarding?.completed_at), error: null };
}

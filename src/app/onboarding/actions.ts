"use server";

import { z } from "zod";

import { createSupabaseServerClient } from "@/lib/supabase/server";

import type { OnboardingFormState } from "./onboarding-form";

const onboardingSchema = z.object({
  condition: z.string().trim().min(2, "Kondisi minimal 2 karakter.").max(200),
  interests: z.string().trim().min(2, "Minat minimal 2 karakter.").max(400),
  challenges: z.string().trim().min(2, "Tantangan minimal 2 karakter.").max(400),
  direction: z.string().trim().min(2, "Arah minimal 2 karakter.").max(400),
});

export async function saveOnboardingAction(
  _previousState: OnboardingFormState,
  formData: FormData,
): Promise<OnboardingFormState> {
  const parsed = onboardingSchema.safeParse({
    condition: formData.get("condition"),
    interests: formData.get("interests"),
    challenges: formData.get("challenges"),
    direction: formData.get("direction"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Periksa kembali data." };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "Sesi pengguna belum dapat diverifikasi." };
  }

  const answers = {
    condition: parsed.data.condition,
    interests: parsed.data.interests,
    challenges: parsed.data.challenges,
    direction: parsed.data.direction,
  };

  const { error } = await supabase
    .from("onboarding_responses")
    .upsert(
      {
        user_id: user.id,
        answers,
        completed_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );

  if (error) {
    return { error: "Jawaban onboarding belum dapat disimpan. Silakan coba lagi." };
  }

  return { success: "Onboarding selesai. Selamat datang di PERINTIS!" };
}
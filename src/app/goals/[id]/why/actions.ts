"use server";

import { z } from "zod";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export type WhyFormState = {
  error?: string;
  success?: string;
};

const whySchema = z.object({
  goalId: z.string().trim().min(1),
  statement: z.string().trim().min(1, "Alasan tidak boleh kosong.").max(1000),
});

export async function saveWhyAction(
  _previousState: WhyFormState,
  formData: FormData,
): Promise<WhyFormState> {
  const parsed = whySchema.safeParse({
    goalId: formData.get("goalId"),
    statement: formData.get("statement"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Periksa kembali alasanmu." };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "Sesi pengguna belum dapat diverifikasi." };
  }

  const { data: goal } = await supabase
    .from("goals")
    .select("user_id")
    .eq("id", parsed.data.goalId)
    .maybeSingle();

  if (!goal || goal.user_id !== user.id) {
    return { error: "Goal tidak ditemukan atau bukan milikmu." };
  }

  const { data: existingWhy } = await supabase
    .from("goal_whys")
    .select("id")
    .eq("goal_id", parsed.data.goalId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingWhy) {
    const { error: updateError } = await supabase
      .from("goal_whys")
      .update({ statement: parsed.data.statement })
      .eq("goal_id", parsed.data.goalId)
      .eq("user_id", user.id);

    if (updateError) {
      return { error: "Alasan belum dapat diperbarui. Silakan coba lagi." };
    }
  } else {
    const { error: insertError } = await supabase
      .from("goal_whys")
      .insert({
        goal_id: parsed.data.goalId,
        user_id: user.id,
        statement: parsed.data.statement,
      });

    if (insertError) {
      return { error: "Alasan belum dapat disimpan. Silakan coba lagi." };
    }
  }

  return { success: "Alasan goal tersimpan." };
}

export async function updateWhyAction(
  _previousState: WhyFormState,
  formData: FormData,
): Promise<WhyFormState> {
  return saveWhyAction(_previousState, formData);
}
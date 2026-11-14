"use server";

import { z } from "zod";

import { createSupabaseServerClient } from "@/lib/supabase/server";

import type { GoalFormState } from "./goal-form";

const goalSchema = z.object({
  goalId: z.string().trim().min(1),
  title: z.string().trim().min(1, "Judul tidak boleh kosong.").max(200),
  description: z.string().trim().max(1000).optional().or(z.literal("")),
  category: z.string().trim().max(100).optional().or(z.literal("")),
  target_date: z.string().trim().optional().or(z.literal("")),
  status: z.enum(["active", "archived"]),
});

export async function createGoalAction(
  prevState: GoalFormState,
  formData: FormData,
): Promise<GoalFormState> {
  const parsed = goalSchema
    .omit({ goalId: true })
    .safeParse({
      title: formData.get("title"),
      description: formData.get("description") ?? "",
      category: formData.get("category") ?? "",
      target_date: formData.get("target_date") ?? "",
      status: formData.get("status"),
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

  const { error } = await supabase.from("goals").insert({
    user_id: user.id,
    title: parsed.data.title,
    description: parsed.data.description ?? null,
    category: parsed.data.category ?? null,
    target_date: parsed.data.target_date ?? null,
    status: parsed.data.status,
  });

  if (error) {
    return { error: "Goal belum dapat disimpan. Silakan coba lagi." };
  }

  return { success: "Goal baru disimpan. Lanjut ke My Direction." };
}

export async function updateGoalAction(
  prevState: GoalFormState,
  formData: FormData,
): Promise<GoalFormState> {
  const parsed = goalSchema.safeParse({
    goalId: formData.get("goalId"),
    title: formData.get("title"),
    description: formData.get("description") ?? "",
    category: formData.get("category") ?? "",
    target_date: formData.get("target_date") ?? "",
    status: formData.get("status"),
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

  const { data: goal } = await supabase
    .from("goals")
    .select("user_id")
    .eq("id", parsed.data.goalId)
    .maybeSingle();

  if (!goal || goal.user_id !== user.id) {
    return { error: "Goal tidak ditemukan atau Anda tidak berhak mengeditnya." };
  }

  const { error } = await supabase
    .from("goals")
    .update({
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      category: parsed.data.category ?? null,
      target_date: parsed.data.target_date ?? null,
      status: parsed.data.status,
    })
    .eq("id", parsed.data.goalId)
    .eq("user_id", user.id);

  if (error) {
    return { error: "Goal belum dapat diperbarui. Silakan coba lagi." };
  }

  return { success: "Goal diperbarui." };
}

export async function archiveGoalAction(
  _previousState: GoalFormState,
  formData: FormData,
): Promise<GoalFormState> {
  const goalId = String(formData.get("goalId") ?? "").trim();
  if (!goalId) {
    return { error: "Goal tidak ditemukan." };
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
    .eq("id", goalId)
    .maybeSingle();

  if (!goal || goal.user_id !== user.id) {
    return { error: "Goal tidak ditemukan atau Anda tidak berhak mengarsipkannya." };
  }

  const { error } = await supabase
    .from("goals")
    .update({ status: "archived", archived_at: new Date().toISOString() })
    .eq("id", goalId)
    .eq("user_id", user.id);

  if (error) {
    return { error: "Goal belum dapat diarsipkan. Silakan coba lagi." };
  }

  return { success: "Goal diarsipkan." };
}
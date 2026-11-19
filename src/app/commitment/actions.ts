"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type CommitmentState = { error?: string; success?: string };
const schema = z.object({ description: z.string().trim().min(1, "Komitmen wajib diisi.").max(500), goalId: z.string().uuid().optional().or(z.literal("")), activityId: z.string().uuid().optional().or(z.literal("")) });

async function validateTargets(supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>, userId: string, goalId: string, activityId: string): Promise<string | null> {
  if (goalId && activityId) return "Pilih goal atau aktivitas, bukan keduanya.";
  if (goalId) {
    const { data } = await supabase.from("goals").select("id").eq("id", goalId).eq("user_id", userId).maybeSingle();
    if (!data) return "Goal tidak ditemukan.";
  }
  if (activityId) {
    const { data } = await supabase.from("activities").select("id").eq("id", activityId).eq("user_id", userId).maybeSingle();
    if (!data) return "Aktivitas tidak ditemukan.";
  }
  return null;
}

export async function saveCommitmentAction(_prev: CommitmentState, formData: FormData): Promise<CommitmentState> {
  const parsed = schema.safeParse({ description: formData.get("description"), goalId: formData.get("goalId") ?? "", activityId: formData.get("activityId") ?? "" });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Komitmen tidak valid." };
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Sesi tidak valid." };
  const targetError = await validateTargets(supabase, user.id, parsed.data.goalId ?? "", parsed.data.activityId ?? "");
  if (targetError) return { error: targetError };
  const { error } = await supabase.from("commitments").insert({ user_id: user.id, description: parsed.data.description, goal_id: parsed.data.goalId || null, activity_id: parsed.data.activityId || null });
  if (error) return { error: "Komitmen belum dapat disimpan." };
  revalidatePath("/commitment");
  return { success: "Komitmen disimpan secara sukarela." };
}

export async function editCommitmentAction(_prev: CommitmentState, formData: FormData): Promise<CommitmentState> {
  const id = String(formData.get("commitmentId") ?? "").trim();
  if (!z.string().uuid().safeParse(id).success) return { error: "Komitmen tidak valid." };
  const parsed = schema.safeParse({ description: formData.get("description"), goalId: formData.get("goalId") ?? "", activityId: formData.get("activityId") ?? "" });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Komitmen tidak valid." };

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Sesi tidak valid." };

  const { data: existing } = await supabase.from("commitments").select("id, is_active").eq("id", id).eq("user_id", user.id).maybeSingle();
  if (!existing) return { error: "Komitmen tidak ditemukan." };
  if (!existing.is_active) return { error: "Komitmen tidak aktif." };

  const targetError = await validateTargets(supabase, user.id, parsed.data.goalId ?? "", parsed.data.activityId ?? "");
  if (targetError) return { error: targetError };

  const { error } = await supabase.from("commitments").update({
    description: parsed.data.description,
    goal_id: parsed.data.goalId || null,
    activity_id: parsed.data.activityId || null,
    updated_at: new Date().toISOString(),
  }).eq("id", id).eq("user_id", user.id);
  if (error) return { error: "Komitmen belum dapat diperbarui." };
  revalidatePath("/commitment");
  return { success: "Komitmen diperbarui." };
}

export async function disableCommitmentAction(_prev: CommitmentState, formData: FormData): Promise<CommitmentState> {
  const id = String(formData.get("commitmentId") ?? "");
  if (!z.string().uuid().safeParse(id).success) return { error: "Komitmen tidak valid." };
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Sesi tidak valid." };
  const { error } = await supabase.from("commitments").update({ is_active: false }).eq("id", id).eq("user_id", user.id);
  if (error) return { error: "Komitmen belum dapat dinonaktifkan." };
  revalidatePath("/commitment");
  return { success: "Komitmen dinonaktifkan." };
}
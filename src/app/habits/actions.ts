"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type HabitFormState = { error?: string; success?: string };

const createHabitSchema = z.object({
  name: z.string().trim().min(1, "Nama habit wajib diisi.").max(100),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  goalId: z.string().uuid().optional().or(z.literal("")),
});

export async function createHabitAction(_prev: HabitFormState, formData: FormData): Promise<HabitFormState> {
  const parsed = createHabitSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") ?? "",
    goalId: formData.get("goalId") ?? "",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Data habit tidak valid." };

  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return { error: "Sesi tidak valid." };

  if (parsed.data.goalId) {
    const { data: goal } = await supabase.from("goals").select("id").eq("id", parsed.data.goalId).eq("user_id", user.id).maybeSingle();
    if (!goal) return { error: "Goal tidak ditemukan." };
  }

  const { error } = await supabase.from("habits").insert({
    user_id: user.id,
    name: parsed.data.name,
    description: parsed.data.description || null,
    goal_id: parsed.data.goalId || null,
  });
  if (error) return { error: "Gagal menyimpan habit." };
  revalidatePath("/habits");
  return { success: "Habit ditambahkan." };
}

const updateHabitSchema = z.object({
  habitId: z.string().uuid(),
  name: z.string().trim().min(1).max(100).optional(),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  goalId: z.string().uuid().optional().or(z.literal("")),
  isActive: z.boolean().optional(),
});

export async function updateHabitAction(_prev: HabitFormState, formData: FormData): Promise<HabitFormState> {
  const parsed = updateHabitSchema.safeParse({
    habitId: formData.get("habitId"),
    name: formData.get("name") || undefined,
    description: formData.get("description") ?? undefined,
    goalId: formData.get("goalId") ?? undefined,
    isActive: formData.has("isActive") ? formData.get("isActive") === "true" : undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };

  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return { error: "Sesi tidak valid." };

  const { data: habit } = await supabase.from("habits").select("id, user_id").eq("id", parsed.data.habitId).eq("user_id", user.id).maybeSingle();
  if (!habit) return { error: "Habit tidak ditemukan." };

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (parsed.data.name !== undefined) updates.name = parsed.data.name;
  if (parsed.data.description !== undefined) updates.description = parsed.data.description || null;
  if (parsed.data.goalId !== undefined) {
    if (parsed.data.goalId) {
      const { data: goal } = await supabase.from("goals").select("id").eq("id", parsed.data.goalId).eq("user_id", user.id).maybeSingle();
      if (!goal) return { error: "Goal tidak ditemukan." };
    }
    updates.goal_id = parsed.data.goalId || null;
  }
  if (parsed.data.isActive !== undefined) updates.is_active = parsed.data.isActive;

  const { error } = await supabase.from("habits").update(updates).eq("id", parsed.data.habitId).eq("user_id", user.id);
  if (error) return { error: "Gagal memperbarui habit." };
  revalidatePath("/habits");
  return { success: "Habit diperbarui." };
}

export async function deleteHabitAction(_prev: HabitFormState, formData: FormData): Promise<HabitFormState> {
  const habitId = String(formData.get("habitId") ?? "").trim();
  if (!habitId) return { error: "Habit tidak ditemukan." };

  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return { error: "Sesi tidak valid." };

  const { data: habit } = await supabase.from("habits").select("id, user_id").eq("id", habitId).eq("user_id", user.id).maybeSingle();
  if (!habit) return { error: "Habit tidak ditemukan." };

  const { error } = await supabase.from("habits").delete().eq("id", habitId).eq("user_id", user.id);
  if (error) return { error: "Gagal menghapus habit." };
  revalidatePath("/habits");
  return { success: "Habit dihapus." };
}

export async function logHabitAction(_prev: HabitFormState, formData: FormData): Promise<HabitFormState> {
  const habitId = String(formData.get("habitId") ?? "").trim();
  const logDate = String(formData.get("logDate") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim();

  if (!habitId || !logDate) return { error: "Habit dan tanggal wajib diisi." };
  const dateParsed = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).safeParse(logDate);
  if (!dateParsed.success) return { error: "Format tanggal tidak valid." };

  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return { error: "Sesi tidak valid." };

  const { data: habit } = await supabase.from("habits").select("id, user_id").eq("id", habitId).eq("user_id", user.id).maybeSingle();
  if (!habit) return { error: "Habit tidak ditemukan." };

  const { error } = await supabase.from("habit_logs").insert({
    habit_id: habitId,
    user_id: user.id,
    log_date: logDate,
    note: note || null,
  });
  if (error?.code === "23505") return { error: "Sudah ada log untuk tanggal ini." };
  if (error) return { error: "Gagal mencatat habit." };

  revalidatePath("/habits");
  return { success: "Habit tercatat." };
}
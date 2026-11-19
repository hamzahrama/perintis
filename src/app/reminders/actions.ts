"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ReminderState = { error?: string; success?: string };
const schema = z.object({ activityId: z.string().uuid(), remindAt: z.string().min(1) });

export async function saveReminderAction(_prev: ReminderState, formData: FormData): Promise<ReminderState> {
  const parsed = schema.safeParse({ activityId: formData.get("activityId"), remindAt: formData.get("remindAt") });
  if (!parsed.success) return { error: "Data reminder tidak valid." };
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Sesi tidak valid." };
  const remindAt = new Date(parsed.data.remindAt).toISOString();
  const { data: activity } = await supabase.from("activities").select("id, title").eq("id", parsed.data.activityId).eq("user_id", user.id).maybeSingle();
  if (!activity) return { error: "Aktivitas tidak ditemukan." };
  const { error } = await supabase.from("reminders").upsert({ activity_id: activity.id, user_id: user.id, remind_at: remindAt, is_enabled: true }, { onConflict: "activity_id" });
  if (error) return { error: "Reminder belum dapat disimpan." };
  revalidatePath("/reminders");
  return { success: "Reminder disimpan." };
}

export async function disableReminderAction(_prev: ReminderState, formData: FormData): Promise<ReminderState> {
  const id = String(formData.get("reminderId") ?? "");
  if (!z.string().uuid().safeParse(id).success) return { error: "Reminder tidak valid." };
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Sesi tidak valid." };
  const { error } = await supabase.from("reminders").update({ is_enabled: false }).eq("id", id).eq("user_id", user.id);
  if (error) return { error: "Reminder belum dapat dinonaktifkan." };
  revalidatePath("/reminders");
  return { success: "Reminder dinonaktifkan." };
}
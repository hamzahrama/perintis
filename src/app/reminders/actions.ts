"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ReminderState = { error?: string; success?: string };

const datetimeLocalRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
const schema = z.object({
  activityId: z.string().uuid("Aktivitas tidak valid."),
  remindAt: z.string().regex(datetimeLocalRegex, "Format tanggal/jam tidak valid."),
});

function parseRemindAt(value: string): { date: Date; error: string | null } {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) {
    return { date: d, error: "Format tanggal/jam tidak valid." };
  }
  return { date: d, error: null };
}

export async function saveReminderAction(_prev: ReminderState, formData: FormData): Promise<ReminderState> {
  const parsed = schema.safeParse({ activityId: formData.get("activityId"), remindAt: formData.get("remindAt") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Data reminder tidak valid." };

  const { date: remindAtDate, error: parseError } = parseRemindAt(parsed.data.remindAt);
  if (parseError) return { error: parseError };

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Sesi tidak valid." };

  const remindAt = remindAtDate.toISOString();
  const { data: activity } = await supabase.from("activities").select("id, title").eq("id", parsed.data.activityId).eq("user_id", user.id).maybeSingle();
  if (!activity) return { error: "Aktivitas tidak ditemukan." };
  const { error } = await supabase.from("reminders").upsert({ activity_id: activity.id, user_id: user.id, remind_at: remindAt, is_enabled: true }, { onConflict: "activity_id" });
  if (error) return { error: "Reminder belum dapat disimpan." };
  revalidatePath("/reminders");
  return { success: "Reminder disimpan." };
}

export async function markNotificationReadAction(_prev: ReminderState, formData: FormData): Promise<ReminderState> {
  const schemaId = z.object({ notificationId: z.string().uuid("Notifikasi tidak valid.") });
  const parsed = schemaId.safeParse({ notificationId: formData.get("notificationId") });
  if (!parsed.success) return { error: "Notifikasi tidak valid." };

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Sesi tidak valid." };

  const now = new Date().toISOString();
  const { error } = await supabase.from("notifications").update({ read_at: now }).eq("id", parsed.data.notificationId).eq("user_id", user.id);
  if (error) return { error: "Notifikasi belum dapat ditandai dibaca." };
  revalidatePath("/reminders");
  return { success: "Notifikasi ditandai dibaca." };
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

"use server";

import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ActivityFormState = { error?: string; success?: string };

const activitySchema = z.object({
  title: z.string().trim().min(1, "Judul aktivitas wajib diisi.").max(200),
  description: z.string().trim().max(1000).optional().or(z.literal("")),
  scheduledAt: z.string().trim().optional().or(z.literal("")),
});

export async function createActivityAction(_previous: ActivityFormState, formData: FormData): Promise<ActivityFormState> {
  const parsed = activitySchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") ?? "",
    scheduledAt: formData.get("scheduledAt") ?? "",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Periksa aktivitas." };

  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return { error: "Sesi pengguna belum dapat diverifikasi." };

  const { error } = await supabase.from("activities").insert({
    user_id: user.id,
    title: parsed.data.title,
    description: parsed.data.description || null,
    scheduled_at: parsed.data.scheduledAt ? new Date(parsed.data.scheduledAt).toISOString() : null,
    status: "not_started",
  });
  if (error) return { error: "Aktivitas belum dapat disimpan. Silakan coba lagi." };
  return { success: "Aktivitas ditambahkan." };
}

export async function updateActivityStatusAction(_previous: ActivityFormState, formData: FormData): Promise<ActivityFormState> {
  const activityId = String(formData.get("activityId") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();
  const statusParsed = z.enum(["not_started", "in_progress", "completed"]).safeParse(status);
  if (!activityId || !statusParsed.success) return { error: "Status aktivitas tidak valid." };

  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return { error: "Sesi pengguna belum dapat diverifikasi." };

  const { error } = await supabase.from("activities").update({
    status: statusParsed.data,
    completed_at: statusParsed.data === "completed" ? new Date().toISOString() : null,
  }).eq("id", activityId).eq("user_id", user.id);
  if (error) return { error: "Status aktivitas belum dapat disimpan." };
  return { success: "Status diperbarui." };
}

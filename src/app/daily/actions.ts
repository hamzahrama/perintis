"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ActivityFormState = { error?: string; success?: string };

const activitySchema = z.object({
  title: z.string().trim().min(1, "Judul aktivitas wajib diisi.").max(200),
  description: z.string().trim().max(1000).optional().or(z.literal("")),
  scheduledAt: z.string().trim().optional().or(z.literal("")),
});

const validStatuses = ["not_started", "in_progress", "completed", "rescheduled", "skipped"] as const;
type ValidStatus = (typeof validStatuses)[number];
const statusSchema = z.enum(validStatuses);
const allowedTransitions: Record<ValidStatus, readonly ValidStatus[]> = {
  not_started: ["in_progress", "completed", "rescheduled", "skipped"],
  in_progress: ["not_started", "completed", "rescheduled", "skipped"],
  rescheduled: ["not_started", "in_progress", "completed", "skipped"],
  completed: ["not_started"],
  skipped: ["not_started", "rescheduled"],
};

async function logStatusEvent(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  userId: string,
  activityId: string,
  fromStatus: ValidStatus | null,
  toStatus: ValidStatus,
  previousScheduledAt: string | null,
  newScheduledAt: string | null,
) {
  const { error } = await supabase.from("activity_status_events").insert({
    activity_id: activityId,
    user_id: userId,
    from_status: fromStatus,
    to_status: toStatus,
    previous_scheduled_at: previousScheduledAt,
    new_scheduled_at: newScheduledAt,
  });
  return error;
}

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

  const scheduledAt = parsed.data.scheduledAt ? new Date(parsed.data.scheduledAt).toISOString() : null;
  const { error } = await supabase.from("activities").insert({
    user_id: user.id,
    title: parsed.data.title,
    description: parsed.data.description || null,
    scheduled_at: scheduledAt,
    status: "not_started",
  });
  if (error) return { error: "Aktivitas belum dapat disimpan. Silakan coba lagi." };

  revalidatePath("/daily");
  return { success: "Aktivitas ditambahkan." };
}

export async function updateActivityStatusAction(_previous: ActivityFormState, formData: FormData): Promise<ActivityFormState> {
  const activityId = String(formData.get("activityId") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();
  const statusParsed = statusSchema.safeParse(status);
  if (!activityId || !statusParsed.success) return { error: "Status aktivitas tidak valid." };

  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return { error: "Sesi pengguna belum dapat diverifikasi." };

  const { data: activity, error: fetchError } = await supabase
    .from("activities")
    .select("id, status, scheduled_at")
    .eq("id", activityId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (fetchError || !activity) return { error: "Aktivitas tidak ditemukan." };

  const previousStatus = activity.status as ValidStatus;
  const previousScheduledAt = activity.scheduled_at;

  if (!allowedTransitions[previousStatus].includes(statusParsed.data)) {
    return { error: `Transisi dari ${previousStatus} ke ${statusParsed.data} tidak diizinkan.` };
  }

  const updateData: { status: ValidStatus; completed_at?: string | null } = { status: statusParsed.data };
  if (statusParsed.data === "completed") {
    updateData.completed_at = new Date().toISOString();
  } else {
    updateData.completed_at = null;
  }

  const { error } = await supabase.from("activities").update(updateData).eq("id", activityId).eq("user_id", user.id);
  if (error) return { error: "Status aktivitas belum dapat disimpan." };

  const eventError = await logStatusEvent(supabase, user.id, activityId, previousStatus, statusParsed.data, previousScheduledAt, previousScheduledAt);
  if (eventError) return { error: "Status tersimpan, tetapi riwayat belum tercatat." };
  revalidatePath("/daily");
  return { success: "Status diperbarui." };
}

export async function rescheduleActivityAction(_previous: ActivityFormState, formData: FormData): Promise<ActivityFormState> {
  const activityId = String(formData.get("activityId") ?? "").trim();
  const newScheduledAt = String(formData.get("newScheduledAt") ?? "").trim();
  if (!activityId || !newScheduledAt) return { error: "Aktivitas dan jadwal baru wajib diisi." };

  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return { error: "Sesi pengguna belum dapat diverifikasi." };

  const { data: activity, error: fetchError } = await supabase
    .from("activities")
    .select("id, status, scheduled_at")
    .eq("id", activityId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (fetchError || !activity) return { error: "Aktivitas tidak ditemukan." };

  const previousStatus = activity.status as ValidStatus;
  const previousScheduledAt = activity.scheduled_at;
  const newDate = new Date(newScheduledAt).toISOString();

  if (!allowedTransitions[previousStatus].includes("rescheduled")) {
    return { error: `Transisi dari ${previousStatus} ke rescheduled tidak diizinkan.` };
  }

  const { error } = await supabase.from("activities").update({
    status: "rescheduled",
    scheduled_at: newDate,
    completed_at: null,
  }).eq("id", activityId).eq("user_id", user.id);
  if (error) return { error: "Reschedule gagal." };

  const eventError = await logStatusEvent(supabase, user.id, activityId, previousStatus, "rescheduled", previousScheduledAt, newDate);
  if (eventError) return { error: "Jadwal berubah, tetapi riwayat belum tercatat." };
  revalidatePath("/daily");
  return { success: "Aktivitas dijadwalkan ulang." };
}

export async function skipActivityAction(_previous: ActivityFormState, formData: FormData): Promise<ActivityFormState> {
  const activityId = String(formData.get("activityId") ?? "").trim();
  if (!activityId) return { error: "Aktivitas tidak ditemukan." };

  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return { error: "Sesi pengguna belum dapat diverifikasi." };

  const { data: activity, error: fetchError } = await supabase
    .from("activities")
    .select("id, status, scheduled_at")
    .eq("id", activityId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (fetchError || !activity) return { error: "Aktivitas tidak ditemukan." };

  const previousStatus = activity.status as ValidStatus;
  const previousScheduledAt = activity.scheduled_at;

  if (!allowedTransitions[previousStatus].includes("skipped")) {
    return { error: `Transisi dari ${previousStatus} ke skipped tidak diizinkan.` };
  }

  const { error } = await supabase.from("activities").update({
    status: "skipped",
    completed_at: null,
  }).eq("id", activityId).eq("user_id", user.id);
  if (error) return { error: "Skip gagal." };

  const eventError = await logStatusEvent(supabase, user.id, activityId, previousStatus, "skipped", previousScheduledAt, previousScheduledAt);
  if (eventError) return { error: "Aktivitas dilewati, tetapi riwayat belum tercatat." };
  revalidatePath("/daily");
  return { success: "Aktivitas dilewati." };
}

export async function reopenActivityAction(_previous: ActivityFormState, formData: FormData): Promise<ActivityFormState> {
  const activityId = String(formData.get("activityId") ?? "").trim();
  if (!activityId) return { error: "Aktivitas tidak ditemukan." };

  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return { error: "Sesi pengguna belum dapat diverifikasi." };

  const { data: activity, error: fetchError } = await supabase
    .from("activities")
    .select("id, status, scheduled_at")
    .eq("id", activityId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (fetchError || !activity) return { error: "Aktivitas tidak ditemukan." };

  if (activity.status !== "completed" && activity.status !== "skipped") {
    return { error: "Hanya aktivitas selesai atau dilewati yang dapat dibuka kembali." };
  }

  const previousStatus = activity.status as ValidStatus;
  const previousScheduledAt = activity.scheduled_at;

  if (!allowedTransitions[previousStatus].includes("not_started")) {
    return { error: `Transisi dari ${previousStatus} ke not_started tidak diizinkan.` };
  }

  const { error } = await supabase.from("activities").update({
    status: "not_started",
    completed_at: null,
  }).eq("id", activityId).eq("user_id", user.id);
  if (error) return { error: "Buka kembali gagal." };

  const eventError = await logStatusEvent(supabase, user.id, activityId, previousStatus, "not_started", previousScheduledAt, previousScheduledAt);
  if (eventError) return { error: "Aktivitas dibuka kembali, tetapi riwayat belum tercatat." };
  revalidatePath("/daily");
  return { success: "Aktivitas dibuka kembali." };
}
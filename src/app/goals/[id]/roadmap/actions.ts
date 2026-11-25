"use server";

import { z } from "zod";

import { createSupabaseServerClient } from "@/lib/supabase/server";

import type { RoadmapFormState, StepFormState } from "./roadmap-form";

const roadmapSchema = z.object({
  goalId: z.string().trim().min(1),
});

export async function createRoadmapAction(
  _previousState: RoadmapFormState,
  formData: FormData,
): Promise<RoadmapFormState> {
  const parsed = roadmapSchema.safeParse({
    goalId: formData.get("goalId"),
  });

  if (!parsed.success) {
    return { error: "Data roadmap tidak valid." };
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
    .select("id, user_id")
    .eq("id", parsed.data.goalId)
    .maybeSingle();

  if (!goal || goal.user_id !== user.id) {
    return { error: "Goal tidak ditemukan atau bukan milikmu." };
  }

  const { error } = await supabase.from("roadmaps").insert({
    goal_id: parsed.data.goalId,
    user_id: user.id,
    status: "active",
  });

  if (error) {
    return { error: "Roadmap belum dapat dibuat. Mungkin sudah ada roadmap aktif untuk goal ini." };
  }

  return { success: "Roadmap dibuat. Tambah langkah untuk melanjutkan." };
}

const stepSchema = z.object({
  roadmapId: z.string().trim().min(1),
  stepId: z.string().trim().min(1),
  title: z.string().trim().min(1, "Judul langkah tidak boleh kosong.").max(200),
  description: z.string().trim().max(1000).optional().or(z.literal("")),
  position: z.coerce.number().int().min(0),
  status: z.enum(["not_started", "in_progress", "completed"]),
});

export async function createStepAction(
  _previousState: StepFormState,
  formData: FormData,
): Promise<StepFormState> {
  const parsed = stepSchema.omit({ stepId: true }).safeParse({
    roadmapId: formData.get("roadmapId"),
    title: formData.get("title"),
    description: formData.get("description") ?? "",
    position: formData.get("position"),
    status: formData.get("status"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data langkah tidak valid." };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "Sesi pengguna belum dapat diverifikasi." };
  }

  const { data: roadmap } = await supabase
    .from("roadmaps")
    .select("id, goal_id, user_id")
    .eq("id", parsed.data.roadmapId)
    .maybeSingle();

  if (!roadmap || roadmap.user_id !== user.id) {
    return { error: "Roadmap tidak ditemukan atau bukan milikmu." };
  }

  const { error } = await supabase.from("roadmap_steps").insert({
    roadmap_id: parsed.data.roadmapId,
    user_id: user.id,
    title: parsed.data.title,
    description: parsed.data.description ?? null,
    position: parsed.data.position,
    status: parsed.data.status,
  });

  if (error) {
    return { error: "Langkah belum dapat disimpan. Silakan coba lagi." };
  }

  return { success: "Langkah ditambahkan." };
}

export async function updateStepAction(
  _previousState: StepFormState,
  formData: FormData,
): Promise<StepFormState> {
  const parsed = stepSchema.safeParse({
    roadmapId: formData.get("roadmapId"),
    stepId: formData.get("stepId"),
    title: formData.get("title"),
    description: formData.get("description") ?? "",
    position: formData.get("position"),
    status: formData.get("status"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data langkah tidak valid." };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "Sesi pengguna belum dapat diverifikasi." };
  }

  const { data: step } = await supabase
    .from("roadmap_steps")
    .select("id, roadmap_id, user_id")
    .eq("id", parsed.data.stepId)
    .maybeSingle();

  if (!step || step.user_id !== user.id) {
    return { error: "Langkah tidak ditemukan atau bukan milikmu." };
  }

  const { error } = await supabase
    .from("roadmap_steps")
    .update({
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      position: parsed.data.position,
      status: parsed.data.status,
    })
    .eq("id", parsed.data.stepId)
    .eq("roadmap_id", parsed.data.roadmapId)
    .eq("user_id", user.id);

  if (error) {
    return { error: "Langkah belum dapat diperbarui. Silakan coba lagi." };
  }

  return { success: "Langkah diperbarui." };
}

export async function deleteStepAction(
  _previousState: StepFormState,
  formData: FormData,
): Promise<StepFormState> {
  const stepId = String(formData.get("stepId") ?? "").trim();

  if (!stepId) {
    return { error: "Langkah tidak ditemukan." };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "Sesi pengguna belum dapat diverifikasi." };
  }

  const { data: step } = await supabase
    .from("roadmap_steps")
    .select("id, roadmap_id, user_id")
    .eq("id", stepId)
    .maybeSingle();

  if (!step || step.user_id !== user.id) {
    return { error: "Langkah tidak ditemukan atau bukan milikmu." };
  }

  const { error } = await supabase
    .from("roadmap_steps")
    .delete()
    .eq("id", stepId)
    .eq("roadmap_id", step.roadmap_id)
    .eq("user_id", user.id);

  if (error) {
    return { error: "Langkah belum dapat dihapus. Silakan coba lagi." };
  }

  return { success: "Langkah dihapus." };
}

const reorderSchema = z.object({
  steps: z
    .array(
      z.object({
        id: z.string().trim().min(1),
        position: z.coerce.number().int().min(0),
      }),
    )
    .min(1),
});

export async function reorderStepsAction(
  _previousState: StepFormState,
  formData: FormData,
): Promise<StepFormState> {
  const raw = formData.get("steps");
  if (typeof raw !== "string" || !raw.trim()) {
    return { error: "Data urutan tidak valid." };
  }

  let parsedSteps;
  try {
    parsedSteps = JSON.parse(raw);
  } catch {
    return { error: "Data urutan tidak valid." };
  }

  const parsed = reorderSchema.safeParse(parsedSteps);

  if (!parsed.success) {
    return { error: "Data urutan tidak valid." };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "Sesi pengguna belum dapat diverifikasi." };
  }

  // Validasi kepemilikan dan keberadaan seluruh step sekaligus sebelum update
  const stepIds = parsed.data.steps.map((s) => s.id);
  const { data: userSteps, error: fetchError } = await supabase
    .from("roadmap_steps")
    .select("id, roadmap_id, user_id, position")
    .in("id", stepIds)
    .eq("user_id", user.id);

  if (fetchError || !userSteps || userSteps.length !== stepIds.length) {
    return { error: "Salah satu langkah tidak ditemukan atau bukan milikmu." };
  }

  // Siapkan map posisi lama untuk rollback jika salah satu update gagal
  const originalPositions = new Map(userSteps.map((s) => [s.id, s.position]));
  const updatedStepIds: string[] = [];

  for (const item of parsed.data.steps) {
    const { error } = await supabase
      .from("roadmap_steps")
      .update({ position: item.position, updated_at: new Date().toISOString() })
      .eq("id", item.id)
      .eq("user_id", user.id);

    if (error) {
      // Rollback posisi yang sudah ter-update
      for (const id of updatedStepIds) {
        const oldPos = originalPositions.get(id);
        if (oldPos !== undefined) {
          await supabase
            .from("roadmap_steps")
            .update({ position: oldPos })
            .eq("id", id)
            .eq("user_id", user.id);
        }
      }
      return { error: "Urutan langkah belum dapat disimpan. Silakan coba lagi." };
    }
    updatedStepIds.push(item.id);
  }

  return { success: "Urutan langkah diperbarui." };
}

export async function setStepStatusAction(
  _previousState: StepFormState,
  formData: FormData,
): Promise<StepFormState> {
  const stepId = String(formData.get("stepId") ?? "").trim();
  const roadmapId = String(formData.get("roadmapId") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();

  if (!stepId || !roadmapId) {
    return { error: "Langkah tidak ditemukan." };
  }

  const statusSchema = z.enum(["not_started", "in_progress", "completed"]);
  const statusParsed = statusSchema.safeParse(status);

  if (!statusParsed.success) {
    return { error: "Status langkah tidak valid." };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "Sesi pengguna belum dapat diverifikasi." };
  }

  const { data: step } = await supabase
    .from("roadmap_steps")
    .select("id, roadmap_id, user_id")
    .eq("id", stepId)
    .maybeSingle();

  if (!step || step.user_id !== user.id) {
    return { error: "Langkah tidak ditemukan atau bukan milikmu." };
  }

  const { error } = await supabase
    .from("roadmap_steps")
    .update({ status: statusParsed.data })
    .eq("id", stepId)
    .eq("roadmap_id", roadmapId)
    .eq("user_id", user.id);

  if (error) {
    return { error: "Status langkah belum dapat disimpan. Silakan coba lagi." };
  }

  return { success: "Status langkah diperbarui." };
}

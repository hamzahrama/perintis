"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type NextStepFormState = { error?: string; success?: string };

const schema = z.object({
  goalId: z.string().uuid("Goal tidak valid."),
  choice: z.array(z.string().trim().min(1)).max(3).default([]),
  custom: z.string().trim().max(500, "Tindakan terlalu panjang.").optional().or(z.literal("")),
  intent: z.enum(["save", "defer", "skip"]),
});

const labels: Record<string, string> = {
  habit: "Latih habit harian (3x seminggu)",
  learn: "Pelajari konsep dasar (30 menit)",
  read: "Baca satu bab buku",
};

export async function saveNextStepAction(
  _previous: NextStepFormState,
  formData: FormData,
): Promise<NextStepFormState> {
  const parsed = schema.safeParse({
    goalId: formData.get("goalId"),
    choice: formData.getAll("choice"),
    custom: formData.get("custom") ?? "",
    intent: formData.get("intent"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Pilihan tidak valid." };

  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return { error: "Sesi pengguna belum dapat diverifikasi." };

  const { data: goal } = await supabase.from("goals").select("id").eq("id", parsed.data.goalId).eq("user_id", user.id).maybeSingle();
  if (!goal) return { error: "Goal tidak ditemukan." };
  if (parsed.data.intent !== "save") return { success: parsed.data.intent === "defer" ? "Pilihan ditunda." : "Pilihan dilewati." };

  const custom = parsed.data.custom || "";
  const titles = [...parsed.data.choice.map((choice) => labels[choice]).filter(Boolean), ...(custom ? [custom] : [])];
  if (titles.length === 0) return { error: "Pilih atau tulis satu tindakan." };

  const { error } = await supabase.from("activities").insert(
    titles.map((title) => ({ user_id: user.id, title, description: "Dipilih dari Know Your Next Step.", status: "not_started" })),
  );
  if (error) return { error: "Pilihan belum dapat disimpan." };
  revalidatePath(`/goals/${parsed.data.goalId}/roadmap/next-step`);
  revalidatePath("/daily");
  return { success: "Pilihan disimpan sebagai aktivitas." };
}
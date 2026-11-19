"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ReflectionState = { error?: string; success?: string };

const schema = z.object({
  reflectionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  wins: z.string().trim().max(500),
  blockers: z.string().trim().max(500),
});

export async function saveReflectionAction(_prev: ReflectionState, formData: FormData): Promise<ReflectionState> {
  const parsed = schema.safeParse({
    reflectionDate: formData.get("reflectionDate"),
    wins: formData.get("wins") ?? "",
    blockers: formData.get("blockers") ?? "",
  });
  if (!parsed.success) return { error: "Data refleksi tidak valid." };

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Sesi tidak valid." };

  const { error } = await supabase.from("daily_reflections").upsert({
    user_id: user.id,
    reflection_date: parsed.data.reflectionDate,
    answers: { wins: parsed.data.wins, blockers: parsed.data.blockers },
  }, { onConflict: "user_id,reflection_date" });
  if (error) return { error: "Refleksi belum dapat disimpan." };
  revalidatePath("/reflection");
  return { success: "Refleksi tersimpan." };
}
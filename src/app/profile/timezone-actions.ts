"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type TimezoneState = { error?: string; success?: string };

const timezoneSchema = z.object({
  timezone: z.string().min(1).max(100),
});

export async function saveTimezoneAction(_prev: TimezoneState, formData: FormData): Promise<TimezoneState> {
  const parsed = timezoneSchema.safeParse({ timezone: formData.get("timezone") });
  if (!parsed.success) return { error: "Zona waktu tidak valid." };
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: parsed.data.timezone }).format();
  } catch {
    return { error: "Zona waktu tidak valid." };
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Sesi tidak valid." };

  const { error } = await supabase.from("user_preferences").update({ timezone: parsed.data.timezone }).eq("user_id", user.id);
  if (error) return { error: "Zona waktu belum dapat disimpan." };
  revalidatePath("/profile");
  return { success: "Zona waktu disimpan." };
}

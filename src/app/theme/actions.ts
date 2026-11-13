"use server";

import { z } from "zod";

import { createSupabaseServerClient } from "@/lib/supabase/server";

const themeSchema = z.enum(["dark", "light"]);

export async function saveThemeAction(value: unknown) {
  const parsed = themeSchema.safeParse(value);
  if (!parsed.success) {
    throw new Error("Pilihan tema tidak valid.");
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw new Error("Sesi pengguna belum dapat diverifikasi.");
  }

  if (!user) {
    throw new Error("Silakan masuk untuk menyimpan preferensi tema.");
  }

  const { data, error } = await supabase
    .from("user_preferences")
    .update({ theme: parsed.data })
    .eq("user_id", user.id)
    .select("user_id")
    .maybeSingle();

  if (error) {
    throw new Error("Preferensi tema belum dapat disimpan.");
  }

  if (!data) {
    throw new Error("Preferensi pengguna tidak ditemukan.");
  }
}

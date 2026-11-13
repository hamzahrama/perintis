"use server";

import { z } from "zod";

import { createSupabaseServerClient } from "@/lib/supabase/server";

import type { ProfileFormState } from "./profile-form";

const profileSchema = z.object({
  fullName: z.string().trim().min(2, "Nama minimal 2 karakter.").max(80),
});

export async function updateProfileAction(
  _previousState: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const parsed = profileSchema.safeParse({
    fullName: formData.get("fullName"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Periksa kembali data." };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "Sesi pengguna belum dapat diverifikasi." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: parsed.data.fullName })
    .eq("user_id", user.id);

  if (error) {
    return { error: "Profil belum dapat disimpan. Silakan coba lagi." };
  }

  const { error: metadataError } = await supabase.auth.updateUser({
    data: { full_name: parsed.data.fullName },
  });

  if (metadataError) {
    return {
      error:
        "Nama profil tersimpan, tetapi data akun belum tersinkron. Muat ulang sebelum melanjutkan.",
    };
  }

  return { success: "Profil berhasil disimpan." };
}

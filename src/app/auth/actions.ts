"use server";

import { z } from "zod";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getOnboardingStatus } from "@/lib/onboarding";

import type { AuthFormState } from "./auth-form";

const registerSchema = z
  .object({
    fullName: z.string().trim().min(2, "Nama minimal 2 karakter.").max(80),
    email: z.email("Masukkan email yang valid.").trim().toLowerCase(),
    password: z.string().min(8, "Password minimal 8 karakter.").max(128),
    confirmPassword: z.string(),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Konfirmasi password tidak sama.",
    path: ["confirmPassword"],
  });

const loginSchema = z.object({
  email: z.email("Masukkan email yang valid.").trim().toLowerCase(),
  password: z.string().min(1, "Masukkan password."),
});

export async function registerAction(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = registerSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Periksa kembali data." };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName },
    },
  });

  if (error) {
    return { error: "Akun belum dapat dibuat. Periksa email dan coba lagi." };
  }

  if (!data.session) {
    return {
      error:
        "Pendaftaran belum membuat sesi. Periksa pengaturan konfirmasi email Supabase.",
    };
  }

  redirect("/onboarding");
}

export async function loginAction(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Periksa kembali data." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: "Email atau password tidak sesuai." };
  }

  const { completed } = await getOnboardingStatus();
  redirect(completed ? "/dashboard" : "/onboarding");
}

export async function logoutAction() {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error("Sesi belum dapat diakhiri. Silakan coba lagi.");
  }

  redirect("/login");
}

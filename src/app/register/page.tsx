import type { Metadata } from "next";

import { registerAction } from "@/app/auth/actions";
import { AuthForm } from "@/app/auth/auth-form";

export const metadata: Metadata = {
  title: "Buat akun | PERINTIS",
};

export default function RegisterPage() {
  return <AuthForm action={registerAction} mode="register" />;
}

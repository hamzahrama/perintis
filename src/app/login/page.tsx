import type { Metadata } from "next";

import { loginAction } from "@/app/auth/actions";
import { AuthForm } from "@/app/auth/auth-form";

export const metadata: Metadata = {
  title: "Masuk | PERINTIS",
};

export default function LoginPage() {
  return <AuthForm action={loginAction} mode="login" />;
}

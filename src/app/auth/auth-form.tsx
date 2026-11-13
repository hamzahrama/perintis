"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Button, Notice, TextInput } from "@/components/ui";

export type AuthFormState = {
  error?: string;
};

type AuthAction = (
  previousState: AuthFormState,
  formData: FormData,
) => Promise<AuthFormState>;

type AuthFormProps = {
  mode: "login" | "register";
  action: AuthAction;
};

export function AuthForm({ mode, action }: AuthFormProps) {
  const [state, formAction, isPending] = useActionState(action, {});
  const isRegister = mode === "register";

  return (
    <main className="auth-layout">
      <header className="auth-header">
        <Link className="brand" href="/">
          PERINTIS
        </Link>
      </header>
      <section aria-labelledby="auth-title" className="card auth-card">
        <h1 className="auth-title" id="auth-title">
          {isRegister ? "Buat akun" : "Masuk"}
        </h1>
        <p className="auth-description">
          {isRegister
            ? "Mulai langkah kecilmu dengan membuat akun."
            : "Lanjutkan perjalananmu di PERINTIS."}
        </p>

        <form action={formAction} className="auth-form">
          {isRegister && (
            <label className="form-field">
              Nama
              <TextInput
                autoComplete="name"
                maxLength={80}
                name="fullName"
                required
              />
            </label>
          )}

          <label className="form-field">
            Email
            <TextInput
              autoComplete="email"
              name="email"
              required
              type="email"
            />
          </label>

          <label className="form-field">
            Password
            <TextInput
              autoComplete={isRegister ? "new-password" : "current-password"}
              minLength={isRegister ? 8 : undefined}
              name="password"
              required
              type="password"
            />
          </label>
          {isRegister && (
            <label className="form-field">
              Konfirmasi password
              <TextInput
                autoComplete="new-password"
                minLength={8}
                name="confirmPassword"
                required
                type="password"
              />
            </label>
          )}

          {state.error && (
            <Notice tone="error">{state.error}</Notice>
          )}

          <Button fullWidth disabled={isPending} type="submit">
            {isPending ? "Memproses..." : isRegister ? "Buat akun" : "Masuk"}
          </Button>
        </form>

        <p className="auth-switch">
          {isRegister ? "Sudah punya akun?" : "Belum punya akun?"}{" "}
          <Link className="text-link" href={isRegister ? "/login" : "/register"}>
            {isRegister ? "Masuk" : "Daftar"}
          </Link>
        </p>
      </section>
    </main>
  );
}

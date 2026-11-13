"use client";

import { useActionState } from "react";

import { updateProfileAction } from "./actions";
import { Button, Notice, TextInput } from "@/components/ui";

export type ProfileFormState = {
  error?: string;
  success?: string;
};

type ProfileFormProps = {
  fullName: string;
};

export function ProfileForm({ fullName }: ProfileFormProps) {
  const [state, formAction, isPending] = useActionState(
    updateProfileAction,
    {},
  );

  return (
    <form action={formAction} className="profile-form">
      <label className="form-field">
        Nama lengkap
        <TextInput
          autoComplete="name"
          defaultValue={fullName}
          maxLength={80}
          name="fullName"
          required
        />
      </label>
      {state.error && <Notice tone="error">{state.error}</Notice>}
      {state.success && <Notice tone="success">{state.success}</Notice>}
      <Button disabled={isPending} type="submit">
        {isPending ? "Menyimpan..." : "Simpan profil"}
      </Button>
    </form>
  );
}

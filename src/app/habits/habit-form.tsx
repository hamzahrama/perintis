"use client";

import { useActionState } from "react";
import { Button, Notice, TextInput } from "@/components/ui";
import { createHabitAction } from "./actions";

export function HabitForm() {
  const [state, action, pending] = useActionState(createHabitAction, {});
  return (
    <form action={action} className="goal-form">
      <label className="form-field">Nama habit<TextInput name="name" maxLength={100} placeholder="Contoh: Push-up 10 menit" required /></label>
      <label className="form-field">Catatan (opsional)<TextInput name="description" maxLength={500} placeholder="Opsional" /></label>
      <label className="form-field">Kait ke goal (opsional)<TextInput name="goalId" placeholder="ID goal" /></label>
      {state.error && <Notice tone="error">{state.error}</Notice>}
      {state.success && <Notice tone="success">{state.success}</Notice>}
      <Button disabled={pending} type="submit">{pending ? "Menyimpan..." : "Tambah habit"}</Button>
    </form>
  );
}
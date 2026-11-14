"use client";

import { useActionState } from "react";

import { Button, Notice, TextInput } from "@/components/ui";
import { createGoalAction } from "./actions";

export type GoalFormState = {
  error?: string;
  success?: string;
};

export function GoalForm() {
  const [state, formAction, isPending] = useActionState(createGoalAction, {});

  return (
    <form action={formAction} className="goal-form">
      {state.error && <Notice tone="error">{state.error}</Notice>}
      {state.success && <Notice tone="success">{state.success}</Notice>}

      <label className="form-field">
        Judul goal
        <TextInput
          maxLength={200}
          name="title"
          placeholder="Contoh: Lebih konsisten latihan 3x seminggu"
          required
        />
      </label>

      <label className="form-field">
        Deskripsi (opsional)
        <TextInput
          maxLength={1000}
          name="description"
          placeholder="Catatan singkat tentang tujuanmu."
        />
      </label>

      <label className="form-field">
        Kategori (opsional)
        <TextInput maxLength={100} name="category" placeholder="Contoh: kesehatan, karir, belajar" />
      </label>

      <label className="form-field">
        Target tanggal (opsional)
        <TextInput name="target_date" type="date" />
      </label>

      <Button disabled={isPending} type="submit">
        {isPending ? "Menyimpan..." : "Simpan goal"}
      </Button>
    </form>
  );
}

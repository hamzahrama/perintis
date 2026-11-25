"use client";

import { useActionState } from "react";

import { Button, Notice, TextInput } from "@/components/ui";
import { updateGoalAction } from "./actions";

type GoalEditFormProps = {
  initialData: {
    goalId: string;
    title: string;
    description: string | null;
    category: string | null;
    target_date: string | null;
    status: "active" | "archived";
  };
};

export function GoalEditForm({ initialData }: GoalEditFormProps) {
  const [state, formAction, isPending] = useActionState(updateGoalAction, {});

  return (
    <form action={formAction} className="goal-form">
      <input type="hidden" name="goalId" value={initialData.goalId} />
      {state.error && <Notice tone="error">{state.error}</Notice>}
      {state.success && <Notice tone="success">{state.success}</Notice>}

      <label className="form-field">
        Judul goal
        <TextInput
          defaultValue={initialData.title}
          maxLength={200}
          name="title"
          placeholder="Contoh: Lebih konsisten latihan 3x seminggu"
          required
        />
      </label>

      <label className="form-field">
        Deskripsi (opsional)
        <TextInput
          defaultValue={initialData.description ?? ""}
          maxLength={1000}
          name="description"
          placeholder="Catatan singkat tentang tujuanmu."
        />
      </label>

      <label className="form-field">
        Kategori (opsional)
        <TextInput
          defaultValue={initialData.category ?? ""}
          maxLength={100}
          name="category"
          placeholder="Contoh: kesehatan, karir, belajar"
        />
      </label>

      <label className="form-field">
        Target tanggal (opsional)
        <TextInput
          defaultValue={initialData.target_date ?? ""}
          name="target_date"
          type="date"
        />
      </label>

      <label className="form-field">
        Status
        <select className="field" name="status" defaultValue={initialData.status}>
          <option value="active">Aktif</option>
          <option value="archived">Diarsipkan</option>
        </select>
      </label>

      <Button disabled={isPending} type="submit">
        {isPending ? "Menyimpan..." : "Simpan perubahan"}
      </Button>
    </form>
  );
}
"use client";

import { useActionState } from "react";
import { Button, Notice, TextInput } from "@/components/ui";
import { editCommitmentAction } from "./actions";

type CommitmentEditFormProps = {
  commitmentId: string;
  description: string;
  goalId: string | null;
  activityId: string | null;
};

export function CommitmentEditForm({ commitmentId, description, goalId, activityId }: CommitmentEditFormProps) {
  const [state, action, pending] = useActionState(editCommitmentAction, {});

  return (
    <form action={action} className="goal-form">
      <input type="hidden" name="commitmentId" value={commitmentId} />
      <label className="form-field">
        Komitmen
        <TextInput name="description" defaultValue={description} maxLength={500} required />
      </label>
      <label className="form-field">
        Kait ke goal (opsional)
        <TextInput name="goalId" defaultValue={goalId ?? ""} placeholder="Kosongkan jika umum" />
      </label>
      <label className="form-field">
        Kait ke aktivitas (opsional)
        <TextInput name="activityId" defaultValue={activityId ?? ""} placeholder="Kosongkan jika umum" />
      </label>
      <p className="section-description">Hindari komitmen yang menyakiti, mempermalukan, mengganggu kebutuhan dasar, atau membebani finansial.</p>
      {state.error && <Notice tone="error">{state.error}</Notice>}
      {state.success && <Notice tone="success">{state.success}</Notice>}
      <Button disabled={pending} type="submit">{pending ? "Menyimpan..." : "Simpan perubahan"}</Button>
    </form>
  );
}

"use client";

import { useActionState } from "react";
import { Button, Notice, TextInput } from "@/components/ui";
import { updateHabitAction, deleteHabitAction } from "./actions";

type HabitEditFormProps = {
  habitId: string;
  name: string;
  description: string | null;
  goalId: string | null;
  isActive: boolean;
};

export function HabitEditForm({ habitId, name, description, goalId, isActive }: HabitEditFormProps) {
  const [state, action, pending] = useActionState(updateHabitAction, {});

  return (
    <form action={action} className="goal-form">
      <input type="hidden" name="habitId" value={habitId} />
      {state.error && <Notice tone="error">{state.error}</Notice>}
      {state.success && <Notice tone="success">{state.success}</Notice>}

      <label className="form-field">
        Nama habit
        <TextInput defaultValue={name} maxLength={100} name="name" required />
      </label>

      <label className="form-field">
        Catatan (opsional)
        <TextInput defaultValue={description ?? ""} maxLength={500} name="description" />
      </label>

      <label className="form-field">
        Goal ID (opsional)
        <TextInput defaultValue={goalId ?? ""} name="goalId" />
      </label>

      <label className="form-field">
        <input type="checkbox" name="isActive" defaultChecked={isActive} /> Aktif
      </label>

      <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
        <Button disabled={pending} type="submit">
          {pending ? "Menyimpan..." : "Simpan"}
        </Button>
      </div>
    </form>
  );
}

export function HabitDeleteForm({ habitId }: { habitId: string }) {
  const [state, action, pending] = useActionState(deleteHabitAction, {});

  return (
    <form action={action} className="archive-form">
      <input type="hidden" name="habitId" value={habitId} />
      {state.error && <Notice tone="error">{state.error}</Notice>}
      {state.success && <Notice tone="success">{state.success}</Notice>}
      <Button disabled={pending} type="submit" variant="ghost">
        {pending ? "Menghapus..." : "Hapus"}
      </Button>
    </form>
  );
}
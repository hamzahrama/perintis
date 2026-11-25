"use client";

import { useActionState } from "react";
import { Button, Notice, TextInput } from "@/components/ui";
import { logHabitAction } from "./actions";

export function HabitLogForm({ habitId }: { habitId: string }) {
  const [state, action, pending] = useActionState(logHabitAction, {});

  return (
    <form action={action} className="goal-form">
      <input type="hidden" name="habitId" value={habitId} />
      <label className="form-field">Tanggal
        <TextInput name="logDate" type="date" required />
      </label>
      <label className="form-field">Catatan (opsional)
        <TextInput name="note" maxLength={500} placeholder="Catatan singkat" />
      </label>
      {state.error && <Notice tone="error">{state.error}</Notice>}
      {state.success && <Notice tone="success">{state.success}</Notice>}
      <Button disabled={pending} type="submit">
        {pending ? "Mencatat..." : "Catat"}
      </Button>
    </form>
  );
}
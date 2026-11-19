"use client";

import { useActionState } from "react";
import { Button, Notice } from "@/components/ui";
import { toggleHabitActiveAction } from "./actions";

export function ToggleHabitActiveForm({ habitId, isActive }: { habitId: string; isActive: boolean }) {
  const [state, action, pending] = useActionState(toggleHabitActiveAction, {});

  return (
    <form action={action} className="toggle-form">
      <input type="hidden" name="habitId" value={habitId} />
      <input type="hidden" name="isActive" value={String(!isActive)} />
      {state.error && <Notice tone="error">{state.error}</Notice>}
      {state.success && <Notice tone="success">{state.success}</Notice>}
      <Button disabled={pending} type="submit" variant="ghost">
        {pending ? "..." : isActive ? "Nonaktifkan" : "Aktifkan"}
      </Button>
    </form>
  );
}
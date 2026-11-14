"use client";

import { useActionState } from "react";
import { Button, Notice } from "@/components/ui";
import { archiveGoalAction } from "./actions";

export function ArchiveButton({ goalId }: { goalId: string }) {
  const [state, action, isPending] = useActionState(archiveGoalAction, {});
  return (
    <form action={action} className="archive-form">
      <input type="hidden" name="goalId" value={goalId} />
      {state.error && <Notice tone="error">{state.error}</Notice>}
      {state.success && <Notice tone="success">{state.success}</Notice>}
      <Button disabled={isPending} type="submit" variant="ghost">
        {isPending ? "Mengarsipkan..." : "Arsipkan"}
      </Button>
    </form>
  );
}
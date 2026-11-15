"use client";

import { useActionState } from "react";
import { Button, Notice } from "@/components/ui";
import { updateActivityStatusAction } from "./actions";

export function ActivityStatusForm({ activityId, status }: { activityId: string; status: string }) {
  const [state, action, pending] = useActionState(updateActivityStatusAction, {});
  return (
    <form action={action} className="activity-status-form">
      <input type="hidden" name="activityId" value={activityId} />
      <select className="field" name="status" defaultValue={status} aria-label="Status aktivitas" disabled={pending}>
        <option value="not_started">Belum mulai</option>
        <option value="in_progress">Berjalan</option>
        <option value="completed">Selesai</option>
      </select>
      <Button disabled={pending} type="submit" variant="secondary">Simpan</Button>
      {state.error && <Notice tone="error">{state.error}</Notice>}
      {state.success && <Notice tone="success">{state.success}</Notice>}
    </form>
  );
}

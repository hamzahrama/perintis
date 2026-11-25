"use client";

import { useActionState } from "react";
import { Button, Notice, TextInput } from "@/components/ui";
import {
  updateActivityStatusAction,
  rescheduleActivityAction,
  skipActivityAction,
  reopenActivityAction,
} from "./actions";

export type ActivityStatus = "not_started" | "in_progress" | "completed" | "rescheduled" | "skipped";

interface ActivityStatusFormProps {
  activityId: string;
  status: ActivityStatus;
  scheduledAt?: string | null;
}

export function ActivityStatusForm({ activityId, status, scheduledAt }: ActivityStatusFormProps) {
  const [statusState, statusAction, statusPending] = useActionState(updateActivityStatusAction, {});
  const [rescheduleState, rescheduleAction, reschedulePending] = useActionState(rescheduleActivityAction, {});
  const [skipState, skipAction, skipPending] = useActionState(skipActivityAction, {});
  const [reopenState, reopenAction, reopenPending] = useActionState(reopenActivityAction, {});

  return (
    <div className="activity-status-form">
      <form action={statusAction}>
        <input type="hidden" name="activityId" value={activityId} />
        <select
          className="field"
          name="status"
          defaultValue={status}
          aria-label="Status aktivitas"
          disabled={statusPending || reschedulePending || skipPending || reopenPending}
        >
          <option value="not_started">Belum mulai</option>
          <option value="in_progress">Sedang berjalan</option>
          <option value="completed">Selesai</option>
          <option value="rescheduled">Dijadwalkan ulang</option>
          <option value="skipped">Dilewati</option>
        </select>
        <Button disabled={statusPending} type="submit" variant="secondary">
          Simpan status
        </Button>
      </form>

      {statusState.error && <Notice tone="error">{statusState.error}</Notice>}
      {statusState.success && <Notice tone="success">{statusState.success}</Notice>}

      <div style={{ display: "grid", gap: "0.5rem", marginTop: "0.5rem" }}>
        {status !== "completed" && (
          <form action={rescheduleAction} className="activity-reschedule-form">
            <input type="hidden" name="activityId" value={activityId} />
            <label htmlFor={`reschedule-${activityId}`}>Jadwal baru</label>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <TextInput
                id={`reschedule-${activityId}`}
                type="datetime-local"
                name="newScheduledAt"
                defaultValue={scheduledAt ? new Date(scheduledAt).toISOString().slice(0, 16) : ""}
                required
                style={{ flex: 1, minWidth: "12rem" }}
              />
              <Button type="submit" disabled={reschedulePending} variant="secondary">
                {reschedulePending ? "..." : "Reschedule"}
              </Button>
            </div>
          </form>
        )}

        {status !== "completed" && status !== "skipped" && (
          <form action={skipAction}>
            <input type="hidden" name="activityId" value={activityId} />
            <Button type="submit" disabled={skipPending} variant="ghost">
              {skipPending ? "..." : "Skip"}
            </Button>
          </form>
        )}

        {(status === "completed" || status === "skipped") && (
          <form action={reopenAction}>
            <input type="hidden" name="activityId" value={activityId} />
            <Button type="submit" disabled={reopenPending} variant="secondary">
              {reopenPending ? "..." : "Buka kembali"}
            </Button>
          </form>
        )}
      </div>

      {rescheduleState.error && <Notice tone="error">{rescheduleState.error}</Notice>}
      {rescheduleState.success && <Notice tone="success">{rescheduleState.success}</Notice>}
      {skipState.error && <Notice tone="error">{skipState.error}</Notice>}
      {skipState.success && <Notice tone="success">{skipState.success}</Notice>}
      {reopenState.error && <Notice tone="error">{reopenState.error}</Notice>}
      {reopenState.success && <Notice tone="success">{reopenState.success}</Notice>}
    </div>
  );
}
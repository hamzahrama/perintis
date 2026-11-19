"use client";

import { useActionState } from "react";
import { Button, Notice, TextInput } from "@/components/ui";
import { saveReminderAction } from "./actions";

export function ReminderForm({ activities }: { activities: { id: string; title: string }[] }) {
  const [state, action, pending] = useActionState(saveReminderAction, {});
  return <form action={action} className="goal-form"><label className="form-field">Aktivitas<select className="field" name="activityId" required><option value="">Pilih aktivitas</option>{activities.map((a) => <option key={a.id} value={a.id}>{a.title}</option>)}</select></label><label className="form-field">Waktu reminder<TextInput type="datetime-local" name="remindAt" required /></label>{state.error && <Notice tone="error">{state.error}</Notice>}{state.success && <Notice tone="success">{state.success}</Notice>}<Button disabled={pending} type="submit">{pending ? "Menyimpan..." : "Simpan reminder"}</Button></form>;
}
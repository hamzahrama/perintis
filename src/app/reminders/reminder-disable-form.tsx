"use client";

import { useActionState } from "react";
import { Button, Notice } from "@/components/ui";
import { disableReminderAction } from "./actions";

export function ReminderDisableForm({ reminderId }: { reminderId: string }) {
  const [state, action, pending] = useActionState(disableReminderAction, {});
  return <form action={action}><input type="hidden" name="reminderId" value={reminderId} />{state.error && <Notice tone="error">{state.error}</Notice>}{state.success && <Notice tone="success">{state.success}</Notice>}<Button disabled={pending} type="submit" variant="ghost">{pending ? "..." : "Nonaktifkan"}</Button></form>;
}
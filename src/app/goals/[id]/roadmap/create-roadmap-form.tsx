"use client";

import { useActionState } from "react";
import { Button, Notice } from "@/components/ui";
import { createRoadmapAction } from "./actions";

export function CreateRoadmapForm({ goalId }: { goalId: string }) {
  const [state, action, pending] = useActionState(createRoadmapAction, {});
  return <form action={action} className="goal-form"><input type="hidden" name="goalId" value={goalId} />{state.error && <Notice tone="error">{state.error}</Notice>}{state.success && <Notice tone="success">{state.success}</Notice>}<Button disabled={pending} type="submit">{pending ? "Membuat..." : "Buat roadmap"}</Button></form>;
}
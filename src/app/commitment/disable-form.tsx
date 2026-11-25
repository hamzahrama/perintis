"use client";

import { useActionState } from "react";
import { Button, Notice } from "@/components/ui";
import { disableCommitmentAction } from "./actions";

export function DisableCommitmentForm({ commitmentId }: { commitmentId: string }) { const [state, action, pending] = useActionState(disableCommitmentAction, {}); return <form action={action}><input type="hidden" name="commitmentId" value={commitmentId} />{state.error && <Notice tone="error">{state.error}</Notice>}{state.success && <Notice tone="success">{state.success}</Notice>}<Button disabled={pending} type="submit" variant="ghost">{pending ? "..." : "Nonaktifkan"}</Button></form>; }
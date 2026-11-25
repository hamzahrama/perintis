"use client";

import { useActionState } from "react";
import { Button, Notice, TextInput } from "@/components/ui";
import { saveCommitmentAction } from "./actions";

export function CommitmentForm() {
  const [state, action, pending] = useActionState(saveCommitmentAction, {});
  return <form action={action} className="goal-form"><label className="form-field">Komitmen<TextInput name="description" maxLength={500} placeholder="Contoh: Jika terlewat, saya akan menyesuaikan jadwal tanpa menyalahkan diri." required /></label><p className="section-description">Hindari komitmen yang menyakiti, mempermalukan, mengganggu kebutuhan dasar, atau membebani finansial.</p>{state.error && <Notice tone="error">{state.error}</Notice>}{state.success && <Notice tone="success">{state.success}</Notice>}<Button disabled={pending} type="submit">{pending ? "Menyimpan..." : "Simpan komitmen"}</Button></form>;
}
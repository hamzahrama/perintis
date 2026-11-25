"use client";

import { useActionState } from "react";
import { Button, Notice, TextInput } from "@/components/ui";
import { createActivityAction } from "./actions";

export function ActivityForm() {
  const [state, action, pending] = useActionState(createActivityAction, {});
  return (
    <form action={action} className="goal-form">
      <label className="form-field">Judul aktivitas<TextInput name="title" maxLength={200} placeholder="Contoh: Latihan 20 menit" required /></label>
      <label className="form-field">Catatan (opsional)<TextInput name="description" maxLength={1000} placeholder="Langkah kecil yang ingin kamu lakukan." /></label>
      <label className="form-field">Jadwal (opsional)<TextInput name="scheduledAt" type="datetime-local" /></label>
      {state.error && <Notice tone="error">{state.error}</Notice>}
      {state.success && <Notice tone="success">{state.success}</Notice>}
      <Button disabled={pending} type="submit">{pending ? "Menyimpan..." : "Tambah aktivitas"}</Button>
    </form>
  );
}

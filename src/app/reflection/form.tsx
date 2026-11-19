"use client";

import { useActionState } from "react";
import { Button, Notice, TextInput } from "@/components/ui";
import { saveReflectionAction } from "./actions";

export function ReflectionForm() {
  const [state, action, pending] = useActionState(saveReflectionAction, {});
  return (
    <form action={action} className="goal-form">
      <label className="form-field">Tanggal<TextInput type="date" name="reflectionDate" defaultValue={new Date().toISOString().slice(0, 10)} required /></label>
      <label className="form-field">Apa yang berjalan baik?<textarea name="wins" maxLength={500} placeholder="Contoh: menyelesaikan langkah kecil" /></label>
      <label className="form-field">Apa hambatanmu?<textarea name="blockers" maxLength={500} placeholder="Contoh: jadwal padat" /></label>
      {state.error && <Notice tone="error">{state.error}</Notice>}
      {state.success && <Notice tone="success">{state.success}</Notice>}
      <Button disabled={pending} type="submit">{pending ? "Menyimpan..." : "Simpan refleksi"}</Button>
    </form>
  );
}

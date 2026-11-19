"use client";

import { useState } from "react";
import { useActionState } from "react";
import { Button, Notice, TextInput } from "@/components/ui";
import { saveTimezoneAction } from "./timezone-actions";

export function TimezoneForm() {
  const [state, action, pending] = useActionState(saveTimezoneAction, {});
  const [detected] = useState(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone ?? null;
    } catch {
      return null;
    }
  });

  return (
    <form action={action} className="profile-form">
      <label className="form-field">
        Zona waktu (IANA)
        <TextInput
          name="timezone"
          defaultValue={detected ?? ""}
          placeholder="Contoh: Asia/Jakarta"
          maxLength={100}
          required
        />
        {detected && <p style={{ marginTop: "0.25rem", fontSize: "0.875rem", color: "var(--muted)" }}>Terdeteksi otomatis: {detected}</p>}
      </label>
      {state.error && <Notice tone="error">{state.error}</Notice>}
      {state.success && <Notice tone="success">{state.success}</Notice>}
      <Button disabled={pending} type="submit">{pending ? "Menyimpan..." : "Simpan zona waktu"}</Button>
    </form>
  );
}

export function TimezoneDisplay({ timezone }: { timezone: string | null }) {
  if (!timezone) return null;
  return (
    <div style={{ marginTop: "1rem", padding: "1rem", background: "var(--card-bg)", borderRadius: "var(--radius)", border: "1px solid var(--border)" }}>
      <strong>Zona waktu aktif:</strong> <code>{timezone}</code>
    </div>
  );
}
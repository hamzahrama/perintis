"use client";

import { useActionState, useRef } from "react";
import { Button, Notice } from "@/components/ui";
import { saveNextStepAction } from "./actions";

export function NextStepForm({ goalId }: { goalId: string }) {
  const [state, action, pending] = useActionState(saveNextStepAction, {});
  const formRef = useRef<HTMLFormElement>(null);

  const handleIntentSubmit = (intent: "save" | "defer" | "skip") => {
    const intentInput = formRef.current?.querySelector('input[name="intent"]') as HTMLInputElement | null;
    if (intentInput) intentInput.value = intent;
    formRef.current?.requestSubmit();
  };

  return (
    <form ref={formRef} action={action} className="goal-form">
      <input type="hidden" name="goalId" value={goalId} />
      <fieldset className="form-field">
        <legend>Pilih opsi yang relevan (maksimal 3)</legend>
        <label className="form-field"><input type="checkbox" name="choice" value="habit" /> Latih habit harian (3x seminggu)</label>
        <label className="form-field"><input type="checkbox" name="choice" value="learn" /> Pelajari konsep dasar (30 menit)</label>
        <label className="form-field"><input type="checkbox" name="choice" value="read" /> Baca satu bab buku</label>
      </fieldset>
      <label className="form-field">Tulis tindakan sendiri (opsional)
        <textarea className="field" name="custom" placeholder="Contoh: Tulis 200 kata jurnal." maxLength={500} style={{ minHeight: "4rem", resize: "vertical" }} />
      </label>
      {state.error && <Notice tone="error">{state.error}</Notice>}
      {state.success && <Notice tone="success">{state.success}</Notice>}
      <div className="form-actions">
        <input type="hidden" name="intent" value="save" />
        <Button disabled={pending} type="submit" fullWidth>{pending ? "Menyimpan..." : "Simpan pilihan"}</Button>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
          <button type="button" className="button button--secondary" disabled={pending} onClick={() => handleIntentSubmit("defer")}>
            Tunda
          </button>
          <button type="button" className="button button--ghost" disabled={pending} onClick={() => handleIntentSubmit("skip")}>
            Lewati
          </button>
        </div>
      </div>
    </form>
  );
}